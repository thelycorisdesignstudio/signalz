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
    "You are an elite B2B sales copywriter crafting 3 personalized cold outreach emails for a salesperson at " + senderCompany + ". " +
    "You are writing to 3 real people at " + company + ". " +
    "STRUCTURE for each email (follow this exactly): " +
    "1. OPENING (1-2 sentences): A specific, researched hook about the recipient or their company. If we provided a bestHook, weave it in naturally. If not, reference something concrete about their role, a recent company move, or industry trend that affects them. " +
    "2. BRIDGE (2-3 sentences): Connect the hook to a challenge or opportunity they likely face. Show you understand their world. Be specific - mention their industry, their scale, or a trend that affects companies like theirs. " +
    "3. VALUE (1-2 sentences): Introduce what " + senderCompany + " does and why it matters for them specifically. Value prop: '" + valueLine + "'. Tie it to the challenge you just described. " +
    "4. ASK (1 sentence): One specific, low-commitment call to action. Not vague. Examples: 'Worth 15 min next Tuesday to walk through how this would work for " + company + "?' or 'Happy to send a 2-page brief showing what we found on your market - want me to?' " +
    "5. SIGN-OFF: Brief and warm. " +
    "HARD RULES: " +
    "- 180-220 words per body (detailed but tight). " +
    "- NEVER use: synergies, leverage, best-in-class, game-changer, disrupt, paradigm, circle back, touch base, reach out, pick your brain, move the needle, low-hanging fruit, thought leader. " +
    "- No em dashes (use hyphens). No emoji. " +
    "- Each of the 3 emails MUST use a completely different angle and hook. " +
    "- Tone: warm, specific, curious, human. Sound like a smart senior seller, not a template. " +
    "- If no bestHook was provided, use the recipient's role + company context to write a thoughtful opener. Never pretend to reference content we don't have. " +
    "For each email provide: subject (<60 chars, specific, not 'Quick question'), 3 subjectAlternates, body, hooks (3 short phrases describing the angles used), callToAction. " +
    "Return JSON: {\"emails\":[{recipientName,recipientTitle,subject,subjectAlternates:[],body,hooks:[],callToAction}]}";

  const user = JSON.stringify({
    company,
    companySummary: (companySummary || "").slice(0, 800),
    strategicActivity: (strategicActivity || []).slice(0, 6),
    people: peopleBlob,
    sender: { name: senderName, role: senderRole, company: senderCompany, valueLine },
  });

  const activitySnippets = (strategicActivity || []).slice(0, 3);
  const summaryShort = (companySummary || "").slice(0, 300);

  let parsed: any;
  try {
    parsed = await callAzureJson(sys, user, { maxTokens: 4500, timeoutMs: 90000 });
  } catch (e: any) {
    console.log("[emailDrafter] generation failed: " + e.message);
    const angles = [
      { hook: "strategic-direction", opener: (p: EnrichedPerson) => `I have been following ${company}'s recent moves${activitySnippets[0] ? " - particularly " + activitySnippets[0] : ""}, and your role as ${p.title} caught my attention.` },
      { hook: "industry-trend", opener: (p: EnrichedPerson) => `As ${p.title} at ${company}, you are likely navigating some of the same challenges we hear from leaders across the industry${summaryShort ? " - especially around " + summaryShort.split(".")[0].toLowerCase().slice(0, 80) : ""}.` },
      { hook: "value-alignment", opener: (p: EnrichedPerson) => `${company}'s position in the market${activitySnippets[1] ? " and recent activity around " + activitySnippets[1] : ""} caught our eye, and I wanted to connect with you specifically.` },
    ];
    return top3.map((p, i) => {
      const angle = angles[i % angles.length];
      const firstName = p.name.split(" ")[0];
      return {
        recipientName: p.name,
        recipientTitle: p.title,
        recipientEmailGuess: p.email || null,
        emailConfidence: p.emailConfidence || "low",
        subject: `${firstName} - a thought on ${company}'s next move`,
        subjectAlternates: [`For ${firstName}: ${company} and what we are seeing`, `${company}'s trajectory - quick thought`],
        body: `Hi ${firstName},\n\n${angle.opener(p)}\n\n${valueLine}\n\nWe have been working with companies in similar positions and the patterns we are seeing could be relevant to where ${company} is headed. I put together a short brief on what we found - happy to share it if useful.\n\nWould 15 minutes next week work to walk through it? No pressure either way.\n\nBest,\n${senderName}${senderRole ? "\n" + senderRole + ", " + senderCompany : ""}`,
        hooks: [angle.hook, "value-prop", "low-commitment ask"],
        callToAction: "15 min call next week",
      };
    });
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

    // Enforce word limit (soft: truncate on sentence boundary if over 250)
    if (wordCount(body) > 250) {
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
