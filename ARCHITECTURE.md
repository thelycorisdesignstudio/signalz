# Signalz Architecture

This document describes the ground-truth research pipeline Signalz uses to produce
evidence-backed sales intelligence without hallucinating people, emails, or URLs.

## Core Principle

**The AI is never a researcher. It is a parser.**

Previously we asked the LLM to "research company X" and "generate 5 realistic executives".
That produced hallucinations: invented names, fake LinkedIn URLs, fabricated quotes.
The new architecture treats the LLM as a strict HTML/JSON extractor - we fetch real web
pages ourselves, then ask the LLM to extract facts that are literally present in the text.

If the text doesn't contain a fact, the LLM is explicitly instructed to return an empty
array rather than invent one. Post-processing code further rejects any person whose name
doesn't appear in the source HTML.

## Service Layout

```
/home/jarvis/signalz/
  server.ts                          # Thin Express layer - composes services
  src/services/
    azureClient.ts                   # Azure OpenAI + Kimi race client
    webSearch.ts                     # DDG, Bing, Google scrapers
    citationStore.ts                 # In-memory citation collector
    peopleService.ts                 # Evidence-first people discovery
    emailFinder.ts                   # SMTP + web + pattern email cascade
    activityMiner.ts                 # Public footprint mining per person
    emailDrafter.ts                  # Human-quality outreach drafts
    researchService.ts               # Two-phase research orchestrator
    ai.ts                            # Legacy frontend AI service
```

## Data Flow

```
POST /api/ai/intelligence { query: "Fastmarkets" }
  |
  v
researchService.runResearch()
  |
  +-- resolveDomain()             # guess <company>.com, verify with HTTP HEAD + search fallback
  |
  +-- phase1Research()            # fetch homepage + /about + search snippets -> raw brief
  |   |
  |   +-- webSearch.fetchPageText (homepage, /about)
  |   +-- webSearch.searchMulti (DDG + Bing, parallel)
  |   +-- CitationStore.add() for each URL touched
  |
  +-- peopleService.findRealPeople()  # PARALLEL with phase1
  |   |
  |   +-- fetch company site /leadership, /team, /about, etc.
  |   +-- fetch theorg.com/org/<slug>
  |   +-- fetch rocketreach.co/<slug>-email-format
  |   +-- search "<company> CEO OR CFO OR COO"
  |   +-- for each HTML blob: azureClient.callAzureJson(HTML extractor prompt)
  |   +-- reject any person whose name is not literally in the source HTML
  |   +-- dedupe by normalized name, merge evidence
  |   +-- verifyLinkedIn() via site:linkedin.com/in search
  |
  +-- phase2Synthesize(brief, realPeople)  # AI converts brief into structured JSON
  |   |
  |   Hard constraint in prompt: "only use information present in the brief.
  |   If a field cannot be filled, leave empty. Do not invent."
  |
  +-- FOR EACH top-5 person (in parallel):
  |   +-- emailFinder.findEmail(name, company, domain)
  |   |   +-- generate pattern candidates
  |   |   +-- SMTP verify top 4 (MX lookup + raw socket RCPT TO)
  |   |   +-- scrape company contact pages
  |   |   +-- search "<name> @<domain>" + filetype:pdf, apollo.io, rocketreach.co, etc.
  |   |   +-- GitHub commits API (author-email:@<domain>)
  |   |   +-- infer pattern from any real emails found, apply to target person
  |   |   +-- rank by confidence: verified > high > medium > low > unverified
  |   |
  |   +-- activityMiner.mineActivity(name, company)
  |       +-- search LinkedIn posts, Medium, Substack, podcast/keynote queries
  |       +-- filter results: person name must appear in title or snippet
  |       +-- azureClient.callAzureJson for categorization + tone + bestHook
  |       +-- final safety: all URLs in output must come from collected results
  |
  +-- emailDrafter.draftEmails(top3 people)
  |   +-- system prompt enforces: no corporate filler, no em dashes, no emoji, max 150 words
  |   +-- uses each person's activity.bestHook as opener when available
  |   +-- generates 3 subject alternates per email for A/B testing
  |   +-- post-processing: banned-word filter, em-dash -> hyphen, word-count cap
  |
  +-- compute meta.dataQuality
  |   +-- "verified"  = 6+ people and 5+ citations
  |   +-- "partial"   = 3-5 people, or low citations
  |   +-- "low"       = 1-2 people
  |   +-- "no_people_found" = 0 people (honest failure)
  |
  v
Response: { company, keyPeople, outreach, citations, meta, ... }
```

