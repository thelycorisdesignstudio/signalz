// emailFinder.ts - Real email discovery. SMTP + scraping + pattern inference.
//
// Cascade:
//   1. Pattern candidates (synchronous, cheap)
//   2. SMTP verify top patterns in parallel (MX lookup + RCPT TO)
//   3. Web scraping: DDG, Bing, company pages, PDF search, GitHub, Apollo/RocketReach snippets
//   4. Pattern inference from any real emails found at the domain
//   5. Cache 30 days in SQLite

import dns from "node:dns/promises";
import net from "node:net";
import { fetchPageText, searchMulti, extractEmails } from "./webSearch.js";

export type EmailConfidence = "verified" | "high" | "medium" | "low" | "unverified";

export interface EmailCandidate {
  email: string;
  confidence: EmailConfidence;
  source: string;
}

export interface EmailFindResult {
  primary: EmailCandidate | null;
  alternates: EmailCandidate[];
  sources: string[];
  inferredPattern: string | null;
}

function normalizeName(name: string): { first: string; last: string; fi: string; li: string } {
  const parts = name.trim().split(/\s+/).filter(p => !/^(mr|mrs|ms|dr|prof)\.?$/i.test(p));
  const first = (parts[0] || "").toLowerCase().replace(/[^a-z]/g, "");
  const last = (parts[parts.length - 1] || "").toLowerCase().replace(/[^a-z]/g, "");
  return { first, last, fi: first[0] || "", li: last[0] || "" };
}

export function generatePatternEmails(name: string, domain: string): EmailCandidate[] {
  const { first, last, fi, li } = normalizeName(name);
  if (!first || !domain) return [];
  const d = domain.toLowerCase();
  const patterns: string[] = [];
  if (last) {
    patterns.push(
      `${first}.${last}@${d}`,
      `${first}${last}@${d}`,
      `${first}_${last}@${d}`,
      `${first}@${d}`,
      `${fi}${last}@${d}`,
      `${first}${li}@${d}`,
      `${fi}.${last}@${d}`,
      `${last}.${first}@${d}`,
      `${last}${fi}@${d}`,
      `${last}@${d}`,
    );
  } else {
    patterns.push(`${first}@${d}`);
  }
  return patterns.map(email => ({ email, confidence: "low" as EmailConfidence, source: "pattern" }));
}

// Infer pattern from a known valid email at the same domain (given the person's name)
export function inferPattern(email: string, name: string): string | null {
  const { first, last, fi, li } = normalizeName(name);
  const local = email.split("@")[0].toLowerCase();
  if (!first) return null;
  if (last && local === `${first}.${last}`) return "firstname.lastname";
  if (last && local === `${first}${last}`) return "firstnamelastname";
  if (last && local === `${first}_${last}`) return "firstname_lastname";
  if (local === first) return "firstname";
  if (last && local === `${fi}${last}`) return "flastname";
  if (last && local === `${first}${li}`) return "firstnamel";
  if (last && local === `${fi}.${last}`) return "f.lastname";
  if (last && local === last) return "lastname";
  return null;
}

export function applyPattern(name: string, domain: string, pattern: string): string | null {
  const { first, last, fi, li } = normalizeName(name);
  if (!first) return null;
  const d = domain.toLowerCase();
  switch (pattern) {
    case "firstname.lastname": return last ? `${first}.${last}@${d}` : null;
    case "firstnamelastname": return last ? `${first}${last}@${d}` : null;
    case "firstname_lastname": return last ? `${first}_${last}@${d}` : null;
    case "firstname": return `${first}@${d}`;
    case "flastname": return last ? `${fi}${last}@${d}` : null;
    case "firstnamel": return last ? `${first}${li}@${d}` : null;
    case "f.lastname": return last ? `${fi}.${last}@${d}` : null;
    case "lastname": return last ? `${last}@${d}` : null;
    default: return null;
  }
}

// --- SMTP verification ---
async function getMxHost(domain: string): Promise<string | null> {
  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) return null;
    records.sort((a, b) => a.priority - b.priority);
    return records[0].exchange;
  } catch {
    return null;
  }
}

