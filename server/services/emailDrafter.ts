// emailDrafter.ts - human-quality outreach drafts.
// Rules enforced in prompt AND in post-processing (banned-word filter, em-dash -> hyphen).

import { callAzureJson } from "./azureClient.js";

export interface SenderProfile {
  name?: string;
  role?: string;
  company?: string; // default: Signalz AI
  valueLine?: string;
}

export interface EnrichedPerson {
  name: string;
  title: string;
  email?: string | null;
  emailConfidence?: string;
  activityBestHook?: string | null;
  activityNarrative?: string | null;
  evidenceSnippets?: string[];
}

export interface EmailDraft {
  recipientName: string;
  recipientTitle: string;
  recipientEmailGuess: string | null;
  emailConfidence: string;
  subject: string;
  subjectAlternates: string[];
  body: string;
  hooks: string[];
  callToAction: string;
}

const BANNED_PHRASES = [
  "synerg", "leverage", "best-in-class", "game-chang", "disrupt",
  "paradigm", "circle back", "touch base", "reach out", "pick your brain",
  "move the needle", "low-hanging fruit", "thought leader",
];

function sanitize(text: string): string {
  if (!text) return text;
  // Replace em dashes with hyphens
  let out = text.replace(/[\u2014\u2013]/g, "-");
  // Strip emoji-ish characters
  out = out.replace(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F0FF}\u{2600}-\u{27BF}]/gu, "");
  return out.trim();
}

