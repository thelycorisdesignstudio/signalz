import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";

import { runResearch } from "./src/services/researchService.js";
import { findEmail } from "./src/services/emailFinder.js";
import { draftEmails } from "./src/services/emailDrafter.js";
import { searchMulti, fetchPageText } from "./src/services/webSearch.js";
import { callAzure } from "./src/services/azureClient.js";

dotenv.config();

// Initialize Database
const db = new Database("signalz.db");

// Create tables (existing + new)
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, industry TEXT, website TEXT
  );
  CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, company TEXT, linkedin TEXT
  );
  CREATE TABLE IF NOT EXISTS company_notes (
    company_id TEXT PRIMARY KEY, notes TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS intelligence_cache (
    company_name TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL, ttl_hours INTEGER DEFAULT 24
  );
  CREATE TABLE IF NOT EXISTS saved_leads (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT, company TEXT, email TEXT, linkedin TEXT,
    score INTEGER DEFAULT 50, status TEXT DEFAULT 'New', notes TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, company TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS activity_feed (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, description TEXT, company TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_cache (
    cache_key TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_lookup_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, company TEXT, domain TEXT,
    primary_email TEXT, confidence TEXT, sources TEXT, created_at INTEGER NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json({ limit: "64kb" }));

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.removeHeader("X-Powered-By");
    next();
  });

  // --- Health ---
  app.get("/api/health", (_req, res) => res.json({ status: "ok", version: "2.0-ground-truth" }));

  // --- Watchlist Companies ---
  app.get("/api/watchlist/companies", (_req, res) => {
    res.json(db.prepare("SELECT * FROM companies").all());
  });
  app.post("/api/watchlist/companies", (req, res) => {
    const { id, name, industry, website } = req.body;
    db.prepare("INSERT INTO companies (id, name, industry, website) VALUES (?, ?, ?, ?)").run(id, name, industry, website);
    res.json({ success: true });
  });
  app.delete("/api/watchlist/companies/:id", (req, res) => {
    db.prepare("DELETE FROM companies WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Watchlist People ---
  app.get("/api/watchlist/people", (_req, res) => {
    res.json(db.prepare("SELECT * FROM people").all());
  });
  app.post("/api/watchlist/people", (req, res) => {
    const { id, name, role, company, linkedin } = req.body;
    db.prepare("INSERT INTO people (id, name, role, company, linkedin) VALUES (?, ?, ?, ?, ?)").run(id, name, role, company, linkedin);
    res.json({ success: true });
  });
  app.delete("/api/watchlist/people/:id", (req, res) => {
    db.prepare("DELETE FROM people WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Notes ---
  app.get("/api/notes/:companyId", (req, res) => {
    const note = db.prepare("SELECT * FROM company_notes WHERE company_id = ?").get(req.params.companyId);
    res.json(note || { company_id: req.params.companyId, notes: "" });
  });
  app.post("/api/notes/:companyId", (req, res) => {
    const { notes } = req.body;
    db.prepare(`INSERT INTO company_notes (company_id, notes, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(company_id) DO UPDATE SET notes = excluded.notes, updated_at = CURRENT_TIMESTAMP`).run(req.params.companyId, notes);
    res.json({ success: true });
  });

  // ============ AI Intelligence (rebuilt, ground-truth-first) ============
  app.post("/api/ai/intelligence", async (req, res) => {
    const { query, jsonMode, skipCache, userProfile, enableEmailFinding, enableActivityMining } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    // Cache check
    if (jsonMode !== false && !skipCache) {
      const cached = db.prepare("SELECT data, created_at, ttl_hours FROM intelligence_cache WHERE LOWER(company_name) = LOWER(?)").get(query) as any;
      if (cached) {
        const ageHours = (Date.now() - cached.created_at) / 3600000;
        if (ageHours < (cached.ttl_hours || 24)) {
          console.log("[intelligence] cache hit for '" + query + "' (age " + Math.round(ageHours * 10) / 10 + "h)");
          return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: cached.data }] }], status: "completed", fromCache: true });
        }
      }
    }

    try {
      console.log("[intelligence] starting research for: " + query);
      const research = await runResearch({
        company: query,
        userProfile,
        enableEmailFinding: enableEmailFinding !== false,
        enableActivityMining: enableActivityMining !== false,
      });

      // Generate outreach emails from enriched people
      try {
        const emails = await draftEmails(
          research.company.name,
          research.company.summary,
          research.strategicActivity.map((s: any) => s.event),
          research.keyPeople.slice(0, 3).map((p: any) => ({
            name: p.name,
            title: p.title,
            email: p.email,
            emailConfidence: p.emailConfidence,
            activityBestHook: p.activity?.bestHook || null,
            activityNarrative: p.activity?.publicNarrative || null,
          })),
          userProfile || {},
        );
        research.outreach = { emails };
      } catch (e: any) {
        console.log("[intelligence] outreach generation failed: " + e.message);
        research.outreach = { emails: [] };
      }

      const resultText = JSON.stringify(research);

      // Cache
      try {
        db.prepare("INSERT OR REPLACE INTO intelligence_cache (company_name, data, created_at) VALUES (?, ?, ?)").run(query, resultText, Date.now());
      } catch {}

      // Activity log
      try {
        db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
          Math.random().toString(36).substr(2, 9),
          "research",
          "Researched " + query,
          "Intelligence report generated. Quality: " + research.meta.dataQuality + ", People: " + research.meta.peopleCount,
          query,
          Date.now(),
        );
      } catch {}

      return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: resultText }] }], status: "completed" });
    } catch (err: any) {
      console.error("[intelligence] FATAL: ", err);
      return res.status(500).json({ error: "Research failed: " + err.message });
    }
  });

  // ============ Web search (exposes the engine for advanced use) ============
  app.get("/api/ai/websearch", async (req, res) => {
    const q = String(req.query.q || "").slice(0, 200);
    if (!q) return res.status(400).json({ error: "q param required" });
    try {
      const results = await searchMulti(q, 12);
      return res.json({ query: q, results });
    } catch (e: any) {
      return res.status(500).json({ error: "Search failed: " + e.message });
    }
  });

  // ============ Email finder ============
  app.post("/api/email/find", async (req, res) => {
    const { name, company, domain } = req.body;
    if (!name || !domain) return res.status(400).json({ error: "name and domain required" });

    const cacheKey = (name + "|" + (company || "") + "|" + domain).toLowerCase();
    const cached = db.prepare("SELECT data, created_at FROM email_cache WHERE cache_key = ?").get(cacheKey) as any;
    if (cached) {
      const ageDays = (Date.now() - cached.created_at) / (86400000);
      if (ageDays < 30) return res.json({ ...JSON.parse(cached.data), fromCache: true });
    }

    try {
      const result = await findEmail(name, company || domain, domain);
      db.prepare("INSERT OR REPLACE INTO email_cache (cache_key, data, created_at) VALUES (?, ?, ?)").run(
        cacheKey, JSON.stringify(result), Date.now()
      );
      db.prepare("INSERT INTO email_lookup_log (name, company, domain, primary_email, confidence, sources, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        name, company || "", domain,
        result.primary?.email || null, result.primary?.confidence || "none",
        JSON.stringify(result.sources), Date.now()
      );
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ error: "Email lookup failed: " + e.message });
    }
  });

  // --- Stock ---
  app.get("/api/stock/:symbol", async (req, res) => {
    const { symbol } = req.params;
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Signalz/1.0)" } });
      if (!r.ok) return res.status(404).json({ error: "Symbol not found" });
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      if (!meta) return res.status(404).json({ error: "No data" });
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose;
      const change = prev ? ((price - prev) / prev * 100) : 0;
      return res.json({
        symbol: meta.symbol, name: meta.longName || meta.shortName || symbol,
        price, change: parseFloat(change.toFixed(2)), currency: meta.currency,
        high52: meta.fiftyTwoWeekHigh, low52: meta.fiftyTwoWeekLow,
        dayHigh: meta.regularMarketDayHigh, dayLow: meta.regularMarketDayLow,
        volume: meta.regularMarketVolume, exchange: meta.fullExchangeName,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Stock fetch failed: " + err.message });
    }
  });

  // --- Logo ---
  app.get("/api/logo/:domain", async (req, res) => {
    const { domain } = req.params;
    try {
      const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
      const r = await fetch(url, { redirect: "follow" });
      if (!r.ok) return res.status(404).json({ error: "Logo not found" });
      const buf = await r.arrayBuffer();
      res.set("Content-Type", r.headers.get("content-type") || "image/png");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(buf));
    } catch {
      res.status(500).json({ error: "Logo fetch failed" });
    }
  });

  // --- Cache CRUD ---
  app.get("/api/cache/:company", (req, res) => {
    const name = req.params.company.toLowerCase();
    const row = db.prepare("SELECT data, created_at, ttl_hours FROM intelligence_cache WHERE LOWER(company_name) = ?").get(name) as any;
    if (!row) return res.json({ cached: false });
    const ageHours = (Date.now() - row.created_at) / 3600000;
    if (ageHours > row.ttl_hours) {
      db.prepare("DELETE FROM intelligence_cache WHERE LOWER(company_name) = ?").run(name);
      return res.json({ cached: false });
    }
    return res.json({ cached: true, data: JSON.parse(row.data), ageHours: Math.round(ageHours) });
  });
  app.post("/api/cache/:company", (req, res) => {
    const { data } = req.body;
    const name = req.params.company;
    db.prepare("INSERT OR REPLACE INTO intelligence_cache (company_name, data, created_at) VALUES (?, ?, ?)").run(name, JSON.stringify(data), Date.now());
    db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      Math.random().toString(36).substr(2, 9), "research", "Researched " + name, "Intelligence report generated", name, Date.now()
    );
    res.json({ ok: true });
  });

  // --- Leads ---
  app.get("/api/leads", (_req, res) => {
    res.json(db.prepare("SELECT * FROM saved_leads ORDER BY created_at DESC").all());
  });
  app.post("/api/leads", (req, res) => {
    const { name, title, company, email, linkedin, score, status, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO saved_leads (id, name, title, company, email, linkedin, score, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      id, name, title || "", company || "", email || "", linkedin || "", score || 50, status || "New", notes || "", Date.now()
    );
    db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      Math.random().toString(36).substr(2, 9), "lead", "Lead added: " + name, title + " at " + company, company, Date.now()
    );
    res.json({ id, ok: true });
  });
  app.put("/api/leads/:id", (req, res) => {
    const { status, score, notes } = req.body;
    db.prepare("UPDATE saved_leads SET status = COALESCE(?, status), score = COALESCE(?, score), notes = COALESCE(?, notes) WHERE id = ?").run(
      status, score, notes, req.params.id
    );
    res.json({ ok: true });
  });
  app.delete("/api/leads/:id", (req, res) => {
    db.prepare("DELETE FROM saved_leads WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  // --- Templates ---
  app.get("/api/templates", (_req, res) => {
    res.json(db.prepare("SELECT * FROM email_templates ORDER BY created_at DESC").all());
  });
  app.post("/api/templates", (req, res) => {
    const { name, subject, body, company } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: "name, subject, body required" });
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO email_templates (id, name, subject, body, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, name, subject, body, company || "", Date.now()
    );
    res.json({ id, ok: true });
  });
  app.delete("/api/templates/:id", (req, res) => {
    db.prepare("DELETE FROM email_templates WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  // --- Activity Feed ---
  app.get("/api/activity", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(db.prepare("SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT ?").all(limit));
  });

  // --- Lead Score ---
  app.post("/api/leads/score", (req, res) => {
    const { intelligence } = req.body;
    if (!intelligence) return res.status(400).json({ error: "intelligence required" });
    let score = 50;
    const intent = intelligence.company?.intentScore?.score || 0;
    const health = intelligence.company?.healthScore || 0;
    const hiring = (intelligence.hiringTrends || []).length;
    const funding = (intelligence.fundingRounds || []).length;
    const news = (intelligence.company?.recentNews || []).join(" ").toLowerCase();
    score += Math.round(intent * 0.3);
    score += Math.round(health * 0.1);
    if (hiring > 0) score += 10;
    if (funding > 0) score += 15;
    if (news.includes("expan") || news.includes("launch")) score += 5;
    if (news.includes("fund") || news.includes("raise")) score += 10;
    score = Math.min(100, Math.max(0, score));
    const signals: string[] = [];
    if (intent > 70) signals.push("High intent score");
    if (funding > 0) signals.push("Recent funding");
    if (hiring > 1) signals.push("Active hiring");
    if (news.includes("launch")) signals.push("Product launch detected");
    res.json({ score, signals, breakdown: { intentContrib: Math.round(intent * 0.3), healthContrib: Math.round(health * 0.1), fundingBonus: funding > 0 ? 15 : 0, hiringBonus: hiring > 0 ? 10 : 0 } });
  });

  // --- LinkedIn Profile Parser (simulated) ---
  app.post("/api/linkedin/parse", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "LinkedIn URL is required." });
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const username = pathParts[pathParts.length - 1] || "user";
      const formattedName = username.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      res.json({
        full_name: formattedName,
        headline: "Senior Executive | Driving Innovation at Top Tech",
        summary: "Experienced leader with a demonstrated history of working in the technology and services industry.",
        experiences: [
          { title: "Vice President", company: "Global Tech Corp", starts_at: { year: 2020, month: 3, day: 1 }, ends_at: null, description: "Leading strategic initiatives." },
          { title: "Director of Operations", company: "Innovate Solutions", starts_at: { year: 2015, month: 6, day: 1 }, ends_at: { year: 2020, month: 2, day: 28 }, description: "Managed daily operations." },
        ],
        education: [{ school: "University of Technology", degree_name: "Master of Business Administration", field_of_study: "Business Administration and Management", starts_at: { year: 2010, month: 9, day: 1 }, ends_at: { year: 2012, month: 5, day: 30 } }],
        profile_pic_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=random&size=200`,
      });
    } catch {
      res.status(500).json({ error: "Failed to parse LinkedIn profile." });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