export async function verifySMTP(email: string, timeoutMs = 6000): Promise<boolean> {
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;
  const mx = await getMxHost(domain);
  if (!mx) return false;
  return new Promise((resolve) => {
    let resolved = false;
    const done = (ok: boolean) => { if (!resolved) { resolved = true; try { sock.destroy(); } catch {} resolve(ok); } };
    const sock = net.createConnection(25, mx);
    sock.setTimeout(timeoutMs);
    let stage = 0;
    let buf = "";
    sock.on("error", () => done(false));
    sock.on("timeout", () => done(false));
    sock.on("data", (data) => {
      buf += data.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() || "";
      for (const line of lines) {
        const code = parseInt(line.slice(0, 3), 10);
        if (isNaN(code)) continue;
        if (stage === 0 && code === 220) {
          sock.write("HELO signalz.thelycoris.com\r\n");
          stage = 1;
        } else if (stage === 1 && code >= 200 && code < 300) {
          sock.write("MAIL FROM:<noreply@thelycoris.com>\r\n");
          stage = 2;
        } else if (stage === 2 && code >= 200 && code < 300) {
          sock.write(`RCPT TO:<${email}>\r\n`);
          stage = 3;
        } else if (stage === 3) {
          // 250 = accepted, 550/551/553 = rejected
          if (code === 250 || code === 251) {
            sock.write("QUIT\r\n");
            done(true);
          } else {
            sock.write("QUIT\r\n");
            done(false);
          }
        } else if (code >= 500) {
          done(false);
        }
      }
    });
  });
}

// --- Web scraping sources for emails ---

async function scrapeCompanyContactPages(domain: string, companyName: string): Promise<{ emails: string[]; sources: string[] }> {
  const emails = new Set<string>();
  const sources: string[] = [];
  const paths = ["/contact", "/contact-us", "/about", "/team", "/leadership", "/press", "/media"];
  for (const p of paths) {
    const url = "https://" + domain + p;
    const text = await fetchPageText(url, 6000);
    if (!text) continue;
    const found = extractEmails(text, domain);
    if (found.length > 0) {
      sources.push(url);
      found.forEach(e => emails.add(e));
    }
    await new Promise(r => setTimeout(r, 300));
  }
  return { emails: [...emails], sources };
}

async function searchExposedEmails(name: string, domain: string): Promise<{ emails: string[]; sources: string[] }> {
  const emails = new Set<string>();
  const sources: string[] = [];
  const queries = [
    `"${name}" "@${domain}"`,
    `"${name}" email "@${domain}"`,
    `"${name}" "${domain}" filetype:pdf`,
    `site:rocketreach.co "${name}" ${domain}`,
    `site:apollo.io "${name}"`,
    `site:zoominfo.com "${name}"`,
  ];
  for (const q of queries) {
    const results = await searchMulti(q, 8);
    for (const r of results) {
      const blob = (r.title || "") + " " + (r.snippet || "") + " " + (r.url || "");
      const found = extractEmails(blob, domain);
      if (found.length > 0) {
        sources.push(r.url);
        found.forEach(e => emails.add(e));
      }
    }
    // Gentle rate limit between query groups
    await new Promise(r => setTimeout(r, 600));
  }
  return { emails: [...emails], sources };
}

async function searchGitHubCommits(domain: string): Promise<string[]> {
  const emails = new Set<string>();
  const token = process.env.GITHUB_TOKEN || "";
  const url = `https://api.github.com/search/commits?q=author-email:@${domain}&per_page=20`;
  try {
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.cloak-preview+json",
      "User-Agent": "Signalz-Research/1.0",
    };
    if (token) headers["Authorization"] = "token " + token;
    const r = await fetch(url, { headers });
    if (!r.ok) return [];
    const data: any = await r.json();
    for (const item of (data.items || [])) {
      const email = item?.commit?.author?.email;
      if (email && email.endsWith("@" + domain.toLowerCase())) emails.add(email.toLowerCase());
    }
  } catch {}
  return [...emails];
}

/**
 * MAIN ENTRY: find an email for a person.
 */