function containsBanned(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter(p => lower.includes(p));
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Generate 3 distinct email drafts for the top 3 people.
 */
export async function draftEmails(
  company: string,
  companySummary: string,
  strategicActivity: string[],
  people: EnrichedPerson[],
  sender: SenderProfile,
): Promise<EmailDraft[]> {
  const senderName = sender.name || "the Signalz team";
  const senderRole = sender.role || "";
  const senderCompany = sender.company || "Signalz AI";
  const valueLine = sender.valueLine || "We help B2B sellers cut account research from 3 hours to 15 minutes with evidence-backed intelligence.";

  const top3 = people.slice(0, 3);

  // Fallback: when no people were discovered, generate template emails to generic roles
  if (top3.length === 0) {
    const genericRecipients = [
      { name: `Decision Maker at ${company}`, title: "Decision Maker" },
      { name: `Head of Operations at ${company}`, title: "Head of Operations" },
    ];

    const activityContext = (strategicActivity || []).slice(0, 3).join("; ");
    const summarySnippet = (companySummary || "").slice(0, 300);

    const fallbackSys =
      "You are a writer crafting 2 cold outreach emails for a salesperson at " + senderCompany + ". " +
      "You are writing to unknown contacts at " + company + " using generic role titles. " +
      "HARD RULES (violations will be rejected): " +
      "- Max 120 words per body. " +
      "- Open with a specific insight about the company drawn from the summary and strategic activity provided. " +
      "- NEVER use these words: synergies, leverage, best-in-class, game-changer, disrupt, paradigm, circle back, touch base, reach out, pick your brain, move the needle, low-hanging fruit, thought leader. " +
      "- NEVER use em dashes. Use hyphens. " +
      "- NEVER use emoji. " +
      "- ONE concrete ask per email. " +
      "- Reference " + senderCompany + "'s value in ONE line max: '" + valueLine + "'. " +
      "- Each email must use a DIFFERENT angle. " +
      "- Tone: warm, specific, curious, human. " +
      "For each email provide: subject (<60 chars), 3 subjectAlternates, body, hooks (3 phrases), callToAction. " +
      "Return JSON: {\"emails\":[{recipientName,recipientTitle,subject,subjectAlternates:[],body,hooks:[],callToAction}]}";

    const fallbackUser = JSON.stringify({
      company,
      companySummary: summarySnippet,
      strategicActivity: activityContext,
      recipients: genericRecipients,
      sender: { name: senderName, role: senderRole, company: senderCompany, valueLine },
    });

    let fallbackParsed: any;
    try {
      fallbackParsed = await callAzureJson(fallbackSys, fallbackUser, { maxTokens: 2000, timeoutMs: 60000 });
    } catch (e: any) {
      console.log("[emailDrafter] fallback generation failed: " + e.message);
      // Last-resort static templates
      return genericRecipients.map((r) => ({
        recipientName: r.name,
        recipientTitle: r.title,
        recipientEmailGuess: null,
        emailConfidence: "none",
        subject: `A quick note for ${r.title} at ${company}`,
        subjectAlternates: [],
        body: `Hi,\n\nI have been following ${company}'s recent moves${activityContext ? " - particularly around " + activityContext.split(";")[0].trim() : ""}. ${valueLine}\n\nWorth 15 minutes next week to compare notes?\n\nBest,\n${senderName}`,
        hooks: ["company-activity", "value-prop", "time-bound ask"],
        callToAction: "15 min call next week",
      }));
    }

    const fallbackEmails = Array.isArray(fallbackParsed?.emails) ? fallbackParsed.emails : [];
    return genericRecipients.map((r, i) => {
      const raw = fallbackEmails[i] || {};
      let body = sanitize(raw.body || `Hi,\n\nI have been following ${company}. ${valueLine}\n\nWorth 15 minutes next week?\n\nBest,\n${senderName}`);
      let subject = sanitize(raw.subject || `A quick note for ${r.title} at ${company}`);

      const banned = containsBanned(body);
      if (banned.length > 0) {
        for (const b of banned) {
          body = body.replace(new RegExp(b + "[a-z]*", "gi"), "");
        }
        body = body.replace(/\s{2,}/g, " ").trim();
      }

      return {
        recipientName: raw.recipientName || r.name,
        recipientTitle: raw.recipientTitle || r.title,
        recipientEmailGuess: null,
        emailConfidence: "none",
        subject,
        subjectAlternates: Array.isArray(raw.subjectAlternates) ? raw.subjectAlternates.slice(0, 3).map(sanitize) : [],
        body,
        hooks: Array.isArray(raw.hooks) ? raw.hooks.slice(0, 3).map(sanitize) : ["company-insight", "value-prop", "time-bound ask"],
        callToAction: sanitize(raw.callToAction || "15 min call next week"),
      };
    });
  }

  const peopleBlob = top3.map((p, i) => ({
    index: i,
    name: p.name,
    title: p.title,
    bestHook: p.activityBestHook || null,
    narrative: p.activityNarrative || null,
    email: p.email || null,
    emailConfidence: p.emailConfidence || "low",
  }));

  const sys =
    "You are a writer crafting 3 cold outreach emails for a salesperson at " + senderCompany + ". " +
    "You are writing to 3 real people at " + company + ". " +
    "HARD RULES (violations will be rejected): " +
    "- Max 150 words per body. " +
    "- Open with a specific hook tied to the recipient - their recent post, a product they shipped, an award, a talk they gave. If we gave you a bestHook, USE IT. " +
    "- NEVER use these words: synergies, leverage, best-in-class, game-changer, disrupt, paradigm, circle back, touch base, reach out, pick your brain, move the needle, low-hanging fruit, thought leader. " +
    "- NEVER use em dashes. Use hyphens. " +
    "- NEVER use emoji. " +
    "- ONE concrete ask. Not vague. Something like 'Worth 15 min next Tuesday?' or 'Can I send you the 2-page summary?' or 'Should I introduce you to X?'. " +
    "- Reference " + senderCompany + "'s value in ONE line max: '" + valueLine + "'. " +
    "- Each of the 3 emails must use a DIFFERENT hook angle - do not repeat the same opening across people. " +
    "- Tone: warm, specific, curious, human. Sound like a smart person wrote it. " +
    "- If we don't have a recent hook for someone, use their role+industry context to craft a thoughtful opener - but never pretend to reference content we don't know about. " +
    "For each email provide: subject (<60 chars, specific, not 'Quick question'), 3 subjectAlternates, body, hooks (3 short phrases describing angles used), callToAction (the one ask). " +
    "Return JSON: {\"emails\":[{recipientName,recipientTitle,subject,subjectAlternates:[],body,hooks:[],callToAction}]}";

  const user = JSON.stringify({
    company,
    companySummary: (companySummary || "").slice(0, 800),
    strategicActivity: (strategicActivity || []).slice(0, 6),
    people: peopleBlob,
    sender: { name: senderName, role: senderRole, company: senderCompany, valueLine },
  });

  let parsed: any;
  try {
    parsed = await callAzureJson(sys, user, { maxTokens: 3000, timeoutMs: 80000 });
  } catch (e: any) {
    console.log("[emailDrafter] generation failed: " + e.message);
    return top3.map((p) => ({
      recipientName: p.name,
      recipientTitle: p.title,
      recipientEmailGuess: p.email || null,
      emailConfidence: p.emailConfidence || "low",
      subject: `A note for ${p.name.split(" ")[0]}`,
      subjectAlternates: [],
      body: `Hi ${p.name.split(" ")[0]},\n\nI work on Signalz, a sales intelligence tool for people researching accounts like ${company}. ${valueLine}\n\nWorth 15 minutes next week?\n\nBest,\n${senderName}`,
      hooks: ["role-based", "value-prop", "time-bound ask"],
      callToAction: "15 min call next week",
    }));
  }

  const drafts: EmailDraft[] = [];
  const emails = Array.isArray(parsed?.emails) ? parsed.emails : [];
  for (let i = 0; i < top3.length; i++) {
    const person = top3[i];
    const raw = emails[i] || {};
    let body = sanitize(raw.body || "");
    let subject = sanitize(raw.subject || `A note for ${person.name.split(" ")[0]}`);
    const subjectAlternates = Array.isArray(raw.subjectAlternates)
      ? raw.subjectAlternates.slice(0, 3).map(sanitize)
      : [];

    // Enforce banned-word check (replace offenders with softer alternatives - best effort)
    const banned = containsBanned(body);
    if (banned.length > 0) {
      console.log("[emailDrafter] banned phrases in draft for " + person.name + ": " + banned.join(", "));
      for (const b of banned) {
        body = body.replace(new RegExp(b + "[a-z]*", "gi"), "");
      }
      body = body.replace(/\s{2,}/g, " ").trim();
    }

    // Enforce word limit (soft: truncate on sentence boundary if over 180)
    if (wordCount(body) > 180) {
      const sentences = body.split(/(?<=[.!?])\s+/);
      const kept: string[] = [];
      let count = 0;
      for (const s of sentences) {
        count += wordCount(s);
        kept.push(s);
        if (count >= 140) break;
      }
      body = kept.join(" ");
    }

    drafts.push({
      recipientName: raw.recipientName || person.name,
      recipientTitle: raw.recipientTitle || person.title,
      recipientEmailGuess: person.email || null,
      emailConfidence: person.emailConfidence || "low",
      subject,
      subjectAlternates,
      body,
      hooks: Array.isArray(raw.hooks) ? raw.hooks.slice(0, 3).map(sanitize) : [],
      callToAction: sanitize(raw.callToAction || "15 min call next week"),
    });
  }
  return drafts;
}
