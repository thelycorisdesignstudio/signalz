// Signalz AI Service - calls backend proxy (API keys secured server-side)
// NEW: intelligence endpoint returns ground-truth data with evidence + citations.

async function callAI(prompt: string, jsonMode: boolean = false): Promise<string> {
  const response = await fetch("/api/ai/intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: prompt, jsonMode })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI error ${response.status}: ${errText}`);
  }
  const data = await response.json() as any;
  if (data.output) {
    const messageItem = data.output.find((item: any) => item.type === 'message');
    if (messageItem?.content) {
      const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
      return textContent?.text || "";
    }
  }
  return data.choices?.[0]?.message?.content || "";
}

function safeJsonParse(text: string) {
  if (!text) return {};
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (cleanedText.startsWith('```')) cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleanedText); } catch {}
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  return {};
}

function stripHtml(s: string): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function cleanSnippet(s: string): string {
  const cleaned = stripHtml(s);
  if (cleaned.length < 10 || /class=|div>|span>|button>/.test(cleaned)) return "";
  return cleaned;
}

function buildHook(p: any, companyName: string): string {
  if (p.activity?.bestHook) return p.activity.bestHook;
  if (p.activity?.publicNarrative) return p.activity.publicNarrative.slice(0, 140);
  const title = p.title || "";
  const name = p.name?.split(" ")[0] || "this executive";
  if (title.toLowerCase().includes("ceo") || title.toLowerCase().includes("founder"))
    return `As ${title} at ${companyName}, ${name} drives the company's strategic direction - a great entry point for executive-level conversations.`;
  if (title.toLowerCase().includes("cto") || title.toLowerCase().includes("engineering"))
    return `${name} leads the technical vision at ${companyName} - ideal for discussing technology partnerships and infrastructure.`;
  if (title.toLowerCase().includes("cfo") || title.toLowerCase().includes("finance"))
    return `${name} oversees financial strategy at ${companyName} - key for ROI-focused conversations and budget discussions.`;
  if (title.toLowerCase().includes("coo") || title.toLowerCase().includes("operations"))
    return `${name} manages operations at ${companyName} - well-positioned to discuss efficiency and process improvements.`;
  if (title.toLowerCase().includes("marketing") || title.toLowerCase().includes("cmo"))
    return `${name} leads marketing at ${companyName} - relevant for growth, brand, and demand-gen conversations.`;
  return `${name}'s role as ${title} at ${companyName} makes them a strong contact for strategic business discussions.`;
}

function adaptIntelligence(raw: any): any {
  if (!raw || typeof raw !== "object") return raw;
  const out = { ...raw };
  const companyName = out.company?.name || "";
  if (Array.isArray(out.keyPeople)) {
    out.keyPeople = out.keyPeople.map((p: any, idx: number) => ({
      ...p,
      hook: buildHook(p, companyName),
      focus: p.activity?.themes?.slice(0, 2).join(", ") || p.title || "",
      style: p.activity?.tone && p.activity.tone !== "unknown" ? p.activity.tone : "Professional",
      influence: idx === 0 ? "High" : (idx < 3 ? "Medium" : "Standard"),
      priorityRank: idx + 1,
    }));
  }
  // Map strategicActivity into legacy timeline buckets (3m/6m/12m) if timeline is empty
  if (out.company && (!out.company.timeline?.last3Months?.length) && Array.isArray(out.strategicActivity)) {
    const sa = out.strategicActivity;
    out.company.timeline = {
      last3Months: sa.slice(0, 3),
      last6Months: sa.slice(3, 6),
      last12Months: sa.slice(6, 12),
    };
  }
  // Summary backfill
  if (out.company && !out.summary) out.summary = out.company.summary;
  if (out.company && !out.signals && Array.isArray(out.company.recentNews)) {
    out.signals = out.company.recentNews.slice(0, 3).map((n: string) => ({ title: n }));
  }
  return out;
}

export async function getAccountIntelligence(query: string, _recentSignals: any[] = []) {
  try {
    let userProfile: any = undefined;
    try {
      const stored = localStorage.getItem('signalz_profile');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.name || p.company || p.valueLine) {
          userProfile = {
            senderName: p.name,
            senderTitle: p.role,
            senderCompany: p.company,
            valueLine: p.valueLine,
            outreachTone: p.outreachTone,
            mission: p.mission,
          };
        }
      }
    } catch {}

    const response = await fetch("/api/ai/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, jsonMode: true, userProfile })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI error ${response.status}: ${errText}`);
    }
    const data = await response.json() as any;
    let text = "";
    if (data.output) {
      const messageItem = data.output.find((item: any) => item.type === 'message');
      if (messageItem?.content) {
        const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
        text = textContent?.text || "";
      }
    }
    if (!text) text = data.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(text || "{}");
    return adaptIntelligence(parsed);
  } catch (error) {
    console.error("AI Intelligence Error:", error);
    return null;
  }
}