## Email Discovery Cascade

Four layers, each higher-confidence than the last:

| Layer | Method | Confidence | Time |
|-------|--------|-----------|------|
| 1 | Pattern generation (10 patterns per name) | low | instant |
| 2 | SMTP RCPT TO check against MX host | verified | ~5s |
| 3 | Web scraping (company site, search, GitHub) | high (if name matches) | ~15s |
| 4 | Pattern inference from real emails at domain | medium | instant |

The final primary email is the highest-confidence candidate whose local-part contains
either the first or last name of the target. If nothing matches, we return the top
pattern candidate labeled `unverified` so the user still has a guess to work with.

## Caching Strategy

| What | Where | TTL |
|------|-------|-----|
| Intelligence reports | `intelligence_cache` table | 24 hours |
| Email lookups | `email_cache` table | 30 days |
| Lookup audit log | `email_lookup_log` table | permanent |
| Activity mining | not cached separately (carried inside intelligence_cache) | 24 hours |

Bypass cache with `skipCache: true` in the request body.

## Web Scraping Ethics

- User-Agent declares `Signalz/1.0` in the UA string.
- All scrapers have 8-second timeouts.
- Rate-limited: 400ms between same-domain requests, 600ms between search queries.
- Scrapers respect 429 and 403 (back off, skip source).
- No login-walled content.
- All scraping is public-data only, used for business intelligence.

## Ground Truth Guarantees

1. Every person in `keyPeople` has at least one `evidence` entry with a real URL and a snippet containing their name.
2. `linkedin` is null unless we actually found it in a page or via search (never invented from the name).
3. `linkedinStatus` is `"verified"` only when the URL appeared in real content; otherwise `"not_found"`.
4. `email` is null or labeled with honest confidence (`verified`/`high`/`medium`/`low`/`unverified`).
5. `meta.dataQuality` reflects reality. If the company blocks scrapers, we say so in `caveats`.

## API Surface

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/intelligence` | Full research - returns structured intelligence |
| `GET /api/ai/websearch?q=...` | Raw web search (DDG + Bing merged) |
| `POST /api/email/find` | Email discovery for a single person |
| `GET /api/cache/:company` | Read cached intelligence |
| `POST /api/leads/score` | Lead scoring from intelligence payload |
| `POST /api/linkedin/parse` | Simulated LinkedIn profile parser |

Plus CRUD for leads, templates, watchlist, notes, and activity feed.

## Model Race

`azureClient.callAzure` races two Azure deployments in parallel:

- **Primary**: Kimi K2.5 on `vera-resource` (chat completions API)
- **Fallback**: GPT-5.2-codex on `teamsuperorbit-3599-resource` (Responses API)

Whichever returns valid non-empty content first wins. If both fail, the promise rejects
with both error messages. This gives us resilience against model outages and
roughly halves p95 latency.

## Environment Variables

```
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_DEPLOYMENT       # default Kimi-K2.5
AZURE_FALLBACK_ENDPOINT
AZURE_FALLBACK_API_KEY
AZURE_FALLBACK_MODEL          # default gpt-5.2-codex
GITHUB_TOKEN                  # optional, raises GitHub search rate limits
NODE_ENV=production
```

No keys are hardcoded anywhere; every sensitive value is read from environment.
