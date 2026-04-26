// azureClient.ts - shared model client with 3-way race (Sonnet + Kimi + GPT).
// Public functions:
//   callAzure(systemPrompt, userMessage, opts) - plain text response (winner of race)
//   callAzureJson(systemPrompt, userMessage, opts) - expects JSON, attempts repair

export interface AzureCallOptions {
  maxTokens?: number;
  timeoutMs?: number;
}

// Lazy accessors — read env at call time so dotenv.config() has run first
function getSonnetEndpoint() { return process.env.ANTHROPIC_ENDPOINT || "https://teamsuperorbit-3599-resource.services.ai.azure.com/anthropic"; }
function getSonnetKey() { return process.env.ANTHROPIC_API_KEY || ""; }
function getSonnetModel() { return process.env.ANTHROPIC_DEPLOYMENT || "claude-sonnet-4-6-1"; }

function getKimiEndpoint() { return process.env.AZURE_OPENAI_ENDPOINT || "https://vera-resource.services.ai.azure.com"; }
function getKimiKey() { return process.env.AZURE_OPENAI_API_KEY || ""; }
function getKimiModel() { return process.env.AZURE_OPENAI_DEPLOYMENT || "Kimi-K2.5"; }
function getKimiUrl() { return getKimiEndpoint() + "/models/chat/completions"; }

function getGptEndpoint() { return process.env.AZURE_FALLBACK_ENDPOINT || ""; }
function getGptKey() { return process.env.AZURE_FALLBACK_API_KEY || ""; }
function getGptModel() { return process.env.AZURE_FALLBACK_MODEL || "gpt-5.2-codex"; }
function getGptUrl() { return getGptEndpoint() + "/openai/v1/responses"; }

export function diagnoseKeys(): { configured: string[]; missing: string[]; anyAvailable: boolean } {
  const configured: string[] = [];
  const missing: string[] = [];
  if (getSonnetKey()) configured.push("Sonnet (ANTHROPIC_API_KEY)"); else missing.push("ANTHROPIC_API_KEY");
  if (getKimiKey()) configured.push("Kimi (AZURE_OPENAI_API_KEY)"); else missing.push("AZURE_OPENAI_API_KEY");
  if (getGptKey()) configured.push("GPT (AZURE_FALLBACK_API_KEY)"); else missing.push("AZURE_FALLBACK_API_KEY");
  return { configured, missing, anyAvailable: configured.length > 0 };
}

