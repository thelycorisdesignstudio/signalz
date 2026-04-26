// citationStore.ts - tracks sources cited during research
// Stored in-memory per request; server.ts attaches the bundle into intelligence output.

export interface Citation {
  id: string;
  source: string;       // Human label (e.g. "Fastmarkets.com", "LinkedIn", "Crunchbase")
  url?: string;         // URL if known
  snippet?: string;     // Short quote
  capturedAt: number;   // epoch ms
}

export class CitationStore {
  private items: Citation[] = [];
  private seen = new Set<string>();

  add(c: Omit<Citation, "id" | "capturedAt">): Citation {
    const key = (c.url || c.source || "").toLowerCase() + "|" + (c.snippet || "").slice(0, 40);
    if (this.seen.has(key)) return this.items.find(i => {
      const k = (i.url || i.source || "").toLowerCase() + "|" + (i.snippet || "").slice(0, 40);
      return k === key;
    })!;
    this.seen.add(key);
    const item: Citation = {
      id: "c" + (this.items.length + 1),
      source: c.source,
      url: c.url,
      snippet: c.snippet,
      capturedAt: Date.now(),
    };
    this.items.push(item);
    return item;
  }

  all(): Citation[] {
    return [...this.items];
  }

  count(): number {
    return this.items.length;
  }

  // Extract citations from a research brief by matching common URL patterns
  ingestFromText(text: string): void {
    if (!text) return;
    const urlRe = /https?:\/\/[^\s)\]"']+/g;
    const urls = text.match(urlRe) || [];
    for (const u of urls) {
      const clean = u.replace(/[.,;:)\]]+$/, "");
      try {
        const host = new URL(clean).hostname.replace(/^www\./, "");
        this.add({ source: host, url: clean });
      } catch {}
    }
    // Also capture explicit "Source: X" lines
    const srcRe = /(?:Source|Sources|Citation)s?\s*:\s*([^\n]+)/gi;
    let m;
    while ((m = srcRe.exec(text)) !== null) {
      const label = m[1].trim().slice(0, 120);
      if (label && !label.startsWith("http")) {
        this.add({ source: label });
      }
    }
  }
}
