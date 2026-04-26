import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { runResearch } from "./services/researchService.js";
import { findEmail } from "./services/emailFinder.js";
import { draftEmails } from "./services/emailDrafter.js";
import { searchMulti, fetchPageText } from "./services/webSearch.js";
import { diagnoseKeys } from "./services/azureClient.js";

import authRoutes from "./routes/auth.js";

import { Company } from "./models/Company.js";
import { Lead } from "./models/Lead.js";
import { IntelligenceCache } from "./models/IntelligenceCache.js";
import { ActivityFeedModel } from "./models/ActivityFeed.js";
import { EmailTemplate } from "./models/EmailTemplate.js";
import { EmailCache } from "./models/EmailCache.js";
import { CompanyNote } from "./models/CompanyNote.js";
import { Person } from "./models/Person.js";
import { Sequence } from "./models/Sequence.js";

dotenv.config();

async function connectDB(retries = 3) {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/signalz";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log("[db] Connected to MongoDB at", uri);
      return;
    } catch (err: any) {
      console.error(`[db] MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  console.log("[db] Local MongoDB not available. Starting in-memory MongoDB...");
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log("[db] Connected to in-memory MongoDB at", memUri);
    console.log("[db] NOTE: Data will not persist across restarts. Install MongoDB or use Atlas for persistence.");
  } catch (memErr: any) {
    console.error("[db] In-memory MongoDB also failed:", memErr.message);
    console.error("[db] Install MongoDB: https://www.mongodb.com/try/download/community");
    console.error("[db] Or set MONGODB_URI in .env to a MongoDB Atlas connection string.");
    process.exit(1);
  }
}

async function startServer() {
  await connectDB();

  const keyDiag = diagnoseKeys();
  if (!keyDiag.anyAvailable) {
    console.warn("\n╔══════════════════════════════════════════════════════════════╗");
    console.warn("║  ⚠  NO AI API KEYS CONFIGURED                               ║");
    console.warn("║  Research will use web-search fallbacks (lower quality).      ║");
    console.warn("║  Create a .env file from .env.example with your API keys:     ║");
    console.warn("║    ANTHROPIC_API_KEY, AZURE_OPENAI_API_KEY                    ║");
    console.warn("╚══════════════════════════════════════════════════════════════╝\n");
  } else {
    console.log("[startup] AI models configured: " + keyDiag.configured.join(", "));
    if (keyDiag.missing.length > 0) console.log("[startup] Missing (optional): " + keyDiag.missing.join(", "));
  }

  const app = express();
  const PORT = parseInt(process.env.PORT || "5000", 10);

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
  app.get("/api/health", (_req, res) => res.json({ status: "ok", version: "3.0-mern", ai: keyDiag }));

  // --- Auth ---
  app.use("/api/auth", authRoutes);

  // ============ Accounts (Companies) ============
  app.get("/api/accounts", async (_req, res) => {
    try {
      const accounts = await Company.find().sort({ lastActivity: -1 });
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const account = await Company.create(req.body);
      res.json(account);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const account = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(account);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      await Company.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Watchlist Companies ============
  app.get("/api/watchlist/companies", async (_req, res) => {
    try {
      const companies = await Company.find();
      res.json(companies);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/watchlist/companies", async (req, res) => {
    try {
      const company = await Company.create(req.body);
      res.json({ success: true, id: company._id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/watchlist/companies/:id", async (req, res) => {
    try {
      await Company.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Watchlist People ============
  app.get("/api/watchlist/people", async (_req, res) => {
    try {
      const people = await Person.find();
      res.json(people);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/watchlist/people", async (req, res) => {
    try {
      const person = await Person.create(req.body);
      res.json({ success: true, id: person._id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/watchlist/people/:id", async (req, res) => {
    try {
      await Person.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Notes ============
  app.get("/api/notes/:companyId", async (req, res) => {
    try {
      const note = await CompanyNote.findOne({ companyId: req.params.companyId });
      res.json(note || { companyId: req.params.companyId, notes: "" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/notes/:companyId", async (req, res) => {
    try {
      await CompanyNote.findOneAndUpdate(
        { companyId: req.params.companyId },
        { companyId: req.params.companyId, notes: req.body.notes, updatedAt: new Date() },
        { upsert: true },
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ AI Intelligence ============
  app.post("/api/ai/intelligence", async (req, res) => {
    const { query, jsonMode, skipCache, userProfile, enableEmailFinding, enableActivityMining } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    if (jsonMode !== false && !skipCache) {
      try {
        const cached = await IntelligenceCache.findOne({ companyName: query.toLowerCase() });
        if (cached) {
          const ageHours = (Date.now() - cached.createdAt.getTime()) / 3600000;
          if (ageHours < (cached.ttlHours || 24)) {
            console.log("[intelligence] cache hit for '" + query + "' (age " + Math.round(ageHours * 10) / 10 + "h)");
            return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: cached.data }] }], status: "completed", fromCache: true });
          }
        }
      } catch {}
    }

    try {
      console.log("[intelligence] starting research for: " + query);
      const research = await runResearch({
        company: query,
        userProfile,
        enableEmailFinding: enableEmailFinding !== false,
        enableActivityMining: enableActivityMining !== false,
      });

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

      try {
        await IntelligenceCache.findOneAndUpdate(
          { companyName: query.toLowerCase() },
          { companyName: query.toLowerCase(), data: resultText, createdAt: new Date() },
          { upsert: true },
        );
      } catch {}

      try {
        await ActivityFeedModel.create({
          type: "research",
          title: "Researched " + query,
          description: "Intelligence report generated. Quality: " + research.meta.dataQuality + ", People: " + research.meta.peopleCount,
          company: query,
        });
      } catch {}

      // Auto-save as account if not exists
      try {
        const existing = await Company.findOne({ name: { $regex: new RegExp("^" + query + "$", "i") } });
        if (!existing) {
          await Company.create({
            name: research.company.name || query,
            industry: research.company.industry || "",
            website: research.company.website || "",
            employees: research.company.size || "",
            intentScore: research.company.intentScore?.score || 50,
            status: "Research",
            lastActivity: new Date(),
          });
        } else {
          await Company.findByIdAndUpdate(existing._id, {
            intentScore: research.company.intentScore?.score || existing.intentScore,
            industry: research.company.industry || existing.industry,
            employees: research.company.size || existing.employees,
            lastActivity: new Date(),
          });
        }
      } catch {}

      // Auto-save discovered key people as leads
      try {
        const keyPeople = research.keyPeople || [];
        for (const person of keyPeople) {
          if (!person.name) continue;
          const existingLead = await Lead.findOne({
            name: { $regex: new RegExp("^" + person.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
            company: { $regex: new RegExp("^" + (research.company.name || query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
          });
          if (!existingLead) {
            await Lead.create({
              name: person.name,
              title: person.title || "",
              company: research.company.name || query,
              email: person.email || "",
              linkedin: person.linkedin || "",
              score: research.company.intentScore?.score || 50,
              status: "New",
              notes: person.activity?.bestHook || "",
            });
          }
        }
      } catch {}

      return res.json({ output: [{ type: "message", content: [{ type: "output_text", text: resultText }] }], status: "completed" });
    } catch (err: any) {
      console.error("[intelligence] FATAL: ", err);
      return res.status(500).json({ error: "Research failed: " + err.message });
    }
  });

  // ============ Web Search ============
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

  // ============ Email Finder ============
  app.post("/api/email/find", async (req, res) => {
    const { name, company, domain } = req.body;
    if (!name || !domain) return res.status(400).json({ error: "name and domain required" });

    const cacheKey = (name + "|" + (company || "") + "|" + domain).toLowerCase();
    try {
      const cached = await EmailCache.findOne({ cacheKey });
      if (cached) {
        const ageDays = (Date.now() - cached.createdAt.getTime()) / 86400000;
        if (ageDays < 30) return res.json({ ...JSON.parse(cached.data), fromCache: true });
      }
    } catch {}

    try {
      const result = await findEmail(name, company || domain, domain);
      try {
        await EmailCache.findOneAndUpdate(
          { cacheKey },
          { cacheKey, data: JSON.stringify(result), createdAt: new Date() },
          { upsert: true },
        );
      } catch {}
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ error: "Email lookup failed: " + e.message });
    }
  });

  // ============ Stock ============
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

  // ============ Logo ============
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

  // ============ Cache ============
  app.get("/api/cache/:company", async (req, res) => {
    try {
      const row = await IntelligenceCache.findOne({ companyName: req.params.company.toLowerCase() });
      if (!row) return res.json({ cached: false });
      const ageHours = (Date.now() - row.createdAt.getTime()) / 3600000;
      if (ageHours > row.ttlHours) {
        await IntelligenceCache.deleteOne({ _id: row._id });
        return res.json({ cached: false });
      }
      return res.json({ cached: true, data: JSON.parse(row.data), ageHours: Math.round(ageHours) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/cache/:company", async (req, res) => {
    try {
      const name = req.params.company;
      await IntelligenceCache.findOneAndUpdate(
        { companyName: name.toLowerCase() },
        { companyName: name.toLowerCase(), data: JSON.stringify(req.body.data), createdAt: new Date() },
        { upsert: true },
      );
      await ActivityFeedModel.create({
        type: "research",
        title: "Researched " + name,
        description: "Intelligence report generated",
        company: name,
      });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Leads ============
  app.get("/api/leads", async (_req, res) => {
    try {
      const leads = await Lead.find().sort({ createdAt: -1 });
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const { name, title, company, email, linkedin, score, status, notes } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      const lead = await Lead.create({ name, title, company, email, linkedin, score, status, notes });
      await ActivityFeedModel.create({
        type: "lead",
        title: "Lead added: " + name,
        description: (title || "") + " at " + (company || ""),
        company: company || "",
      });
      res.json({ id: lead._id, ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      await Lead.findByIdAndUpdate(req.params.id, req.body);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      await Lead.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Sequences ============
  app.get("/api/sequences", async (_req, res) => {
    try {
      const sequences = await Sequence.find().sort({ createdAt: -1 });
      res.json(sequences);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/sequences", async (req, res) => {
    try {
      const sequence = await Sequence.create(req.body);
      res.json(sequence);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/sequences/:id", async (req, res) => {
    try {
      const sequence = await Sequence.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(sequence);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/sequences/:id", async (req, res) => {
    try {
      await Sequence.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Templates ============
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await EmailTemplate.find().sort({ createdAt: -1 });
      res.json(templates);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const { name, subject, body, company } = req.body;
      if (!name || !subject || !body) return res.status(400).json({ error: "name, subject, body required" });
      const template = await EmailTemplate.create({ name, subject, body, company });
      res.json({ id: template._id, ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      await EmailTemplate.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Activity Feed ============
  app.get("/api/activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const items = await ActivityFeedModel.find().sort({ createdAt: -1 }).limit(limit);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ Lead Score ============
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

  // ============ LinkedIn Profile (Real web search - no simulated data) ============
  app.post("/api/linkedin/parse", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "LinkedIn URL is required." });
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const username = pathParts[pathParts.length - 1] || "user";
      const formattedName = username.split("-").filter(p => !/^\d+$/.test(p)).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      // Attempt real web search for this LinkedIn profile
      const searchResults = await searchMulti(`"${formattedName}" site:linkedin.com/in`, 5);
      let headline = "";
      let summary = "";

      for (const r of searchResults) {
        if (r.url.includes("linkedin.com/in")) {
          if (r.snippet) {
            headline = r.snippet.split(".")[0].trim().slice(0, 120);
            summary = r.snippet.trim();
            break;
          }
        }
      }

      // Try to get more info from broader search
      const infoResults = await searchMulti(`"${formattedName}" ${username} experience role`, 5);
      const experiences: any[] = [];
      for (const r of infoResults) {
        if (r.snippet && r.snippet.toLowerCase().includes(formattedName.toLowerCase())) {
          const snippet = r.snippet.trim();
          if (snippet.length > 20) {
            summary = summary || snippet;
            break;
          }
        }
      }

      if (!headline) headline = "Professional profile";
      if (!summary) summary = "Profile information could not be fully retrieved. Connect on LinkedIn for more details.";

      res.json({
        full_name: formattedName,
        headline,
        summary,
        experiences,
        education: [],
        profile_pic_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=random&size=200`,
        source: "web_search",
        note: "Data sourced from public web search results. For full profile data, configure PROXYCURL_API_KEY.",
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to parse LinkedIn profile: " + err.message });
    }
  });

  // ============ Vite Middleware ============
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Signalz server running on http://localhost:${PORT}`));
}

startServer();