async function callSonnet(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const key = getSonnetKey();
  if (!key) throw new Error("Sonnet key missing");
  const body = {
    model: getSonnetModel(),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };
  const r = await fetch(getSonnetEndpoint() + "/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("SONNET_RATE_LIMITED");
  if (!r.ok) {
    const errTxt = await r.text();
    throw new Error("Sonnet HTTP " + r.status + ": " + errTxt.slice(0, 200));
  }
  const d = await r.json();
  // Anthropic messages format: content is array of blocks, get first text block
  const blocks = d.content || [];
  const text = blocks.find((b: any) => b.type === "text")?.text?.trim() || "";
  if (!text) throw new Error("Empty Sonnet response");
  return text;
}

async function callKimiOnce(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const key = getKimiKey();
  if (!key) throw new Error("Kimi key missing");
  const body = {
    model: getKimiModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: Math.max(maxTokens * 3, 4000),
  };
  const r = await fetch(getKimiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": key },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("KIMI_RATE_LIMITED");
  if (!r.ok) throw new Error("Kimi HTTP " + r.status);
  const d = await r.json();
  const text = (d.choices?.[0]?.message?.content || "").trim();
  if (!text) {
    // Some Kimi runs return reasoning_content but empty content. Surface that
    // so the retry layer above can decide.
    const reasoning = d.choices?.[0]?.message?.reasoning_content;
    if (reasoning && typeof reasoning === "string" && reasoning.trim().length > 50) {
      // Edge case: model only produced reasoning, no answer. Treat as transient.
      throw new Error("Kimi produced only reasoning, no answer");
    }
    throw new Error("Empty Kimi response");
  }
  return text;
}

/**
 * Kimi caller with retry. If Kimi exhausts its tokens on chain-of-thought and
 * returns empty, we retry once with an even bigger budget. This is the
 * single biggest reliability win because Kimi is the primary path now that
 * Sonnet is dead.
 */
async function callKimi(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  try {
    return await callKimiOnce(systemPrompt, userMessage, maxTokens);
  } catch (err: any) {
    const msg = String(err?.message || "");
    // Only retry on the empty-response failure mode. Don't retry rate limits
    // or HTTP errors — those need different handling.
    if (msg.includes("Empty Kimi") || msg.includes("only reasoning")) {
      console.log("[azureClient] kimi empty, retrying with 8x budget");
      return await callKimiOnce(systemPrompt, userMessage, Math.max(maxTokens * 3, 12000));
    }
    throw err;
  }
}

async function callGpt(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const endpoint = getGptEndpoint();
  const key = getGptKey();
  if (!endpoint || !key) throw new Error("GPT not configured");
  const body = {
    model: getGptModel(),
    input: userMessage,
    instructions: systemPrompt,
    max_output_tokens: maxTokens,
  };
  const r = await fetch(getGptUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": key },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("GPT HTTP " + r.status);
  const d = await r.json();
  const msg = (d.output || []).find((i: any) => i.type === "message");
  const text = ((msg?.content || []).find((c: any) => c.type === "output_text")?.text || "").trim();
  if (!text) throw new Error("Empty GPT response");
  return text;
}

/**
 * Race 3 models, return whichever responds first with non-empty text.
 * Sonnet 4.6 is the primary intelligence tier; Kimi + GPT as fast fallbacks.
 */
export async function callAzure(
  systemPrompt: string,
  userMessage: string,
  opts: AzureCallOptions = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? 4000;
  const timeoutMs = opts.timeoutMs ?? 180000; // 3 minutes for Sonnet

  // Sonnet-first: try Sonnet with full timeout budget. Fallback to Kimi/GPT race if Sonnet fails.
  try {
    const text = await Promise.race([
      callSonnet(systemPrompt, userMessage, maxTokens),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("SONNET_TIMEOUT")), timeoutMs)),
    ]);
    console.log("[azureClient] winner=sonnet len=" + text.length);
    return text;
  } catch (sonnetErr: any) {
    console.log("[azureClient] sonnet failed, falling back: " + sonnetErr.message);
  }

  // Fallback: race Kimi + GPT
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const done = { kimi: false, gpt: false };
    const errs: Record<string, any> = {};

    const check = () => {
      if (settled) return;
      if (done.kimi && done.gpt) {
        settled = true;
        reject(new Error(
          "Sonnet + both fallbacks failed: kimi=" + (errs.kimi?.message || "?") + " | gpt=" + (errs.gpt?.message || "?")
        ));
      }
    };

    const win = (text: string, src: string) => {
      if (settled) return;
      settled = true;
      console.log("[azureClient] winner=" + src + " (fallback) len=" + text.length);
      resolve(text);
    };

    callKimi(systemPrompt, userMessage, maxTokens)
      .then((t) => win(t, "kimi"))
      .catch((e) => { done.kimi = true; errs.kimi = e; check(); });
    callGpt(systemPrompt, userMessage, Math.min(maxTokens, 2500))
      .then((t) => win(t, "gpt"))
      .catch((e) => { done.gpt = true; errs.gpt = e; check(); });

    setTimeout(() => {
      if (!settled) { settled = true; reject(new Error("Fallback race timed out")); }
    }, 60000);
  });
}

/**
 * JSON-constrained call. Strips fences, repairs if needed.
 */
export async function callAzureJson<T = any>(
  systemPrompt: string,
  userMessage: string,
  opts: AzureCallOptions = {},
): Promise<T> {
  const reinforced = systemPrompt +
    "\n\nIMPORTANT: Return ONLY a valid JSON object. No markdown fences. No prose before or after. Start with { and end with }. " +
    "Do not use em dashes in any field - use hyphens. Do not include emoji.";
  const raw = await callAzure(reinforced, userMessage, opts);
  return parseJsonSafe<T>(raw);
}

export function parseJsonSafe<T = any>(raw: string): T {
  let cleaned = (raw || "")
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return repairJson<T>(cleaned);
  }
}

function repairJson<T>(json: string): T {
  let repaired = json.trim().replace(/,\s*([}\]])/g, "$1");
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  const quotes = (repaired.match(/(^|[^\\])"/g) || []).length;
  if (quotes % 2 !== 0) repaired += '"';
  for (let i = closeBrackets; i < openBrackets; i++) repaired += "]";
  for (let i = closeBraces; i < openBraces; i++) repaired += "}";
  return JSON.parse(repaired);
}
