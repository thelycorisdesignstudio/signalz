// azureClient.ts - shared Azure model client with dual-model race and fallback.
// Two public functions:
//   callAzure(systemPrompt, userMessage, opts) - plain text response (winner of race)
//   callAzureJson(systemPrompt, userMessage, opts) - expects JSON, attempts repair

export interface AzureCallOptions {
  maxTokens?: number;
  timeoutMs?: number;
}

const primaryEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://vera-resource.services.ai.azure.com";
const primaryKey = process.env.AZURE_OPENAI_API_KEY || "";
const primaryModel = process.env.AZURE_OPENAI_DEPLOYMENT || "Kimi-K2.5";
const primaryUrl = primaryEndpoint + "/models/chat/completions";

const fallbackEndpoint = process.env.AZURE_FALLBACK_ENDPOINT || "";
const fallbackKey = process.env.AZURE_FALLBACK_API_KEY || "";
const fallbackModel = process.env.AZURE_FALLBACK_MODEL || "gpt-5.2-codex";
const fallbackUrl = fallbackEndpoint + "/openai/v1/responses";

async function callChatCompletions(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const body = {
    model: primaryModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: maxTokens,
  };
  const r = await fetch(primaryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": primaryKey },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("RATE_LIMITED");
  if (!r.ok) throw new Error("Primary HTTP " + r.status);
  const d = await r.json();
  const text = (d.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new Error("Empty primary response");
  return text;
}

async function callResponsesApi(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  if (!fallbackEndpoint || !fallbackKey) throw new Error("Fallback not configured");
  const body = {
    model: fallbackModel,
    input: userMessage,
    instructions: systemPrompt,
    max_output_tokens: maxTokens,
  };
  const r = await fetch(fallbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": fallbackKey },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Fallback HTTP " + r.status);
  const d = await r.json();
  const msg = (d.output || []).find((i: any) => i.type === "message");
  const text = ((msg?.content || []).find((c: any) => c.type === "output_text")?.text || "").trim();
  if (!text) throw new Error("Empty fallback response");
  return text;
}

/**
 * Race both models, return whichever responds first with non-empty text.
 */
export async function callAzure(
  systemPrompt: string,
  userMessage: string,
  opts: AzureCallOptions = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? 4000;
  const timeoutMs = opts.timeoutMs ?? 90000;

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    let primaryDone = false;
    let fallbackDone = false;
    let primaryErr: any = null;
    let fallbackErr: any = null;

    const check = () => {
      if (settled) return;
      if (primaryDone && fallbackDone && primaryErr && fallbackErr) {
        settled = true;
        reject(new Error("Both models failed: " + primaryErr.message + " | " + fallbackErr.message));
      }
    };

    const win = (text: string, src: string) => {
      if (settled) return;
      settled = true;
      console.log("[azureClient] winner=" + src + " len=" + text.length);
      resolve(text);
    };

    callChatCompletions(systemPrompt, userMessage, maxTokens)
      .then((t) => win(t, "primary"))
      .catch((e) => {
        primaryDone = true;
        primaryErr = e;
        console.log("[azureClient] primary failed: " + e.message);
        check();
      });

    callResponsesApi(systemPrompt, userMessage, Math.min(maxTokens, 2500))
      .then((t) => win(t, "fallback"))
      .catch((e) => {
        fallbackDone = true;
        fallbackErr = e;
        console.log("[azureClient] fallback failed: " + e.message);
        check();
      });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Both models timed out after " + timeoutMs + "ms"));
      }
    }, timeoutMs);
  });
}

/**
 * JSON-constrained call. Instructs the model hard, strips fences, and repairs if needed.
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
