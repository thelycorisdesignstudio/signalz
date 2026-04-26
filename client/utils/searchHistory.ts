const HISTORY_KEY = 'signalz_search_history';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  companyName?: string;
}

export function addToHistory(query: string, companyName?: string): void {
  const history = getHistory();
  const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());
  filtered.unshift({ query, timestamp: Date.now(), companyName });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 10)));
}

export function getHistory(): SearchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
