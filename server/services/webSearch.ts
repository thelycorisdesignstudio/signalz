// webSearch.ts - real web scraping across multiple engines.
// All functions rate-limited, timeout-guarded, and return best-effort results.
// No throwing on source failure - callers expect partial data.

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Signalz/1.0";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string; // which engine
}

async function fetchWithTimeout(url: string, timeoutMs = 8000, extraHeaders: Record<string, string> = {}): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...extraHeaders,
      },
      signal: ctrl.signal,
      redirect: "follow",
    } as any);
    if (r.status === 429 || r.status === 403) {
      console.log("[webSearch] blocked (" + r.status + ") at " + new URL(url).hostname);
      return null;
    }
    if (!r.ok) return null;
    return await r.text();
  } catch (e: any) {
    console.log("[webSearch] fetch failed " + url + ": " + e.message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

// --- DuckDuckGo HTML ---
export async function searchDDG(query: string, limit = 10): Promise<SearchResult[]> {
  const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  const html = await fetchWithTimeout(url, 8000);
  if (!html) return [];
  const results: SearchResult[] = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null && results.length < limit) {
    let link = m[1];
    // DDG wraps results in /l/?uddg=ENCODED
    const uddg = link.match(/uddg=([^&]+)/);
    if (uddg) {
      try { link = decodeURIComponent(uddg[1]); } catch {}
    }
    results.push({
      title: stripTags(m[2]),
      url: link,
      snippet: stripTags(m[3]),
      source: "duckduckgo",
    });
  }
  console.log("[webSearch] DDG '" + query + "' -> " + results.length + " results");
  return results;
}

// --- Bing ---
export async function searchBing(query: string, limit = 10): Promise<SearchResult[]> {
  const url = "https://www.bing.com/search?q=" + encodeURIComponent(query) + "&count=" + limit;
  const html = await fetchWithTimeout(url, 8000);
  if (!html) return [];
  const results: SearchResult[] = [];
  const re = /<li class="b_algo"[^>]*>[\s\S]*?<h2>[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<p[^>]*>([\s\S]*?)<\/p>|<div class="b_caption">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>)/g;
  let m;
  while ((m = re.exec(html)) !== null && results.length < limit) {
    results.push({
      title: stripTags(m[2]),
      url: m[1],
      snippet: stripTags(m[3] || m[4] || ""),
      source: "bing",
    });
  }
  console.log("[webSearch] Bing '" + query + "' -> " + results.length + " results");
  return results;
}

// --- Google (often blocks - best effort) ---
export async function searchGoogle(query: string, limit = 10): Promise<SearchResult[]> {
  const url = "https://www.google.com/search?q=" + encodeURIComponent(query) + "&num=" + limit + "&hl=en";
  const html = await fetchWithTimeout(url, 8000);
  if (!html) return [];
  const results: SearchResult[] = [];
  // Google HTML varies heavily. Try simple link+snippet extractor.
  const linkRe = /<a href="\/url\?q=([^&"]+)[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/g;
  let m;
  while ((m = linkRe.exec(html)) !== null && results.length < limit) {
    try {
      results.push({
        title: stripTags(m[2]),
        url: decodeURIComponent(m[1]),
        snippet: "",
        source: "google",
      });
    } catch {}
  }
  console.log("[webSearch] Google '" + query + "' -> " + results.length + " results");
  return results;
}

/**
 * Multi-engine search. Runs DDG + Bing in parallel (Google blocks hard),
 * dedupes by URL, returns merged best-effort results.
 */
export async function searchMulti(query: string, limit = 10): Promise<SearchResult[]> {
  const [ddg, bing] = await Promise.all([
    searchDDG(query, limit).catch(() => []),
    searchBing(query, limit).catch(() => []),
  ]);
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const r of [...ddg, ...bing]) {
    const key = r.url.replace(/[#?].*$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
    if (merged.length >= limit * 2) break;
  }
  return merged;
}

/**
 * Fetch a URL's readable text (strip scripts/styles, keep main content).
 */
export async function fetchPageText(url: string, timeoutMs = 8000, maxChars = 40000): Promise<string | null> {
  const html = await fetchWithTimeout(url, timeoutMs);
  if (!html) return null;
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  return stripTags(cleaned).slice(0, maxChars);
}

/**
 * Fetch raw HTML of a URL (for tag/link extraction).
 */
export async function fetchPageHtml(url: string, timeoutMs = 8000): Promise<string | null> {
  return fetchWithTimeout(url, timeoutMs);
}

// Extract all email addresses from a blob of text/html
export function extractEmails(text: string, domain?: string): string[] {
  if (!text) return [];
  const re = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  const found = new Set<string>();
  let m;
  while ((m = re.exec(text)) !== null) {
    const email = m[0].toLowerCase();
    if (email.endsWith(".png") || email.endsWith(".jpg") || email.endsWith(".gif")) continue;
    if (domain && !email.endsWith("@" + domain.toLowerCase())) continue;
    found.add(email);
  }
  return [...found];
}

// Extract LinkedIn profile URLs from text/html
export function extractLinkedInUrls(text: string): string[] {
  if (!text) return [];
  const re = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?/gi;
  const found = new Set<string>();
  let m;
  while ((m = re.exec(text)) !== null) {
    found.add(m[0].replace(/\/$/, ""));
  }
  return [...found];
}
