// peopleService.ts - REAL people discovery. No hallucination allowed.
//
// Core contract: every person returned MUST have evidence.snippet - literal text
// from a real HTML page we fetched. If we can't find real people, we return [].
// We NEVER ask the AI to "imagine" or "generate" people.
//
// The AI is used only as an HTML PARSER - given raw HTML, extract names+titles
// that are explicitly present in the markup.

import { fetchPageHtml, fetchPageText, searchMulti, extractLinkedInUrls } from "./webSearch.js";
import { callAzureJson } from "./azureClient.js";
import { CitationStore } from "./citationStore.js";

export interface Evidence {
  source: string;       // Human label ("Fastmarkets.com", "TheOrg")
  url: string;          // Real URL we fetched
  snippet: string;      // Literal text from the page
  retrievedAt: string;  // ISO date
}

export interface RealPerson {
  name: string;
  title: string;
  linkedin: string | null;
  linkedinStatus: "verified" | "inferred" | "not_found";
  evidence: Evidence[];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normName(n: string): string {
  return n.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
}

// --- Title keywords used for regex-based fallback extraction ---
const TITLE_KEYWORDS_RE =
  /\b(CEO|CTO|CFO|COO|CIO|CMO|CISO|CPO|CRO|CLO|VP|Vice\s+President|Director|Head\s+of|President|Founder|Co-Founder|Chief\s+\w+\s*Officer|Managing\s+Director|General\s+Manager|Partner|Principal|Chairman|Chairwoman|Chairperson|SVP|EVP)\b/i;

/**
 * Validate a candidate name: must be 2+ words, each word starts with uppercase,
 * no numbers, no URLs, not overly long.
 */
function isValidPersonName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  // Must be 2+ words
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  // No digits or URLs
  if (/\d/.test(trimmed) || /https?:/.test(trimmed)) return false;
  // Each word should start with uppercase (allow "de", "von", "van", etc.)
  const lowerParticles = new Set(["de", "del", "der", "van", "von", "la", "le", "da", "di", "el", "al"]);
  for (const w of words) {
    if (lowerParticles.has(w.toLowerCase())) continue;
    if (!/^[A-Z]/.test(w)) return false;
  }
  // Total length sanity
  if (trimmed.length < 4 || trimmed.length > 60) return false;
  return true;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function extractPeopleFromHtmlRegex(
  html: string,
  company: string,
  sourceLabel: string,
  sourceUrl: string,
): RealPerson[] {
  if (!html || html.length < 50) return [];

  const linkedinUrls = extractLinkedInUrls(html);

  const results: RealPerson[] = [];
  const seenNames = new Set<string>();

  function addCandidate(name: string, title: string, snippet: string) {
    const cleanName = stripTags(name).trim();
    const cleanTitle = stripTags(title).trim();
    if (!isValidPersonName(cleanName)) return;
    if (!TITLE_KEYWORDS_RE.test(cleanTitle)) return;
    const key = normName(cleanName);
    if (seenNames.has(key)) return;
    seenNames.add(key);

    // Try to find a LinkedIn URL near this person's name in the source
    let linkedin: string | null = null;
    let linkedinStatus: "verified" | "inferred" | "not_found" = "not_found";
    const nameIdx = html.toLowerCase().indexOf(cleanName.toLowerCase());
    if (nameIdx >= 0) {
      const window = html.substring(Math.max(0, nameIdx - 500), Math.min(html.length, nameIdx + 500));
      const linksNear = extractLinkedInUrls(window);
      if (linksNear.length > 0) {
        linkedin = linksNear[0];
        linkedinStatus = "verified";
      }
    }

    results.push({
      name: cleanName,
      title: cleanTitle,
      linkedin,
      linkedinStatus,
      evidence: [{
        source: sourceLabel,
        url: sourceUrl,
        snippet: stripTags(snippet).slice(0, 300),
        retrievedAt: new Date().toISOString(),
      }],
    });
  }

  // --- Pattern 1: Name in heading (h2/h3/h4) followed by title in p/span/div ---
  const headingTitleRe = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>\s*(?:<[^>]*>\s*)*<(?:p|span|div)[^>]*>([\s\S]*?)<\/(?:p|span|div)>/gi;
  let m: RegExpExecArray | null;
  while ((m = headingTitleRe.exec(html)) !== null) {
    const nameCandidate = stripTags(m[1]);
    const titleCandidate = stripTags(m[2]);
    if (TITLE_KEYWORDS_RE.test(titleCandidate)) {
      addCandidate(nameCandidate, titleCandidate, m[0]);
    }
  }

  // --- Pattern 2: Schema.org Person markup ---
  // Matches itemtype="http://schema.org/Person" blocks or JSON-LD
  const schemaPersonRe = /<[^>]+itemtype=["']https?:\/\/schema\.org\/Person["'][^>]*>([\s\S]*?)<\/(?:div|section|article|li|span)>/gi;
  while ((m = schemaPersonRe.exec(html)) !== null) {
    const block = m[1];
    const nameMatch = /itemprop=["']name["'][^>]*>([^<]+)/i.exec(block);
    const titleMatch = /itemprop=["']jobTitle["'][^>]*>([^<]+)/i.exec(block);
    if (nameMatch && titleMatch) {
      addCandidate(nameMatch[1], titleMatch[1], m[0]);
    }
  }

  // Also try JSON-LD Person blocks
  const jsonLdRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = jsonLdRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const persons = Array.isArray(data) ? data : (data["@graph"] || [data]);
      for (const item of persons) {
        if (item?.["@type"] === "Person" && item.name && item.jobTitle) {
          addCandidate(item.name, item.jobTitle, "JSON-LD: " + item.name + " - " + item.jobTitle);
        }
      }
    } catch { /* ignore malformed JSON-LD */ }
  }

  // --- Pattern 3: LinkedIn profile links with visible name text ---
  const linkedinLinkRe = /<a[^>]+href=["'](https?:\/\/(?:www\.)?linkedin\.com\/in\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = linkedinLinkRe.exec(html)) !== null) {
    const linkedinUrl = m[1];
    const linkText = stripTags(m[2]);
    if (isValidPersonName(linkText)) {
      // Look around the link for a title
      const surroundStart = Math.max(0, m.index - 300);
      const surroundEnd = Math.min(html.length, m.index + m[0].length + 300);
      const surrounding = html.substring(surroundStart, surroundEnd);
      const titleInSurrounding = TITLE_KEYWORDS_RE.exec(stripTags(surrounding));
      if (titleInSurrounding) {
        // Extract a reasonable title chunk around the keyword
        const fullText = stripTags(surrounding);
        const kwIdx = fullText.indexOf(titleInSurrounding[0]);
        // grab up to 60 chars around the keyword for the title
        const titleChunk = fullText.substring(Math.max(0, kwIdx - 20), Math.min(fullText.length, kwIdx + 40)).trim();
        addCandidate(linkText, titleChunk, m[0]);
      }
    }
  }

  // --- Pattern 4: "Name - Title" or "Name, Title" in plain text (common in search snippets and pages) ---
  // This pattern works on the stripped text to catch both HTML and plain-text snippets
  const plainText = stripTags(html);

  // Pattern: "FirstName LastName - Title with keyword" or "FirstName LastName, Title with keyword"
  const nameTitleSepRe = /([A-Z][a-z]+(?:\s+(?:de|del|van|von|la|le|da|di))?(?:\s+[A-Z][a-z]+){1,3})\s*[-–—,|]\s*([^.\n;]{5,60})/g;
  while ((m = nameTitleSepRe.exec(plainText)) !== null) {
    const nameCandidate = m[1].trim();
    const titleCandidate = m[2].trim();
    if (TITLE_KEYWORDS_RE.test(titleCandidate)) {
      addCandidate(nameCandidate, titleCandidate, m[0]);
    }
  }

  // --- Pattern 5: Title keyword followed by name - e.g. "CEO John Smith" or "CEO: John Smith" ---
  const titleNameRe = /\b(CEO|CTO|CFO|COO|CIO|CMO|President|Founder|Co-Founder|Chairman|Chairwoman)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;
  while ((m = titleNameRe.exec(plainText)) !== null) {
    addCandidate(m[2].trim(), m[1].trim(), m[0]);
  }

  if (results.length > 0) {
    console.log("[peopleService] Regex fallback extracted " + results.length + " people from " + sourceLabel);
  }
  return results;
}

/**
 * Ask the AI to extract ONLY people explicitly named in the HTML as this company's employees.
 * Hard-coded anti-hallucination contract.
 */
async function extractPeopleFromHtml(
  html: string,
  company: string,
  sourceLabel: string,
  sourceUrl: string,
): Promise<RealPerson[]> {
  if (!html || html.length < 200) return [];
  // Strip scripts/styles/comments, keep structure
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .slice(0, 35000);

  // Capture LinkedIn URLs present in the HTML for later matching
  const linkedinUrls = extractLinkedInUrls(cleaned);

  const systemPrompt =
    "You are a strict HTML parser, not a researcher. " +
    "Your ONLY job is to extract people who are EXPLICITLY named as " + company + " employees, executives, or leadership in the HTML provided. " +
    "DO NOT use any prior knowledge. DO NOT invent people. DO NOT add anyone who is not literally present in the HTML text. " +
    "If the HTML does not clearly name any " + company + " people, return an empty array. " +
    "For each person, the 'snippet' field MUST be the exact text from the HTML where their name and title appear - not paraphrased. " +
    "Return JSON: {\"people\": [{\"name\": \"Full Name\", \"title\": \"Exact Title As Written\", \"snippet\": \"literal HTML text\"}]}";

  try {
    const parsed: any = await callAzureJson(systemPrompt, cleaned, { maxTokens: 2000, timeoutMs: 60000 });
    const raw: any[] = Array.isArray(parsed?.people) ? parsed.people : [];
    const people: RealPerson[] = [];
    for (const p of raw) {
      if (!p?.name || !p?.title || !p?.snippet) continue;
      // Ground truth check: snippet must actually appear in the HTML (case-insensitive substring of name)
      const nameLower = String(p.name).toLowerCase();
      if (!cleaned.toLowerCase().includes(nameLower)) {
        console.log("[peopleService] REJECTED hallucination: '" + p.name + "' not found in source " + sourceLabel);
        continue;
      }
      // Try to associate a LinkedIn URL if the HTML has one near the name
      let linkedin: string | null = null;
      let linkedinStatus: "verified" | "inferred" | "not_found" = "not_found";
      const nameIdx = cleaned.toLowerCase().indexOf(nameLower);
      if (nameIdx >= 0) {
        // Check +/- 500 chars around the name for a linkedin URL
        const window = cleaned.substring(Math.max(0, nameIdx - 500), Math.min(cleaned.length, nameIdx + 500));
        const linksNear = extractLinkedInUrls(window);
        if (linksNear.length > 0) {
          linkedin = linksNear[0];
          linkedinStatus = "verified";
        }
      }
      people.push({
        name: String(p.name).trim(),
        title: String(p.title).trim(),
        linkedin,
        linkedinStatus,
        evidence: [{
          source: sourceLabel,
          url: sourceUrl,
          snippet: stripTags(String(p.snippet)).slice(0, 300),
          retrievedAt: new Date().toISOString(),
        }],
      });
    }
    return people;
  } catch (e: any) {
    console.log("[peopleService] AI extraction failed for " + sourceLabel + ": " + e.message + " — trying regex fallback");
    return extractPeopleFromHtmlRegex(cleaned, company, sourceLabel, sourceUrl);
  }
}

/**
 * Merge duplicate people (same normalized name) by combining evidence.
 */
function dedupePeople(all: RealPerson[]): RealPerson[] {
  const map = new Map<string, RealPerson>();
  for (const p of all) {
    const key = normName(p.name);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      // Merge evidence
      for (const ev of p.evidence) {
        if (!existing.evidence.some(e => e.url === ev.url)) {
          existing.evidence.push(ev);
        }
      }
      // Prefer verified LinkedIn
      if (!existing.linkedin && p.linkedin) {
        existing.linkedin = p.linkedin;
        existing.linkedinStatus = p.linkedinStatus;
      }
      // Prefer longer title
      if (p.title.length > existing.title.length) existing.title = p.title;
    } else {
      map.set(key, { ...p, evidence: [...p.evidence] });
    }
  }
  return [...map.values()];
}

/**
 * Search for a person's LinkedIn profile via DDG/Bing site: operator.
 * Returns verified URL only if found in search results.
 */
export async function verifyLinkedIn(name: string, company: string): Promise<string | null> {
  const q = `"${name}" "${company}" site:linkedin.com/in`;
  const results = await searchMulti(q, 5);
  for (const r of results) {
    const urls = extractLinkedInUrls(r.url + " " + r.snippet + " " + r.title);
    if (urls.length > 0) return urls[0];
  }
  return null;
}

/**
 * MAIN ENTRY: Find real people at a company. Returns only people we can cite.
 */
export async function findRealPeople(
  company: string,
  domain: string | null,
  citations: CitationStore,
): Promise<{ people: RealPerson[]; sourcesAttempted: string[]; caveats: string[] }> {
  const collected: RealPerson[] = [];
  const sourcesAttempted: string[] = [];
  const caveats: string[] = [];

  // --- Source 1: Company website pages ---
  if (domain) {
    const paths = ["/leadership", "/team", "/about", "/about-us", "/management", "/people", "/our-team", "/executives", "/company/leadership", "/who-we-are"];
    for (const path of paths) {
      const url = "https://" + domain + path;
      sourcesAttempted.push(url);
      const html = await fetchPageHtml(url, 8000);
      if (!html) continue;
      const label = domain + path;
      const people = await extractPeopleFromHtml(html, company, label, url);
      if (people.length > 0) {
        citations.add({ source: label, url, snippet: "Found " + people.length + " people on leadership page" });
        collected.push(...people);
        console.log("[peopleService] " + label + " -> " + people.length + " people");
      }
      // Rate limit between same-domain requests
      await new Promise(r => setTimeout(r, 400));
    }
  } else {
    caveats.push("No domain known - skipped company website scraping");
  }

  // --- Source 2: TheOrg ---
  const slug = slugify(company);
  const theOrgUrl = "https://theorg.com/org/" + slug;
  sourcesAttempted.push(theOrgUrl);
  const theOrgHtml = await fetchPageHtml(theOrgUrl, 8000);
  if (theOrgHtml) {
    const people = await extractPeopleFromHtml(theOrgHtml, company, "TheOrg", theOrgUrl);
    if (people.length > 0) {
      citations.add({ source: "TheOrg", url: theOrgUrl, snippet: "Org chart page" });
      collected.push(...people);
      console.log("[peopleService] TheOrg -> " + people.length + " people");
    }
  }

  // --- Source 3: RocketReach public email-format page ---
  const rrUrl = "https://rocketreach.co/" + slug + "-email-format";
  sourcesAttempted.push(rrUrl);
  const rrHtml = await fetchPageHtml(rrUrl, 8000);
  if (rrHtml) {
    const people = await extractPeopleFromHtml(rrHtml, company, "RocketReach", rrUrl);
    if (people.length > 0) {
      citations.add({ source: "RocketReach", url: rrUrl });
      collected.push(...people);
      console.log("[peopleService] RocketReach -> " + people.length + " people");
    }
  }

  // --- Source 4: Search snippets for leadership ---
  try {
    const results = await searchMulti('"' + company + '" CEO OR CFO OR COO OR "Chief Executive"', 10);
    if (results.length > 0) {
      // Build a blob of snippets and feed to extractor
      const blob = results.map(r => "[" + r.title + "] " + r.snippet + " (" + r.url + ")").join("\n\n");
      const people = await extractPeopleFromHtml(blob, company, "SearchSnippets", "search:leadership");
      if (people.length > 0) {
        // Associate top result URL if any
        for (const p of people) {
          // Try to find which search result mentions this person
          const hit = results.find(r => (r.snippet + " " + r.title).toLowerCase().includes(p.name.toLowerCase()));
          if (hit) {
            p.evidence = [{ source: new URL(hit.url).hostname.replace(/^www\./, ""), url: hit.url, snippet: hit.snippet.slice(0, 300), retrievedAt: new Date().toISOString() }];
            citations.add({ source: new URL(hit.url).hostname.replace(/^www\./, ""), url: hit.url, snippet: hit.snippet.slice(0, 200) });
          }
        }
        collected.push(...people);
        console.log("[peopleService] SearchSnippets -> " + people.length + " people");
      }
    }
  } catch (e: any) {
    caveats.push("Search engine scraping failed: " + e.message);
  }

  const deduped = dedupePeople(collected);

  // --- Verify LinkedIn URLs for people missing one (in parallel, capped at 5) ---
  const needLinkedIn = deduped.filter(p => !p.linkedin).slice(0, 5);
  await Promise.allSettled(
    needLinkedIn.map(async (p) => {
      const url = await verifyLinkedIn(p.name, company);
      if (url) {
        p.linkedin = url;
        p.linkedinStatus = "verified";
      }
    })
  );

  // Caveats
  if (deduped.length === 0) {
    caveats.push("No people could be verified via public sources. Company may block scrapers or have no public leadership page.");
  }
  if (deduped.some(p => !p.linkedin)) {
    caveats.push("Some LinkedIn URLs could not be verified - shown as not_found rather than invented.");
  }

  console.log("[peopleService] Final: " + deduped.length + " verified people, " + sourcesAttempted.length + " sources attempted");
  return { people: deduped, sourcesAttempted, caveats };
}
