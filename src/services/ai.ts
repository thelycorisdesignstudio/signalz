// Signalz AI Service - calls backend proxy (API keys secured server-side)

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
  
  // Responses API returns output array with message items
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
  
  // Clean up the text: remove markdown code blocks if present
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    // Attempt to extract JSON if it's wrapped in markdown or has extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        // If it still fails, it might be truncated. Attempt a basic repair.
        try {
          return repairTruncatedJson(jsonMatch[0]);
        } catch (repairError) {
          console.error("Failed to repair truncated JSON:", repairError);
        }
      }
    }
    
    // Last resort: try to repair the original cleaned text
    try {
      return repairTruncatedJson(cleanedText);
    } catch (finalError) {
      console.error("JSON Parse Error. Original text snippet:", cleanedText.substring(0, 100));
      throw e;
    }
  }
}

function repairTruncatedJson(json: string): any {
  let repaired = json.trim();
  
  // Count open and close braces/brackets
  let openBraces = (repaired.match(/\{/g) || []).length;
  let closeBraces = (repaired.match(/\}/g) || []).length;
  let openBrackets = (repaired.match(/\[/g) || []).length;
  let closeBrackets = (repaired.match(/\]/g) || []).length;
  
  // Check for unclosed string
  // A string is unclosed if there's an odd number of non-escaped double quotes
  const quotes = repaired.match(/(^|[^\\])"/g) || [];
  if (quotes.length % 2 !== 0) {
    repaired += '"';
  }

  // Remove trailing commas which are common in truncated JSON
  repaired = repaired.replace(/,\s*$/, '');
  
  // Close open brackets
  while (openBrackets > closeBrackets) {
    repaired += ']';
    closeBrackets++;
  }
  
  // Close open braces
  while (openBraces > closeBraces) {
    repaired += '}';
    closeBraces++;
  }
  
  return JSON.parse(repaired);
}

export async function getAccountIntelligence(query: string, recentSignals: any[] = []) {
  const prompt = `Research the company "${query}" and return ONLY a JSON object (no markdown, no code blocks). Use this exact structure:
{
  "company": {"name":"string","summary":"string","tagline":"string","industry":"string","size":"string","headquarters":"string","website":"string","healthScore":75,"intentScore":{"score":70,"justification":"string"},"timeline":{"last3Months":[{"event":"string","date":"string","type":"string"}],"last6Months":[],"last12Months":[]},"sentiment":"string","riskLevel":"string","recentNews":["string"],"logo":null},
  "keyPeople":[{"name":"string","title":"string","linkedin":"string","hook":"string","priorityRank":1,"influence":"High","focus":"string","style":"string"}],
  "interestingFacts":[{"title":"string","description":"string","source":"string","date":"string"}],
  "hiringTrends":[{"department":"string","openRoles":5,"growth":"string"}],
  "fundingRounds":[{"round":"string","amount":"string","date":"string","investors":["string"]}],
  "financials":{"revenue":"string","growth":"string","valuation":"string"},
  "competitors":[{"name":"string","marketShare":"string","advantage":"string","strengths":["string"],"weaknesses":["string"]}],
  "techStack":["string"],
  "valueMapping":[{"priority":"string","value":"string"}],
  "competitiveIntelligence":{"recentMove":"string","positioning":["string"]},
  "objectionHandling":[{"objection":"string","response":"string"}],
  "suggestedEmail":{"subject":"string","body":"string","recipient":"string"},
  "similarCompanies":[{"name":"string","industry":"string","whyApproach":"string"}]
}
Be concise. Use real web data. All string values must be properly JSON-escaped (no raw newlines inside strings).`;

  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch (error) {
    console.error("AI Intelligence Error:", error);
    try {
      const text = await callAI(prompt, false);
      return safeJsonParse(text || "{}");
    } catch (retryError) {
      console.error("AI Intelligence Retry Error:", retryError);
      return null;
    }
  }
}


export async function generateEmailDraft(companyName: string, intelligenceSummary: string, signals: any[], stakeholder?: { name: string; role: string }) {
  const stakeholderContext = stakeholder 
    ? `The email should be addressed specifically to ${stakeholder.name}, who is the ${stakeholder.role} at ${companyName}. Tailor the message to their specific role and responsibilities.`
    : `The email should be addressed to a key decision-maker at ${companyName}.`;

  const prompt = `Generate a masterfully crafted, high-converting cold email draft for ${companyName} on behalf of your company.
  
  ${stakeholderContext}
  
  Context from Intelligence Summary: ${intelligenceSummary}
  Recent Signals: ${JSON.stringify(signals)}
  
  The email must be:
  1. Exceptionally well-written, professional, and highly persuasive.
  2. Focused on positioning Signalz (global IT/Cyber leader) and your AI solution (AI operational excellence) as the definitive strategic partners to solve their specific challenges.
  3. Action-oriented, concise, and impactful (zero fluff).
  4. Reference a specific recent signal, pain point, or strategic priority discovered in the intelligence to demonstrate deep research.
  5. Offer a clear, low-friction, and compelling next step (e.g., a 10-minute introductory chat to share specific insights).
  6. Written in a confident, authoritative, yet helpful and collaborative tone.
  
  The goal is to ensure they see Signalz as a high-value strategic lead that is essential for their business success.
  
  Return only the email body text.`;

  try {
    const text = await callAI(prompt);
    return text.trim() || "";
  } catch (error) {
    console.error("Azure OpenAI Email Draft Error:", error);
    return `Hi ${stakeholder?.name || 'there'},\n\nI noticed the recent developments at ${companyName} and wanted to reach out. Given your focus on growth, I believe our solution could help streamline your operations.\n\nWould you be open to a brief chat next week?\n\nBest,\nAlex`;
  }
}

export async function generateLinkedInMessage(stakeholder: any, companyName: string, intelligenceSummary: string) {
  const prompt = `Generate a professional LinkedIn connection request message for ${stakeholder.name}, who is the ${stakeholder.role} at ${companyName}.
  
  Context from Intelligence Summary: ${intelligenceSummary}
  
  The message should be:
  1. Professional yet conversational.
  2. Under 300 characters (LinkedIn limit).
  3. Contextualized by their role and the recent company intelligence.
  4. Focused on building a relationship, not a hard sell.
  
  Return only the message text.`;

  try {
    const text = await callAI(prompt);
    return text.trim() || "";
  } catch (error) {
    console.error("Azure OpenAI LinkedIn Message Error:", error);
    return `Hi ${stakeholder.name.split(' ')[0]}, I've been following ${companyName}'s recent progress and would love to connect and learn more about your work in ${stakeholder.role}.`;
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
    ? `This is step ${stepNumber} in a sequence. Previous steps were: ${JSON.stringify(previousSteps)}.`
    : `This is the first step (step ${stepNumber}) in a sequence.`;

  const prompt = `Generate content for a ${type} outreach message to ${stakeholder.name} (${stakeholder.title}) at ${companyName}.
  
  ${previousContext}
  
  Context from Intelligence Summary: ${intelligenceSummary}
  Stakeholder Focus: ${stakeholder.focus}
  Stakeholder Style: ${stakeholder.style}
  
  The message should:
  1. Be highly personalized and relevant to their role.
  2. If it's an email, include a compelling subject line.
  3. If it's LinkedIn, keep it brief and professional.
  4. Build on previous interactions if any.
  5. Have a clear, low-friction call to action.
  
  Format the response as a JSON object:
  {
    "subject": "string (only for email, else null)",
    "content": "string"
  }`;

  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch (error) {
    console.error("Azure OpenAI Sequence Step Error:", error);
    // Retry without jsonMode
    try {
      const text = await callAI(prompt, false);
      return safeJsonParse(text || "{}");
    } catch (retryError) {
      return {
        subject: type === 'email' ? `Follow-up regarding ${companyName}` : null,
        content: `Hi ${stakeholder.name.split(' ')[0]}, I wanted to follow up on my previous message regarding ${companyName}.`
      };
    }
  }
}

export async function parseLinkedInProfile(url: string) {
  const prompt = `Research and parse the following LinkedIn profile URL: "${url}".
  
  Provide a detailed breakdown of the user's professional profile, including:
  1. Full Name
  2. Current Headline
  3. Profile Picture URL (if available, else a placeholder)
  4. Connection Count
  5. Follower Count
  6. Summary/About section
  7. Recent Activities (3-5 items with title, description, and date)
  8. Experience (3-5 recent roles with title, company, and duration)
  9. Education (top 2 items)
  10. Skills (top 5-10)
  
  Format the response as a JSON object with the following structure:
  {
    "full_name": "string",
    "headline": "string",
    "profile_pic_url": "string",
    "connections": number,
    "follower_count": number,
    "summary": "string",
    "activities": [{"title": "string", "description": "string", "date": "string"}],
    "experience": [{"title": "string", "company": "string", "duration": "string"}],
    "education": [{"school": "string", "degree": "string"}],
    "skills": ["string"]
  }`;

  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch (error) {
    console.error("Azure OpenAI LinkedIn Parse Error:", error);
    // Retry without jsonMode
    try {
      const text = await callAI(prompt, false);
      return safeJsonParse(text || "{}");
    } catch (retryError) {
      console.error("Azure OpenAI LinkedIn Parse Retry Error:", retryError);
      return null;
    }
  }
}

export async function generateEmailTemplates(companyName: string, intelligenceSummary: string) {
  const prompt = `Generate 3 distinct, high-converting email templates for outreach to ${companyName} on behalf of your company.
  
  Context: ${intelligenceSummary}
  
  Templates should cover:
  1. "The Breakthrough" - A bold, high-impact first touch.
  2. "The Insight" - Focused on a specific recent company signal or news.
  3. "The Value Map" - Directly mapping Signalz's value to their strategic priorities.
  4. "The Competitive Pivot" - Specifically addressing a 'Competitor Move Detected' (e.g., TechCorp's new security standard adoption) and highlighting the urgency for your company's solutions.
  
  Format the response as a JSON object:
  {
    "templates": [
      {
        "id": "string",
        "name": "string",
        "subject": "string",
        "body": "string"
      }
    ]
  }`;

  try {
    const text = await callAI(prompt, true);
    return safeJsonParse(text || "{}");
  } catch (error) {
    console.error("Azure OpenAI Email Templates Error:", error);
    // Retry without jsonMode
    try {
      const text = await callAI(prompt, false);
      return safeJsonParse(text || "{}");
    } catch (retryError) {
      return { templates: [] };
    }
  }
}
