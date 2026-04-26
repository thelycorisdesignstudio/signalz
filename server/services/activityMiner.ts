// activityMiner.ts - mine a person's public content footprint.
// Honest about misses: returns null when nothing found rather than inventing.

import { searchMulti, fetchPageText } from "./webSearch.js";
import { callAzureJson } from "./azureClient.js";

export interface PublicFootprint {
  writings: Array<{ title: string; publication: string; date?: string; url: string; type: string; summary?: string }>;
  appearances: Array<{ venue: string; title: string; date?: string; url: string; type: string }>;
  pressMentions: Array<{ outlet: string; headline: string; date?: string; url: string; quote?: string }>;
  awards: Array<{ name: string; year?: string; org?: string }>;
  socialPosts: Array<{ platform: string; date?: string; snippet: string; url: string }>;
  themes: string[];
  tone: string;
  bestHook: string | null;
  publicNarrative: string | null;
  reason?: string;
}

/**
 * Collect raw search results across channels, feed to AI for synthesis.
 * AI is forbidden from inventing; must say "limited public footprint" if data is thin.
 */
export async function mineActivity(name: string, company: string, linkedinUrl: string | null): Promise<PublicFootprint> {
  const queries = [
    { q: `"${name}" site:linkedin.com/posts`, bucket: "social" },
    { q: `"${name}" site:medium.com`, bucket: "writing" },
    { q: `"${name}" site:substack.com`, bucket: "writing" },
    { q: `"${name}" "${company}" podcast`, bucket: "appearance" },
    { q: `"${name}" "${company}" interview`, bucket: "appearance" },
    { q: `"${name}" "${company}" keynote OR conference`, bucket: "appearance" },
    { q: `"${name}" "${company}" award OR honored`, bucket: "award" },
    { q: `"${name}" "${company}"`, bucket: "press" },
  ];

  const collected: Array<{ bucket: string; title: string; url: string; snippet: string }> = [];
  await Promise.all(queries.map(async ({ q, bucket }) => {
    try {
      const results = await searchMulti(q, 6);
      for (const r of results) {
        // Ground truth: require the person's name in the title or snippet
        const blob = (r.title + " " + r.snippet).toLowerCase();
        if (!blob.includes(name.toLowerCase())) continue;
        collected.push({ bucket, title: r.title, url: r.url, snippet: r.snippet });
      }
    } catch {}
  }));

  if (collected.length === 0) {
    return {
      writings: [], appearances: [], pressMentions: [], awards: [], socialPosts: [],
      themes: [], tone: "unknown", bestHook: null, publicNarrative: null,
      reason: "limited public footprint",
    };
  }

  // Synthesize via AI - but constrain hard: only use data in 'collected'
  const input = JSON.stringify(collected.slice(0, 40));
  const sys =
    "You are a careful research assistant. Given a list of real search results about " + name + " at " + company + ", " +
    "categorize them into writings/appearances/pressMentions/awards/socialPosts. " +
    "DO NOT invent any items that are not in the provided data. DO NOT use training knowledge - only synthesize what's there. " +
    "If the data is thin, return empty arrays and set reason to 'limited public footprint'. " +
    "Identify up to 5 recurring themes (content topics), infer tone (analytical/contrarian/visionary/operator/evangelist/pragmatic/unknown), " +
    "pick the single BEST conversation hook (prefer most recent), and write a 2-sentence publicNarrative. " +
    "If uncertain, say so rather than invent. Do not use em dashes - use hyphens. No emoji. " +
    "Return JSON: {writings:[{title,publication,date,url,type,summary}], appearances:[{venue,title,date,url,type}], " +
    "pressMentions:[{outlet,headline,date,url,quote}], awards:[{name,year,org}], socialPosts:[{platform,date,snippet,url}], " +
    "themes:[], tone:'', bestHook:'' or null, publicNarrative:'' or null, reason:'' or null}";

  try {
    const out: PublicFootprint = await callAzureJson(sys, input, { maxTokens: 2500, timeoutMs: 60000 });
    // Final safety: all URLs in output must exist in our collected set
    const validUrls = new Set(collected.map(c => c.url));
    const filter = <T extends { url: string }>(items: T[] | undefined): T[] =>
      (items || []).filter(i => i.url && validUrls.has(i.url));
    return {
      writings: filter(out.writings),
      appearances: filter(out.appearances),
      pressMentions: filter(out.pressMentions),
      awards: (out.awards || []).slice(0, 5),
      socialPosts: filter(out.socialPosts),
      themes: (out.themes || []).slice(0, 5),
      tone: out.tone || "unknown",
      bestHook: out.bestHook || null,
      publicNarrative: out.publicNarrative || null,
      reason: out.reason,
    };
  } catch (e: any) {
    console.log("[activityMiner] synthesis failed for " + name + ": " + e.message);
    return {
      writings: [], appearances: [], pressMentions: [], awards: [], socialPosts: [],
      themes: [], tone: "unknown", bestHook: null, publicNarrative: null,
      reason: "synthesis failed",
    };
  }
}