export async function findEmail(name: string, company: string, domain: string) {
  const response = await fetch("/api/email/find", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company, domain }),
  });
  if (!response.ok) throw new Error(`Email find error: ${response.status}`);
  return response.json();
}

export async function webSearch(q: string) {
  const r = await fetch("/api/ai/websearch?q=" + encodeURIComponent(q));
  if (!r.ok) throw new Error("Web search failed");
  return r.json();
}

export async function generateEmailDraft(companyName: string, intelligenceSummary: string, signals: any[], stakeholder?: { name: string; role: string }) {
  // Retained for backward compat - new drafts flow via /api/ai/intelligence outreach.emails
  const prompt = `Write a short, specific, human cold email to ${stakeholder?.name || "a decision maker"} (${stakeholder?.role || ""}) at ${companyName}. ` +
    `Context: ${intelligenceSummary.slice(0, 600)}. Signals: ${JSON.stringify(signals).slice(0, 400)}. ` +
    `Rules: no em dashes (use hyphens), no emoji, no corporate words (synergies, leverage, disrupt, circle back, touch base, reach out, pick your brain), max 120 words, one specific ask. Return only the body.`;
  try {
    const text = await callAI(prompt);
    return text.trim().replace(/[\u2014\u2013]/g, "-");
  } catch {
    return `Hi ${stakeholder?.name?.split(" ")[0] || "there"},\n\nI'm working on Signalz and came across ${companyName}. Worth 15 minutes next week to share what we're seeing in your space?\n\nBest,\nAlex`;
  }
}

export async function generateLinkedInMessage(stakeholder: any, companyName: string, intelligenceSummary: string) {
  const prompt = `Write a short LinkedIn connection note to ${stakeholder.name} (${stakeholder.role} at ${companyName}). Context: ${intelligenceSummary.slice(0, 400)}. Under 280 chars. No em dashes. No emoji. No corporate filler. Warm, specific, curious. Return only the message text.`;
  try {
    const text = await callAI(prompt);
    return text.trim().replace(/[\u2014\u2013]/g, "-");
  } catch {
    return `Hi ${stakeholder.name.split(" ")[0]}, following your work at ${companyName}. Would value connecting and swapping notes sometime.`;
  }
}

export async function generateSequenceStepContent(
  type: 'email' | 'linkedin',
  stepNumber: number,
  stakeholder: any,
  companyName: string,
  intelligenceSummary: string,
  previousSteps: any[] = []
) {
  const previousContext = previousSteps.length > 0
    ? `Step ${stepNumber} in a sequence. Previous: ${JSON.stringify(previousSteps).slice(0, 500)}.`
    : `First step (step ${stepNumber}).`;
  const prompt = `Write ${type} content for ${stakeholder.name} (${stakeholder.title}) at ${companyName}. ${previousContext} Context: ${intelligenceSummary.slice(0, 400)}. No em dashes. No emoji. No corporate fluff. One specific ask. Return JSON: {"subject": "string or null", "content": "string"}`;
  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch {
    return { subject: type === 'email' ? `Following up - ${companyName}` : null, content: `Hi ${stakeholder.name.split(' ')[0]}, following up on my earlier note.` };
  }
}

export async function parseLinkedInProfile(url: string) {
  const r = await fetch("/api/linkedin/parse", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }),
  });
  if (!r.ok) return null;
  return r.json();
}

export async function generateEmailTemplates(companyName: string, intelligenceSummary: string) {
  const prompt = `Generate 3 distinct cold email templates for ${companyName}. Context: ${intelligenceSummary.slice(0, 600)}. ` +
    `Rules: no em dashes (hyphens only), no emoji, no corporate filler (synergies, leverage, disrupt, circle back, touch base, reach out, pick your brain, thought leader). ` +
    `Each under 130 words. One specific ask. Subjects under 60 chars, specific (not "Quick question"). ` +
    `Return JSON: {"templates":[{"id","name","subject","body"}]}`;
  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch {
    return { templates: [] };
  }
}
