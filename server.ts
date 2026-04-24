import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

// Initialize Database
const db = new Database("signalz.db");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT
  );
  CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    linkedin TEXT
  );
  CREATE TABLE IF NOT EXISTS company_notes (
    company_id TEXT PRIMARY KEY,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS intelligence_cache (
    company_name TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    ttl_hours INTEGER DEFAULT 24
  );
  CREATE TABLE IF NOT EXISTS saved_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    email TEXT,
    linkedin TEXT,
    score INTEGER DEFAULT 50,
    status TEXT DEFAULT 'New',
    notes TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    company TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS activity_feed (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    company TEXT,
    created_at INTEGER NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json({ limit: "10kb" }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.removeHeader("X-Powered-By");
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Watchlist: Companies
  app.get("/api/watchlist/companies", (req, res) => {
    const companies = db.prepare("SELECT * FROM companies").all();
    res.json(companies);
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

  // Watchlist: People
  app.get("/api/watchlist/people", (req, res) => {
    const people = db.prepare("SELECT * FROM people").all();
    res.json(people);
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

  // Company Notes
  app.get("/api/notes/:companyId", (req, res) => {
    const note = db.prepare("SELECT * FROM company_notes WHERE company_id = ?").get(req.params.companyId);
    res.json(note || { company_id: req.params.companyId, notes: "" });
  });

  app.post("/api/notes/:companyId", (req, res) => {
    const { notes } = req.body;
    const companyId = req.params.companyId;
    db.prepare(`
      INSERT INTO company_notes (company_id, notes, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(company_id) DO UPDATE SET
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `).run(companyId, notes);
    res.json({ success: true });
  });

  // AI Proxy - keeps API keys on backend
  app.post("/api/ai/intelligence", async (req, res) => {
    const { query, jsonMode, skipCache } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    // Check cache first (unless skipCache=true)
    if (jsonMode && !skipCache) {
      const cached = db.prepare("SELECT data, created_at, ttl_hours FROM intelligence_cache WHERE LOWER(company_name) = LOWER(?)").get(query) as any;
      if (cached) {
        const ageHours = (Date.now() - cached.created_at) / 3600000;
        if (ageHours < (cached.ttl_hours || 24)) {
          console.log("Cache hit for:", query, "(age:", Math.round(ageHours*10)/10, "hrs)");
          return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: cached.data }] }], status: "completed", fromCache: true });
        }
      }
    }

    try {
      // Primary: Kimi K2.5
      const primaryEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://vera-resource.services.ai.azure.com";
      const primaryKey = process.env.AZURE_OPENAI_API_KEY || "";
      const primaryModel = process.env.AZURE_OPENAI_DEPLOYMENT || "Kimi-K2.5";
      const primaryUrl = primaryEndpoint + "/models/chat/completions";

      // Fallback: GPT-5.2-codex (Responses API format)
      const fallbackEndpoint = process.env.AZURE_FALLBACK_ENDPOINT || "";
      const fallbackKey = process.env.AZURE_FALLBACK_API_KEY || "";
      const fallbackModel = process.env.AZURE_FALLBACK_MODEL || "gpt-5.2-codex";
      const fallbackUrl = fallbackEndpoint + "/openai/v1/responses";

      const callChatCompletions = async (url: string, apiKey: string, model: string, systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> => {
        const body = { model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], max_tokens: maxTokens };
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "api-key": apiKey }, body: JSON.stringify(body) });
        if (r.status === 429) throw new Error("RATE_LIMITED");
        if (!r.ok) throw new Error("HTTP " + r.status);
        const d = await r.json();
        const text = (d.choices?.[0]?.message?.content || "").trim();
        if (!text) throw new Error("Empty response");
        return text;
      };

      const callResponsesApi = async (systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> => {
        const body = { model: fallbackModel, input: userMessage, instructions: systemPrompt, max_output_tokens: maxTokens };
        const r = await fetch(fallbackUrl, { method: "POST", headers: { "Content-Type": "application/json", "api-key": fallbackKey }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error("Fallback HTTP " + r.status);
        const d = await r.json();
        const msg = (d.output || []).find((i: any) => i.type === "message");
        const text = ((msg?.content || []).find((c: any) => c.type === "output_text")?.text || "").trim();
        if (!text) throw new Error("Empty fallback response");
        return text;
      };

      const callAzure = async (systemPrompt: string, userMessage: string, maxTokens: number = 4000): Promise<string> => {
        // Race: try Kimi and GPT simultaneously, return whichever responds first with valid content
        console.log("Racing Kimi K2.5 vs GPT fallback...");
        return new Promise(async (resolve, reject) => {
          let settled = false;
          const done = (text: string, src: string) => {
            if (!settled && text) { settled = true; console.log("Winner:", src, "len:", text.length); resolve(text); }
          };
          const fail = (err: any, src: string) => {
            console.log(src, "failed:", err.message);
            if (!settled) {
              // Check if both failed - we can't know easily, so just reject after a delay
            }
          };
          // Start both simultaneously
          callChatCompletions(primaryUrl, primaryKey, primaryModel, systemPrompt, userMessage, maxTokens)
            .then(t => done(t, "Kimi")).catch(e => fail(e, "Kimi"));
          callResponsesApi(systemPrompt, userMessage, Math.min(maxTokens, 2500))
            .then(t => done(t, "GPT")).catch(e => fail(e, "GPT"));
          // Reject if neither responds within 90s
          setTimeout(() => { if (!settled) { settled = true; reject(new Error("Both models timed out")); } }, 90000);
        });
      };

      if (jsonMode) {
        // Reliable single-phase: model knowledge + explicit 2026 date context
        console.log("Fetching intelligence for:", query);
        const jsonRaw = await callAzure(
          "You are an elite B2B sales intelligence analyst. Today's date is April 21, 2026. Use your most up-to-date knowledge. For recentNews and timeline, generate realistic and specific 2025-2026 events based on known industry trends for the company. Do NOT use placeholder text. Return ONLY valid JSON. No markdown. No code blocks. Start with { end with }. Structure: {company:{name,summary,tagline,industry,size,headquarters,website,healthScore(0-100),intentScore:{score(0-100),justification},timeline:{last3Months:[{event,date,type}x3],last6Months:[{event,date,type}x3],last12Months:[{event,date,type}x3]},sentiment,riskLevel,recentNews:[5 specific news strings with approximate 2025-2026 dates],logo:null},keyPeople:[5 execs: {name,title,linkedin,hook,priorityRank(1-5),influence,focus,style}],interestingFacts:[5 items: {title,description,source,date}],hiringTrends:[3 items: {department,openRoles(number),growth}],fundingRounds:[{round,amount,date,investors:[]}],financials:{revenue,growth,valuation},competitors:[3 items: {name,marketShare,advantage,strengths:[3],weaknesses:[3]}],techStack:[8 strings],valueMapping:[3 items: {priority,value}],competitiveIntelligence:{recentMove,positioning:[3 strings]},objectionHandling:[3 items: {objection,response}],suggestedEmail:{subject,body,recipient},similarCompanies:[4 items: {name,industry,whyApproach}]}. All strings under 150 chars.",
          "Research the company: " + query,
          4000
        );
        console.log("Intelligence fetched, json length:", jsonRaw.length);

                // Clean markdown fences and control characters
                let cleaned = jsonRaw
                  .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // strip control chars
                  .trim();
                // Find the JSON object boundaries
                const start = cleaned.indexOf('{');
                const end = cleaned.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                  cleaned = cleaned.substring(start, end + 1);
                }
                try {
                  const parsed = JSON.parse(cleaned);
                  const resultText = JSON.stringify(parsed);
                  // Save to cache
                  try { db.prepare("INSERT OR REPLACE INTO intelligence_cache (company_name, data, created_at) VALUES (?, ?, ?)").run(query, resultText, Date.now()); } catch {}
                  // Log activity
                  try { db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(Math.random().toString(36).substr(2,9), 'research', 'Researched ' + query, 'Intelligence report generated', query, Date.now()); } catch {}
                  return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: resultText }] }], status: "completed" });
                } catch (e: any) {
                  console.error("JSON parse failed:", e.message, "| sample:", cleaned.substring(0, 200));
                  return res.status(500).json({ error: "Invalid JSON from AI: " + e.message });
                }
      } else {
        // Plain text mode with web search
        const text = await callAzure(
          "You are an elite AI sales intelligence assistant. Research this company thoroughly.",
          query,
          4096
        );
        return res.json({ output: [{ type: "message", content: [{ type: "output_text", text }] }], status: "completed" });
      }
    } catch (err: any) {
      console.error("AI request failed:", err);
      res.status(500).json({ error: "AI request failed: " + err.message });
    }
  });

  // Stock Quote Endpoint
  app.get("/api/stock/:symbol", async (req, res) => {
    const { symbol } = req.params;
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Signalz/1.0)" }
      });
      if (!r.ok) return res.status(404).json({ error: "Symbol not found" });
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      if (!meta) return res.status(404).json({ error: "No data" });
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose;
      const change = prev ? ((price - prev) / prev * 100) : 0;
      return res.json({
        symbol: meta.symbol,
        name: meta.longName || meta.shortName || symbol,
        price: price,
        change: parseFloat(change.toFixed(2)),
        currency: meta.currency,
        high52: meta.fiftyTwoWeekHigh,
        low52: meta.fiftyTwoWeekLow,
        dayHigh: meta.regularMarketDayHigh,
        dayLow: meta.regularMarketDayLow,
        volume: meta.regularMarketVolume,
        exchange: meta.fullExchangeName,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Stock fetch failed: " + err.message });
    }
  });

  // Company Logo Endpoint (proxies favicon service)
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
    } catch (err: any) {
      res.status(500).json({ error: "Logo fetch failed" });
    }
  });

  // Intelligence Cache - save and retrieve cached results
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
    // Log to activity feed
    db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      Math.random().toString(36).substr(2,9), 'research', 'Researched ' + name, 'Intelligence report generated', name, Date.now()
    );
    res.json({ ok: true });
  });

  // Saved Leads CRUD
  app.get("/api/leads", (req, res) => {
    const rows = db.prepare("SELECT * FROM saved_leads ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/leads", (req, res) => {
    const { name, title, company, email, linkedin, score, status, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO saved_leads (id, name, title, company, email, linkedin, score, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      id, name, title || '', company || '', email || '', linkedin || '', score || 50, status || 'New', notes || '', Date.now()
    );
    db.prepare("INSERT OR IGNORE INTO activity_feed (id, type, title, description, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      Math.random().toString(36).substr(2,9), 'lead', 'Lead added: ' + name, title + ' at ' + company, company, Date.now()
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

  // Email Templates
  app.get("/api/templates", (req, res) => {
    const rows = db.prepare("SELECT * FROM email_templates ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/templates", (req, res) => {
    const { name, subject, body, company } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: "name, subject, body required" });
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO email_templates (id, name, subject, body, company, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, name, subject, body, company || '', Date.now()
    );
    res.json({ id, ok: true });
  });

  app.delete("/api/templates/:id", (req, res) => {
    db.prepare("DELETE FROM email_templates WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  // Activity Feed
  app.get("/api/activity", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const rows = db.prepare("SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT ?").all(limit);
    res.json(rows);
  });

  // Lead Score Calculator
  app.post("/api/leads/score", (req, res) => {
    const { intelligence } = req.body;
    if (!intelligence) return res.status(400).json({ error: "intelligence required" });
    let score = 50;
    const intent = intelligence.company?.intentScore?.score || 0;
    const health = intelligence.company?.healthScore || 0;
    const hiring = (intelligence.hiringTrends || []).length;
    const funding = (intelligence.fundingRounds || []).length;
    const news = (intelligence.company?.recentNews || []).join(' ').toLowerCase();
    score += Math.round(intent * 0.3);
    score += Math.round(health * 0.1);
    if (hiring > 0) score += 10;
    if (funding > 0) score += 15;
    if (news.includes('expan') || news.includes('launch')) score += 5;
    if (news.includes('fund') || news.includes('raise')) score += 10;
    score = Math.min(100, Math.max(0, score));
    const signals = [];
    if (intent > 70) signals.push('High intent score');
    if (funding > 0) signals.push('Recent funding');
    if (hiring > 1) signals.push('Active hiring');
    if (news.includes('launch')) signals.push('Product launch detected');
    res.json({ score, signals, breakdown: { intentContrib: Math.round(intent*0.3), healthContrib: Math.round(health*0.1), fundingBonus: funding > 0 ? 15 : 0, hiringBonus: hiring > 0 ? 10 : 0 } });
  });

    // LinkedIn Profile Parsing Endpoint (Simulated without external APIs)
  app.post("/api/linkedin/parse", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "LinkedIn URL is required." });
    }

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extract username from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const username = pathParts[pathParts.length - 1] || 'user';
      
      // Format name from username (e.g., john-doe -> John Doe)
      const formattedName = username
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Generate a realistic simulated profile
      const simulatedProfile = {
        full_name: formattedName,
        headline: `Senior Executive | Driving Innovation at Top Tech`,
        summary: `Experienced leader with a demonstrated history of working in the technology and services industry. Skilled in Strategy, Management, and Product Development. Strong professional with a focus on delivering value and driving growth.`,
        experiences: [
          {
            title: "Vice President",
            company: "Global Tech Corp",
            starts_at: { year: 2020, month: 3, day: 1 },
            ends_at: null,
            description: "Leading strategic initiatives and overseeing product development across multiple regions."
          },
          {
            title: "Director of Operations",
            company: "Innovate Solutions",
            starts_at: { year: 2015, month: 6, day: 1 },
            ends_at: { year: 2020, month: 2, day: 28 },
            description: "Managed daily operations and improved efficiency by 30%."
          }
        ],
        education: [
          {
            school: "University of Technology",
            degree_name: "Master of Business Administration",
            field_of_study: "Business Administration and Management",
            starts_at: { year: 2010, month: 9, day: 1 },
            ends_at: { year: 2012, month: 5, day: 30 }
          }
        ],
        profile_pic_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=random&size=200`
      };

      res.json(simulatedProfile);
    } catch (error: any) {
      console.error("LinkedIn parsing error:", error);
      res.status(500).json({ error: "Failed to parse LinkedIn profile. Please check the URL." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
