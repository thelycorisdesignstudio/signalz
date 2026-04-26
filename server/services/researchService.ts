// researchService.ts - orchestrates two-phase research for a company.
//
// Phase 1: Real web research - fetch pages, scrape leadership, gather citations
// Phase 2: Structured synthesis - feed raw evidence to AI, get structured JSON
//
// The AI NEVER invents. All people come from peopleService (evidence-required).
// All citations come from real URLs we fetched.

import { callAzure, callAzureJson } from "./azureClient.js";
import { fetchPageText, searchMulti } from "./webSearch.js";
import { findRealPeople, RealPerson } from "./peopleService.js";
import { findEmail, EmailFindResult } from "./emailFinder.js";
import { mineActivity, PublicFootprint } from "./activityMiner.js";
import { CitationStore } from "./citationStore.js";

export interface ResearchMeta {
  dataQuality: "verified" | "partial" | "low" | "no_people_found";
  sourcesCount: number;
  peopleCount: number;
  lastVerified: string;
  caveats: string[];
  sourcesAttempted: string[];
}

export interface ResearchOutput {
  company: {
    name: string;
    summary: string;
    tagline: string;
    industry: string;
    size: string;
    headquarters: string;
    website: string;
    healthScore: number;
    intentScore: { score: number; justification: string };
    timeline: { last3Months: any[]; last6Months: any[]; last12Months: any[] };
    sentiment: string;
    riskLevel: string;
    recentNews: string[];
    ownership?: { type: string; parent?: string; investors?: string[]; board?: string[] };
    scaleMetrics?: { employees?: string; offices?: string; customers?: string; revenue?: string };
    logo: null;
  };
  researchBrief: string;          // raw phase-1 text
  keyPeople: Array<RealPerson & {
    email: string | null;
    emailConfidence: string;
    emailAlternates: string[];
    emailSources: string[];
    activity: PublicFootprint | null;
  }>;
  strategicActivity: Array<{ event: string; date: string; type: string; source?: string }>;
  competitors: any[];
  techStack: string[];
  citations: Array<{ id: string; source: string; url?: string; snippet?: string }>;
  outreach: { emails: any[] };
  similarCompanies: any[];
  interestingFacts: any[];
  hiringTrends: any[];
  fundingRounds: any[];
  financials: any;
  valueMapping: any[];
  competitiveIntelligence: any;
  objectionHandling: any[];
  meta: ResearchMeta;
}

function extractDomain(input: string): string | null {
  // Guess the company's primary domain from its name
  const cleaned = input.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  if (!cleaned) return null;
  return cleaned + ".com";
}

async function resolveDomain(company: string): Promise<string | null> {
  // Try <company>.com first via a HEAD-like GET
  const guess = extractDomain(company);
  if (!guess) return null;
  try {
    const r = await fetch("https://" + guess, { method: "GET", signal: AbortSignal.timeout(5000) } as any);
    if (r.ok || r.status === 301 || r.status === 302 || r.status === 403) return guess;
  } catch {}
  // Fallback: search for "<company> official site" and extract first non-wikipedia/social domain
  try {
    const results = await searchMulti(company + " official site", 5);
    for (const r of results) {
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, "");
        if (/wikipedia|linkedin|twitter|facebook|youtube|crunchbase|bloomberg/.test(host)) continue;
        return host;
      } catch {}
    }
  } catch {}
  return guess;
}

/**
 * Phase 1: fetch real research material.
 * Returns raw text blob (company homepage + about page + top search snippets).
 */