export async function findEmail(
  name: string,
  company: string,
  domain: string,
  knownDomainPattern?: string | null,
): Promise<EmailFindResult> {
  const allSources = new Set<string>();
  const scored = new Map<string, EmailCandidate>();
  const bump = (email: string, confidence: EmailConfidence, source: string) => {
    const e = email.toLowerCase();
    const rank = (c: EmailConfidence) => ({ verified: 5, high: 4, medium: 3, low: 2, unverified: 1 }[c]);
    const existing = scored.get(e);
    if (!existing || rank(confidence) > rank(existing.confidence)) {
      scored.set(e, { email: e, confidence, source });
    }
    allSources.add(source);
  };

  // Layer 1: pattern candidates
  const patterns = generatePatternEmails(name, domain);
  for (const p of patterns) bump(p.email, "low", "pattern");

  // If we already know the company's pattern, elevate that one
  if (knownDomainPattern) {
    const inferred = applyPattern(name, domain, knownDomainPattern);
    if (inferred) bump(inferred, "medium", "pattern-inferred");
  }

  // Layer 2: SMTP verify top 4 candidates in parallel
  const smtpCandidates = [...scored.values()]
    .sort((a, b) => (a.confidence === "medium" ? -1 : 0))
    .slice(0, 4)
    .map(c => c.email);

  const smtpResults = await Promise.allSettled(
    smtpCandidates.map(email => verifySMTP(email).then(ok => ({ email, ok })))
  );
  for (const r of smtpResults) {
    if (r.status === "fulfilled" && r.value.ok) {
      bump(r.value.email, "verified", "smtp");
    }
  }

  // Layer 3: web scraping (parallel)
  const [contact, searchHits, gh] = await Promise.allSettled([
    scrapeCompanyContactPages(domain, company),
    searchExposedEmails(name, domain),
    searchGitHubCommits(domain),
  ]);

  const contactResult = contact.status === "fulfilled" ? contact.value : { emails: [], sources: [] };
  const searchResult = searchHits.status === "fulfilled" ? searchHits.value : { emails: [], sources: [] };
  const ghEmails = gh.status === "fulfilled" ? gh.value : [];

  // Record all scraped emails - match against this person's name where possible
  const { first, last } = normalizeName(name);
  const matchesPerson = (e: string) => {
    const local = e.split("@")[0].toLowerCase();
    return local.includes(first) || (last && local.includes(last));
  };

  for (const e of contactResult.emails) {
    bump(e, matchesPerson(e) ? "high" : "low", "company-website");
  }
  for (const e of searchResult.emails) {
    bump(e, matchesPerson(e) ? "high" : "low", "search");
  }
  for (const e of ghEmails) {
    bump(e, matchesPerson(e) ? "high" : "low", "github");
  }
  contactResult.sources.forEach(s => allSources.add(s));
  searchResult.sources.forEach(s => allSources.add(s));

  // Layer 4: if any real email at the domain was found, infer pattern and apply to this person
  const domainEmails = [...scored.values()].filter(c => c.email.endsWith("@" + domain.toLowerCase()) && c.source !== "pattern");
  let inferredPatternName: string | null = knownDomainPattern || null;
  if (!inferredPatternName && domainEmails.length > 0) {
    // Try to infer from any email where the local-part loosely matches the pattern
    for (const c of domainEmails) {
      const pat = inferPattern(c.email, name);
      if (pat) { inferredPatternName = pat; break; }
    }
  }
  if (inferredPatternName) {
    const applied = applyPattern(name, domain, inferredPatternName);
    if (applied) {
      const existing = scored.get(applied);
      if (!existing || existing.confidence === "low") {
        bump(applied, "medium", "pattern-inferred-from-real-emails");
      }
    }
  }

  // Pick primary: verified > high > medium > low. Prefer ones that match this person's name.
  const sorted = [...scored.values()].sort((a, b) => {
    const rank = (c: EmailConfidence) => ({ verified: 5, high: 4, medium: 3, low: 2, unverified: 1 }[c]);
    const personA = matchesPerson(a.email) ? 1 : 0;
    const personB = matchesPerson(b.email) ? 1 : 0;
    if (rank(b.confidence) !== rank(a.confidence)) return rank(b.confidence) - rank(a.confidence);
    return personB - personA;
  });

  // Filter out candidates that clearly belong to someone else (different name in local-part)
  const forThisPerson = sorted.filter(c => {
    if (c.source === "pattern" || c.source.startsWith("pattern-")) return true;
    return matchesPerson(c.email);
  });

  const primary = forThisPerson[0] || sorted[0] || null;
  const alternates = forThisPerson.slice(1, 4);

  // If nothing verified or high, mark the top pattern as "unverified"
  if (primary && primary.confidence === "low") {
    primary.confidence = "unverified";
  }

  return {
    primary,
    alternates,
    sources: [...allSources],
    inferredPattern: inferredPatternName,
  };
}
