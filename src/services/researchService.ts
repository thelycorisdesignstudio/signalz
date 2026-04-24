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
 * Phase 2: structured synthesis. Feed the brief to the AI, get JSON out.
 * The AI is told: only synthesize from the provided evidence. Do not invent.
 */
async function phase2Synthesize(
  company: string,
  brief: string,
  realPeople: RealPerson[],
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
    console.log("[researchService] phase2 failed: " + e.message);
    return {};
  }
}

export interface ResearchParams {
  company: string;
  userProfile?: { name?: string; role?: string; company?: string; valueLine?: string };
  enableEmailFinding?: boolean;
  enableActivityMining?: boolean;
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
  const synthesized = await phase2Synthesize(company, brief, realPeople);

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
    similarCompanies: synthesized.similarCompanies || [],
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