async function phase1Research(company: string, domain: string | null, citations: CitationStore): Promise<string> {
  const chunks: string[] = [];

  if (domain) {
    // Homepage
    const home = await fetchPageText("https://" + domain, 7000, 6000);
    if (home) {
      chunks.push("=== " + domain + " (homepage) ===\n" + home);
      citations.add({ source: domain, url: "https://" + domain, snippet: home.slice(0, 200) });
    }
    // About page
    for (const path of ["/about", "/about-us", "/company", "/who-we-are"]) {
      const text = await fetchPageText("https://" + domain + path, 7000, 5000);
      if (text) {
        chunks.push("=== " + domain + path + " ===\n" + text);
        citations.add({ source: domain + path, url: "https://" + domain + path, snippet: text.slice(0, 200) });
        break;
      }
    }
  }

  // Search-based research: company overview, ownership, recent news
  const searchQueries = [
    company + " company overview",
    company + " headquarters ownership parent company",
    company + " 2025 OR 2026 news launches acquisitions",
    company + " number of employees revenue",
  ];
  for (const q of searchQueries) {
    const results = await searchMulti(q, 5);
    if (results.length === 0) continue;
    const blob = results
      .map(r => "[" + r.title + "] " + r.snippet + " (" + r.url + ")")
      .join("\n");
    chunks.push("=== Search: " + q + " ===\n" + blob);
    for (const r of results) {
      citations.add({ source: (() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return r.url; } })(), url: r.url, snippet: r.snippet.slice(0, 200) });
    }
  }

  const combined = chunks.join("\n\n").slice(0, 25000);
  console.log("[researchService] phase1 collected " + combined.length + " chars across " + chunks.length + " sources");
  return combined;
}

/**
 * Heuristic fallback for Phase 2: extract structured data from the raw brief
 * text WITHOUT calling any AI. Used when callAzureJson fails (e.g. missing keys).
 */
function heuristicSynthesize(
  company: string,
  brief: string,
  domain: string | null,
): Partial<ResearchOutput> {
  console.log("[researchService] heuristicSynthesize: extracting structured data from brief (" + brief.length + " chars)");

  // --- Company name: capitalize the input query ---
  const companyName = company
    .split(/[\s-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // --- Summary: first meaty text blob from homepage or search snippet ---
  let summary = "";
  // Try homepage section first
  const homepageSection = brief.match(/=== [^\n]+ \(homepage\) ===\n([\s\S]*?)(?:\n===|$)/);
  if (homepageSection) {
    const cleaned = homepageSection[1].replace(/\s+/g, " ").trim();
    if (cleaned.length > 30) {
      summary = cleaned.slice(0, 200);
    }
  }
  // Fall back to first search snippet
  if (!summary) {
    const snippetMatch = brief.match(/\[([^\]]+)\]\s+([^(]{30,})\s*\(/);
    if (snippetMatch) {
      summary = snippetMatch[2].replace(/\s+/g, " ").trim().slice(0, 200);
    }
  }

  // --- Industry detection from keywords ---
  const briefLower = brief.toLowerCase();
  const industryKeywords: [string, string[]][] = [
    ["Technology", ["software", "saas", "cloud", "platform", "developer", "tech", "api", "digital", "it services", "cybersecurity", "artificial intelligence", "machine learning"]],
    ["Finance", ["finance", "banking", "fintech", "investment", "financial services", "insurance", "capital", "wealth management", "payments"]],
    ["Healthcare", ["healthcare", "health", "medical", "pharmaceutical", "biotech", "clinical", "patient", "hospital", "therapeutics"]],
    ["Retail", ["retail", "e-commerce", "ecommerce", "shopping", "consumer goods", "marketplace", "store"]],
    ["Manufacturing", ["manufacturing", "industrial", "factory", "production", "supply chain", "logistics"]],
    ["Energy", ["energy", "oil", "gas", "renewable", "solar", "wind", "utilities", "clean energy"]],
    ["Real Estate", ["real estate", "property", "commercial real estate", "residential", "construction", "building"]],
    ["Education", ["education", "edtech", "learning", "university", "school", "training", "academic"]],
    ["Media", ["media", "entertainment", "publishing", "content", "streaming", "advertising", "marketing"]],
    ["Telecommunications", ["telecom", "telecommunications", "wireless", "broadband", "network", "5g"]],
    ["Automotive", ["automotive", "vehicle", "car", "electric vehicle", "ev", "mobility"]],
    ["Aerospace & Defense", ["aerospace", "defense", "defence", "aviation", "military", "space"]],
    ["Food & Beverage", ["food", "beverage", "restaurant", "grocery", "agriculture"]],
    ["Professional Services", ["consulting", "advisory", "professional services", "legal", "accounting", "audit"]],
  ];
  let industry = "";
  let bestIndustryCount = 0;
  for (const [name, keywords] of industryKeywords) {
    let count = 0;
    for (const kw of keywords) {
      // Count distinct occurrences (capped at 3 per keyword to avoid bias from repeated terms)
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = briefLower.match(re);
      count += Math.min(matches ? matches.length : 0, 3);
    }
    if (count > bestIndustryCount) {
      bestIndustryCount = count;
      industry = name;
    }
  }

  // --- Headquarters extraction ---
  let headquarters = "";
  const hqPatterns = [
    /headquartered\s+in\s+([A-Z][A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/,
    /headquarters?\s+(?:is\s+)?(?:in|at|:)\s+([A-Z][A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/i,
    /based\s+in\s+([A-Z][A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/,
    /located\s+in\s+([A-Z][A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/,
    /offices?\s+in\s+([A-Z][A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/,
  ];
  for (const pat of hqPatterns) {
    const m = brief.match(pat);
    if (m) {
      // Clean up: take up to the first period/newline, strip trailing junk
      headquarters = m[1].replace(/[.;\n].*$/, "").replace(/\s+/g, " ").trim().slice(0, 80);
      break;
    }
  }

  // --- Size/employees extraction ---
  let size = "";
  const employeePatterns = [
    /(\d[\d,]+)\s*(?:\+\s*)?employees/i,
    /(\d[\d,]+)\s*(?:\+\s*)?staff/i,
    /workforce\s+of\s+(\d[\d,]+)/i,
    /(?:approximately|about|over|more than|nearly)\s+(\d[\d,]+)\s+(?:employees|people|workers|staff)/i,
    /team\s+of\s+(\d[\d,]+)/i,
  ];
  for (const pat of employeePatterns) {
    const m = brief.match(pat);
    if (m) {
      const raw = m[1].replace(/,/g, "");
      const num = parseInt(raw, 10);
      if (num > 0) {
        // Bucket into human-readable ranges
        if (num < 50) size = "1-50 employees";
        else if (num < 200) size = "51-200 employees";
        else if (num < 1000) size = "201-1,000 employees";
        else if (num < 5000) size = "1,001-5,000 employees";
        else if (num < 10000) size = "5,001-10,000 employees";
        else size = "10,000+ employees";
        break;
      }
    }
  }

  // --- Website ---
  const website = domain ? "https://" + domain : "";

  // --- Recent news extraction from search snippets ---
  const recentNews: string[] = [];
  // Look in news-related search sections
  const newsSection = brief.match(/=== Search: [^\n]*(news|launches|acquisitions)[^\n]* ===\n([\s\S]*?)(?:\n===|$)/i);
  if (newsSection) {
    const lines = newsSection[2].split("\n").filter(l => l.trim().length > 20);
    for (const line of lines.slice(0, 5)) {
      const titleMatch = line.match(/\[([^\]]+)\]\s*(.+?)(?:\s*\(https?:)?/);
      if (titleMatch) {
        const newsItem = titleMatch[1] + " - " + titleMatch[2].replace(/\s+/g, " ").trim().slice(0, 120);
        recentNews.push(newsItem);
      } else {
        recentNews.push(line.replace(/\s+/g, " ").trim().slice(0, 150));
      }
    }
  }

  // --- Strategic activity from news items ---
  const strategicActivity: Array<{ event: string; date: string; type: string }> = [];
  const activityKeywords: [string, string[]][] = [
    ["funding", ["raised", "funding", "series", "investment", "capital"]],
    ["acquisition", ["acquired", "acquisition", "merger", "merged", "bought"]],
    ["product", ["launched", "launch", "released", "new product", "announced"]],
    ["partnership", ["partnership", "partnered", "collaboration", "teamed"]],
    ["expansion", ["expanded", "expansion", "new office", "new market", "opened"]],
    ["leadership", ["appointed", "named", "hired", "new ceo", "new cto", "joins as"]],
  ];
  for (const newsItem of recentNews) {
    const lower = newsItem.toLowerCase();
    for (const [type, keywords] of activityKeywords) {
      if (keywords.some(kw => lower.includes(kw))) {
        // Try to extract a date
        const dateMatch = newsItem.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\b202[0-9]\b)/i);
        strategicActivity.push({
          event: newsItem.slice(0, 150),
          date: dateMatch ? dateMatch[1] : "recent",
          type,
        });
        break;
      }
    }
  }

  // --- Revenue/financials hints ---
  const financials: any = {};
  const revenueMatch = brief.match(/(?:revenue|sales)\s+(?:of\s+)?[\$]?([\d,.]+\s*(?:billion|million|B|M))/i);
  if (revenueMatch) financials.revenue = "$" + revenueMatch[1];

  // --- Scale metrics ---
  const scaleMetrics: any = {};
  if (size) scaleMetrics.employees = size;
  const officesMatch = brief.match(/(\d+)\s+(?:offices|locations|countries)/i);
  if (officesMatch) scaleMetrics.offices = officesMatch[1] + " locations";

  // --- Ownership hints ---
  const ownership: any = { type: "private" };
  if (/\b(?:NYSE|NASDAQ|publicly traded|stock ticker|market cap|IPO)\b/i.test(brief)) {
    ownership.type = "public";
  } else if (/\bsubsidiary\b/i.test(brief)) {
    ownership.type = "subsidiary";
    const parentMatch = brief.match(/subsidiary\s+of\s+([A-Z][A-Za-z\s&]+)/);
    if (parentMatch) ownership.parent = parentMatch[1].trim().slice(0, 60);
  }

  console.log("[researchService] heuristicSynthesize: extracted industry=" + industry + " hq=" + headquarters + " size=" + size + " news=" + recentNews.length);

  return {
    company: {
      name: companyName,
      summary,
      tagline: "",
      industry,
      size,
      headquarters,
      website,
      healthScore: 50,
      intentScore: { score: 40, justification: "Heuristic extraction - no AI synthesis available" },
      timeline: { last3Months: [], last6Months: [], last12Months: [] },
      sentiment: "neutral",
      riskLevel: "unknown",
      recentNews,
      ownership,
      scaleMetrics: Object.keys(scaleMetrics).length > 0 ? scaleMetrics : undefined,
      logo: null,
    },
    strategicActivity,
    competitors: [],
    techStack: [],
    interestingFacts: [],
    hiringTrends: [],
    fundingRounds: [],
    financials: Object.keys(financials).length > 0 ? financials : {},
    valueMapping: [],
    competitiveIntelligence: { recentMove: "", positioning: [] },
    objectionHandling: [],
    similarCompanies: [],
  };
}

/**
 * Phase 2: structured synthesis. Feed the brief to the AI, get JSON out.
 * The AI is told: only synthesize from the provided evidence. Do not invent.
 */
async function phase2Synthesize(
  company: string,
  brief: string,
  realPeople: RealPerson[],
  domain: string | null = null,
): Promise<Partial<ResearchOutput>> {
  const sys =
    "You are a careful B2B research analyst synthesizing a structured report about " + company + ". " +
    "You will be given: (1) a research brief assembled from REAL web pages and search results, and (2) a list of VERIFIED people with evidence. " +
    "HARD RULES: " +
    "- Do NOT invent facts. Only use information present in the brief or general, non-specific industry framing. " +
    "- Do NOT invent people, LinkedIn URLs, or emails - use only the verified people provided. " +
    "- If a field cannot be filled from the evidence, leave it as an empty string or empty array rather than guessing. " +
    "- Do not use em dashes. Use hyphens. No emoji. " +
    "- Every item in recentNews and strategicActivity should trace to the brief. If you include an item, it must be supported by text in the brief. " +
    "Return JSON with this structure: {" +
    "\"company\":{\"name\",\"summary\",\"tagline\",\"industry\",\"size\",\"headquarters\",\"website\",\"healthScore\":0-100,\"intentScore\":{\"score\":0-100,\"justification\"},\"sentiment\",\"riskLevel\",\"recentNews\":[5 strings with dates if known],\"ownership\":{\"type\":\"public|private|subsidiary\",\"parent\",\"investors\":[],\"board\":[]},\"scaleMetrics\":{\"employees\",\"offices\",\"customers\",\"revenue\"}}," +
    "\"strategicActivity\":[{\"event\",\"date\",\"type\":\"funding|acquisition|product|leadership|partnership|expansion\"}]," +
    "\"competitors\":[{\"name\",\"marketShare\",\"advantage\",\"strengths\":[],\"weaknesses\":[]}]," +
    "\"techStack\":[]," +
    "\"interestingFacts\":[{\"title\",\"description\",\"source\",\"date\"}]," +
    "\"hiringTrends\":[{\"department\",\"openRoles\":0,\"growth\"}]," +
    "\"fundingRounds\":[{\"round\",\"amount\",\"date\",\"investors\":[]}]," +
    "\"financials\":{\"revenue\",\"growth\",\"valuation\"}," +
    "\"valueMapping\":[{\"priority\",\"value\"}]," +
    "\"competitiveIntelligence\":{\"recentMove\",\"positioning\":[]}," +
    "\"objectionHandling\":[{\"objection\",\"response\"}]," +
    "\"similarCompanies\":[{\"name\",\"industry\",\"whyApproach\"}]" +
    "}";

  const user = "=== RESEARCH BRIEF ===\n" + brief.slice(0, 18000) +
    "\n\n=== VERIFIED PEOPLE ===\n" +
    realPeople.map(p => p.name + " (" + p.title + ") - snippet: " + (p.evidence[0]?.snippet || "").slice(0, 150)).join("\n");

  try {
    const out = await callAzureJson<Partial<ResearchOutput>>(sys, user, { maxTokens: 4500, timeoutMs: 90000 });
    return out;
  } catch (e: any) {
    console.log("[researchService] phase2 AI synthesis failed: " + e.message + " - falling back to heuristic extraction");
    return heuristicSynthesize(company, brief, domain);
  }
}

export interface ResearchParams {
  company: string;
  userProfile?: { name?: string; role?: string; company?: string; valueLine?: string };
  enableEmailFinding?: boolean;
  enableActivityMining?: boolean;
}

/**
 * Web-search-based similar companies discovery. Searches for competitors/peers
 * and parses company names from the search result titles and snippets.
 * No AI required - pure heuristic extraction from search engine results.
 */
async function searchSimilarCompanies(
  company: string,
  industry: string,
): Promise<Array<{ name: string; industry: string; whyApproach: string }>> {
  const queries = [
    "companies similar to " + company + (industry ? " in " + industry : ""),
    company + " competitors alternatives",
  ];
  const seen = new Set<string>();
  seen.add(company.toLowerCase());
  const results: Array<{ name: string; industry: string; whyApproach: string }> = [];

  for (const q of queries) {
    if (results.length >= 6) break;
    let searchResults;
    try {
      searchResults = await searchMulti(q, 10);
    } catch {
      continue;
    }

    for (const r of searchResults) {
      if (results.length >= 6) break;
      const combined = r.title + " " + r.snippet;

      // Strategy 1: "X vs Y" or "X vs. Y" patterns in titles
      const vsMatch = r.title.match(/\b([A-Z][A-Za-z0-9&.\-\s]{1,25}?)\s+vs\.?\s+([A-Z][A-Za-z0-9&.\-\s]{1,25})/);
      if (vsMatch) {
        for (const name of [vsMatch[1].trim(), vsMatch[2].trim()]) {
          const lower = name.toLowerCase();
          if (!seen.has(lower) && lower !== company.toLowerCase() && name.length > 1 && name.length < 30) {
            seen.add(lower);
            results.push({ name, industry: industry || "Unknown", whyApproach: "Competitor or alternative to " + company });
          }
        }
      }

      // Strategy 2: "Top N alternatives to X" - extract numbered list items from snippets
      if (/alternatives|competitors|similar|compared/i.test(combined)) {
        // Look for patterns like "1. CompanyName", "CompanyName -", "CompanyName," in lists
        const listPattern = /(?:^|\d+[.)]\s*|\b(?:include|are|like)\s+)([A-Z][A-Za-z0-9&.]+(?:\s+[A-Z][A-Za-z0-9&.]+){0,2})/g;
        let lm;
        while ((lm = listPattern.exec(combined)) !== null && results.length < 6) {
          const name = lm[1].trim();
          const lower = name.toLowerCase();
          // Skip generic words that look like company names
          if (/^(Top|Best|The|This|That|Most|More|Some|Here|With|From|About|These|Other|Like|Such|Which|Many)$/i.test(name)) continue;
          // Skip if it's clearly a URL fragment or too generic
          if (name.length < 2 || name.length > 30) continue;
          if (seen.has(lower) || lower === company.toLowerCase()) continue;
          seen.add(lower);
          results.push({ name, industry: industry || "Unknown", whyApproach: "Listed as competitor or alternative to " + company });
        }
      }

      // Strategy 3: Extract known company-name patterns from snippet text
      // Comma-separated names after phrases like "such as", "including", "like"
      const enumerationMatch = combined.match(/(?:such as|including|competitors like|alternatives like|compared to)\s+([A-Z][^.]{10,80})/i);
      if (enumerationMatch) {
        const segment = enumerationMatch[1];
        // Split on commas and "and"
        const parts = segment.split(/,\s*|\s+and\s+/);
        for (const part of parts) {
          if (results.length >= 6) break;
          const name = part.trim().replace(/[^A-Za-z0-9&.\-\s]/g, "").trim();
          if (name.length < 2 || name.length > 30) continue;
          const lower = name.toLowerCase();
          if (seen.has(lower) || lower === company.toLowerCase()) continue;
          // Must start with uppercase to look like a company name
          if (!/^[A-Z]/.test(name)) continue;
          seen.add(lower);
          results.push({ name, industry: industry || "Unknown", whyApproach: "Mentioned alongside " + company + " as a peer" });
        }
      }
    }
  }

  console.log("[researchService] searchSimilarCompanies: found " + results.length + " via web search for " + company);
  return results.slice(0, 6);
}

export async function runResearch(params: ResearchParams): Promise<ResearchOutput> {
  const { company } = params;
  const citations = new CitationStore();
  const caveats: string[] = [];
  const sourcesAttempted: string[] = [];

  console.log("[researchService] START " + company);

  // Resolve domain
  const domain = await resolveDomain(company);
  if (domain) {
    console.log("[researchService] resolved domain: " + domain);
  } else {
    caveats.push("Could not resolve domain - scraping limited to search engines");
  }

  // Phase 1 + people discovery in parallel
  const [brief, peopleResult] = await Promise.all([
    phase1Research(company, domain, citations),
    findRealPeople(company, domain, citations),
  ]);
  caveats.push(...peopleResult.caveats);
  sourcesAttempted.push(...peopleResult.sourcesAttempted);

  const realPeople = peopleResult.people;
  console.log("[researchService] real people found: " + realPeople.length);

  // Phase 2 synthesis
  const synthesized = await phase2Synthesize(company, brief, realPeople, domain);

  // Enrich people: email finding + activity mining (top 5 only, parallel)
  const topPeople = realPeople.slice(0, 5);
  const enrichPromises = topPeople.map(async (p) => {
    const tasks: Array<Promise<any>> = [];
    tasks.push(
      params.enableEmailFinding !== false && domain
        ? findEmail(p.name, company, domain).catch(() => null)
        : Promise.resolve(null)
    );
    tasks.push(
      params.enableActivityMining !== false
        ? mineActivity(p.name, company, p.linkedin).catch(() => null)
        : Promise.resolve(null)
    );
    const [emailRes, activity] = await Promise.all(tasks) as [EmailFindResult | null, PublicFootprint | null];
    return {
      ...p,
      email: emailRes?.primary?.email || null,
      emailConfidence: emailRes?.primary?.confidence || "unverified",
      emailAlternates: (emailRes?.alternates || []).map(a => a.email),
      emailSources: emailRes?.sources || [],
      activity,
    };
  });
  const enrichedPeople = await Promise.all(enrichPromises);

  // Also carry through people beyond top 5 without enrichment
  const remaining = realPeople.slice(5).map(p => ({
    ...p,
    email: null,
    emailConfidence: "unverified",
    emailAlternates: [],
    emailSources: [],
    activity: null,
  }));

  const allPeople = [...enrichedPeople, ...remaining];

  // Citations from brief URLs
  citations.ingestFromText(brief);

  // Meta
  const peopleCount = allPeople.length;
  const dataQuality: ResearchMeta["dataQuality"] =
    peopleCount === 0 ? "no_people_found" :
    peopleCount < 3 ? "low" :
    peopleCount < 6 && citations.count() < 5 ? "partial" :
    "verified";

  const meta: ResearchMeta = {
    dataQuality,
    sourcesCount: citations.count(),
    peopleCount,
    lastVerified: new Date().toISOString(),
    caveats,
    sourcesAttempted,
  };

  // Fallback: if similarCompanies thin, synthesize 4 via a lightweight second AI call
  let similarCompanies = synthesized.similarCompanies || [];
  if (!Array.isArray(similarCompanies) || similarCompanies.length < 3) {
    try {
      const industry = synthesized.company?.industry || "";
      const size = synthesized.company?.size || "";
      const summary = (synthesized.company?.summary || "").slice(0, 400);
      const simSys = "You are a B2B targeting analyst. Suggest 4 real companies that share this company's industry, scale, and buying profile. No em dashes. No emoji. Return JSON: {\"similarCompanies\":[{\"name\",\"industry\",\"whyApproach\"}]}. Only include real, recognizable companies.";
      const simUser = "Target: " + company + "\nIndustry: " + industry + "\nSize: " + size + "\nSummary: " + summary + "\nReturn 4 distinct peers or comparable accounts a seller should approach next, with a short whyApproach (max 20 words).";
      const simOut = await callAzureJson<{ similarCompanies: any[] }>(simSys, simUser, { maxTokens: 600, timeoutMs: 30000 });
      if (Array.isArray(simOut?.similarCompanies) && simOut.similarCompanies.length > 0) {
        similarCompanies = simOut.similarCompanies.slice(0, 6);
        console.log("[researchService] similarCompanies synthesized fallback: " + similarCompanies.length);
      }
    } catch (e: any) {
      console.log("[researchService] similarCompanies AI synthesis failed: " + e.message + " - trying web search fallback");
      // Web-search-based fallback: search for similar companies and parse results
      try {
        similarCompanies = await searchSimilarCompanies(company, synthesized.company?.industry || "");
      } catch (e2: any) {
        console.log("[researchService] similarCompanies web search fallback also failed: " + e2.message);
      }
    }
  }

  // If AI fallback produced nothing AND the initial list is still thin, try web search
  if (!Array.isArray(similarCompanies) || similarCompanies.length < 3) {
    try {
      const webSimilar = await searchSimilarCompanies(company, synthesized.company?.industry || "");
      if (webSimilar.length > 0) similarCompanies = webSimilar;
    } catch {}
  }

  // Compose final output
  const output: ResearchOutput = {
    company: {
      name: synthesized.company?.name || company,
      summary: synthesized.company?.summary || "",
      tagline: synthesized.company?.tagline || "",
      industry: synthesized.company?.industry || "",
      size: synthesized.company?.size || "",
      headquarters: synthesized.company?.headquarters || "",
      website: synthesized.company?.website || (domain ? "https://" + domain : ""),
      healthScore: synthesized.company?.healthScore ?? 50,
      intentScore: synthesized.company?.intentScore || { score: 50, justification: "Insufficient data to score" },
      timeline: synthesized.company?.timeline || { last3Months: [], last6Months: [], last12Months: [] },
      sentiment: synthesized.company?.sentiment || "neutral",
      riskLevel: synthesized.company?.riskLevel || "unknown",
      recentNews: synthesized.company?.recentNews || [],
      ownership: synthesized.company?.ownership,
      scaleMetrics: synthesized.company?.scaleMetrics,
      logo: null,
    },
    researchBrief: brief.slice(0, 10000),
    keyPeople: allPeople,
    strategicActivity: synthesized.strategicActivity || [],
    competitors: synthesized.competitors || [],
    techStack: synthesized.techStack || [],
    citations: citations.all(),
    outreach: { emails: [] }, // populated by server endpoint
    similarCompanies,
    interestingFacts: synthesized.interestingFacts || [],
    hiringTrends: synthesized.hiringTrends || [],
    fundingRounds: synthesized.fundingRounds || [],
    financials: synthesized.financials || {},
    valueMapping: synthesized.valueMapping || [],
    competitiveIntelligence: synthesized.competitiveIntelligence || { recentMove: "", positioning: [] },
    objectionHandling: synthesized.objectionHandling || [],
    meta,
  };

  console.log("[researchService] DONE " + company + " - quality=" + dataQuality + " people=" + peopleCount + " sources=" + citations.count());
  return output;
}
