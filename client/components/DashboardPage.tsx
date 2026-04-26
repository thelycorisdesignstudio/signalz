import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, Brain, Linkedin, Copy, Loader2, Building2, ArrowRight, 
  Users, Target, TrendingUp, Mail, ExternalLink, CheckCircle2, Zap, 
  ChevronRight, X, Info, MessageSquare, TrendingDown, AlertTriangle,
  Briefcase, DollarSign, Activity, BarChart3, Globe, Clock, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { getAccountIntelligence } from '../services/ai';
import { ComparePanel } from './ComparePanel';
import { ActivityFeed } from './ActivityFeed';
import { addToHistory, getHistory, clearHistory, SearchHistoryItem } from '../utils/searchHistory';
import { exportIntelligencePdf } from '../utils/exportPdf';

interface DashboardPageProps {
  onLogout: () => void;
  onSelectCompany: (companyName: string) => void;
  onNavigateDashboard?: () => void;
  onNavigateProfile?: () => void;
  onNavigateWatchlist?: () => void;
  onNavigateLeads?: () => void;
  onNavigateSequences?: () => void;
  onNavigateSettings?: () => void;
  onNavigateHelp?: () => void;
  onNavigateAccounts?: () => void;
}

// Detect buying signals from intelligence data
function detectBuyingSignals(result: any): Array<{label: string; type: 'hot'|'warm'|'neutral'; icon: string}> {
  const signals: Array<{label: string; type: 'hot'|'warm'|'neutral'; icon: string}> = [];
  const news = (result.company?.recentNews || []).join(' ').toLowerCase();
  const timeline = JSON.stringify(result.company?.timeline || {}).toLowerCase();
  const hiring = result.hiringTrends || [];
  const funding = result.fundingRounds || [];

  if (funding.length > 0) signals.push({ label: 'Recent Funding', type: 'hot', icon: '💰' });
  if (hiring.some((h: any) => h.growth > 20 || (typeof h.growth === 'string' && h.growth.includes('+')))) 
    signals.push({ label: 'Hiring Surge', type: 'hot', icon: '📈' });
  if (news.includes('launch') || news.includes('announced') || timeline.includes('launch'))
    signals.push({ label: 'Product Launch', type: 'warm', icon: '🚀' });
  if (news.includes('expan') || news.includes('partner'))
    signals.push({ label: 'Expansion Mode', type: 'warm', icon: '🌐' });
  if (news.includes('ceo') || news.includes('cto') || news.includes('chief') || news.includes('appoint'))
    signals.push({ label: 'Leadership Change', type: 'warm', icon: '👤' });
  if (news.includes('regulat') || news.includes('fine') || news.includes('lawsuit'))
    signals.push({ label: 'Regulatory Pressure', type: 'neutral', icon: '⚖️' });
  if (result.company?.intentScore?.score >= 70)
    signals.push({ label: 'High Intent', type: 'hot', icon: '🎯' });

  return signals.slice(0, 5);
}

// Stock ticker component
const StockTicker: React.FC<{ website?: string; companyName: string }> = ({ website, companyName }) => {
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Try to guess ticker from company name
  const guessSymbol = (name: string) => {
    const map: Record<string, string> = {
      'google': 'GOOG', 'alphabet': 'GOOG', 'apple': 'AAPL', 'microsoft': 'MSFT',
      'amazon': 'AMZN', 'meta': 'META', 'tesla': 'TSLA', 'nvidia': 'NVDA',
      'openai': null, 'netflix': 'NFLX', 'salesforce': 'CRM', 'oracle': 'ORCL',
      'ibm': 'IBM', 'intel': 'INTC', 'amd': 'AMD', 'uber': 'UBER', 'airbnb': 'ABNB',
      'shopify': 'SHOP', 'spotify': 'SPOT', 'snap': 'SNAP', 'twitter': null,
      'linkedin': null, 'samsung': null, 'huawei': null,
    };
    const lower = name.toLowerCase();
    for (const [key, sym] of Object.entries(map)) {
      if (lower.includes(key)) return sym;
    }
    return null;
  };

  useEffect(() => {
    const symbol = guessSymbol(companyName);
    if (!symbol) return;
    setLoading(true);
    fetch(`/api/stock/${symbol}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setStock(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyName]);

  if (loading) return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl animate-pulse">
      <div className="w-16 h-4 bg-slate-200 rounded" />
    </div>
  );
  if (!stock) return null;

  const up = stock.change >= 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stock.symbol}</span>
      <span className="text-sm font-black text-slate-900">${stock.price?.toFixed(2)}</span>
      <span className={`flex items-center gap-1 text-xs font-black ${up ? 'text-green-600' : 'text-red-500'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {up ? '+' : ''}{stock.change?.toFixed(2)}%
      </span>
      <span className="text-[9px] text-slate-400 font-bold uppercase">{stock.exchange}</span>
    </div>
  );
};

// Intent Score Meter
const IntentMeter: React.FC<{ score: number; justification?: string }> = ({ score, justification }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'High Intent' : score >= 40 ? 'Medium Intent' : 'Low Intent';
  return (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Buying Intent</span>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{label}</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-slate-400 font-medium">0</span>
        <span className="text-lg font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 font-medium">100</span>
      </div>
      {justification && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed italic">"{justification}"</p>
      )}
    </div>
  );
};

// Loading skeleton
const SearchSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-slate-200 rounded-full" />
      <div className="h-6 bg-slate-200 rounded w-64" />
    </div>
    {/* Buying signals skeleton */}
    <div className="flex gap-3">
      {[1,2,3].map(i => <div key={i} className="h-8 w-32 bg-slate-200 rounded-full" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 space-y-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-200 rounded w-48" />
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-4/6" />
        </div>
        <div className="space-y-3 mt-6">
          <div className="h-4 bg-slate-200 rounded w-28" />
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
      <div className="bg-white rounded-3xl p-8 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-24" />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-3xl p-6 space-y-4">
          <div className="flex justify-between">
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-36" />
          <div className="h-3 bg-slate-200 rounded w-28" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

// Company logo
const CompanyLogo: React.FC<{ website?: string; name: string; size?: number }> = ({ website, name, size = 48 }) => {
  const [err, setErr] = useState(false);
  const domain = website?.replace(/^https?:\/\//, '').split('/')[0] || '';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  
  if (!domain || err) {
    return (
      <div className="rounded-2xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] font-black"
        style={{ width: size, height: size, fontSize: size * 0.35 }}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={name}
      className="rounded-2xl object-contain bg-white border border-slate-100"
      style={{ width: size, height: size }}
      onError={() => setErr(true)}
    />
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onLogout, onSelectCompany, onNavigateDashboard, onNavigateProfile, 
  onNavigateWatchlist, onNavigateLeads, onNavigateSequences, 
  onNavigateSettings, onNavigateHelp, onNavigateAccounts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => getHistory());
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user'|'assistant'; text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [leadScore, setLeadScore] = useState<{score:number; signals:string[]} | null>(null);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  const loadingSteps = [
    'Scanning company signals...',
    'Researching key people...',
    'Analyzing buying intent...',
    'Generating outreach strategy...',
    'Finalizing intelligence report...',
  ];

  useEffect(() => {
    let interval: any;
    if (isSearching) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(s => (s < loadingSteps.length - 1 ? s + 1 : s));
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToLeads = (companyName: string) => {
    if (!leads.includes(companyName)) {
      setLeads([...leads, companyName]);
      showNotification(`${companyName} added to your Leads list.`);
    } else {
      showNotification(`${companyName} is already in your Leads.`, 'info');
    }
  };

  const addToQueue = (companyName: string) => {
    if (!queue.includes(companyName)) {
      setQueue([...queue, companyName]);
      showNotification(`${companyName} added to your Outreach Queue.`);
    } else {
      showNotification(`${companyName} is already in your Queue.`, 'info');
    }
  };

  const saveLead = async () => {
    if (!searchResult || isSavingLead || leadSaved) return;
    setIsSavingLead(true);
    try {
      const topPerson = searchResult.keyPeople?.[0];
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: topPerson?.name || searchResult.company?.name,
          title: topPerson?.title || 'Key Contact',
          company: searchResult.company?.name,
          email: topPerson?.email || '',
          linkedin: topPerson?.linkedin || '',
          score: leadScore?.score || 50,
          status: 'New',
          notes: searchResult.company?.summary || ''
        })
      });
      setLeadSaved(true);
    } catch {}
    setIsSavingLead(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearchResult(null);
    try {
      const result = await getAccountIntelligence(searchQuery);
      if (result) {
        setSearchResult(result);
        setLeadSaved(false);
        // Compute lead score
        fetch('/api/leads/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intelligence: result })
        }).then(r => r.json()).then(d => { if (d.score != null) setLeadScore(d); }).catch(() => {});
        addToHistory(searchQuery, result?.company?.name);
        setSearchHistory(getHistory());
      } else {
        setError("Could not find intelligence for this query. Please try another company.");
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError(null);
    setChatMessages([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !searchResult || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const response = await fetch('/api/ai/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `About ${searchResult.company?.name}: ${userMsg}. Context: ${searchResult.company?.summary || ''}`, 
          jsonMode: false 
        })
      });
      const data = await response.json();
      const msg = (data.output || []).find((i: any) => i.type === 'message');
      const text = msg?.content?.find((c: any) => c.type === 'output_text')?.text || 'I could not find an answer.';
      setChatMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const buyingSignals = searchResult ? detectBuyingSignals(searchResult) : [];
  const signalColors = { hot: '#ef4444', warm: '#f59e0b', neutral: '#64748b' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 antialiased font-sans">
      <Sidebar 
        activeView="dashboard"
        onNavigateDashboard={onNavigateDashboard!}
        onNavigateProfile={onNavigateProfile!}
        onNavigateWatchlist={onNavigateWatchlist!}
        onNavigateLeads={onNavigateLeads}
        onNavigateSequences={onNavigateSequences}
        onNavigateSettings={onNavigateSettings}
        onNavigateHelp={onNavigateHelp}
        onNavigateAccounts={onNavigateAccounts}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="max-w-7xl mx-auto w-full p-8 pt-24 md:pt-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-[#0071E3] font-black text-xs uppercase tracking-[0.3em] mb-3">
                <Zap className="w-4 h-4" />
                Signalz Overview
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black tracking-tighter text-[#1D1D1F]">
                Signalz <span className="text-slate-400">Dashboard</span>
              </motion.h1>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
              <div className="px-4 py-2 rounded-xl bg-[#0071E3]/5">
                <p className="text-[10px] font-black uppercase text-[#0071E3] tracking-widest">System Status</p>
                <p className="text-sm font-bold flex items-center gap-2 text-[#1D1D1F]">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </p>
              </div>
              <div className="px-4 py-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data Freshness</p>
                <p className="text-sm font-bold text-slate-700">Real-time</p>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#0071E3] transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any company for deep sales intelligence..."
                className="w-full bg-white rounded-[2rem] py-5 pl-16 pr-32 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-[#0071E3]/10 transition-all shadow-sm hover:shadow-md"
              />
              <div className="absolute inset-y-2 right-2 flex items-center gap-2">
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="p-3 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button type="submit" disabled={isSearching || !searchQuery.trim()}
                  className="bg-[#0071E3] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#0071E3]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#0071E3]/20">
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <><Sparkles className="w-5 h-5" /> Search</>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <p className="mt-4 text-rose-500 text-sm font-bold flex items-center gap-2 px-6">
                <Info className="w-4 h-4" />{error}
              </p>
            )}
          </div>

          {/* Recent Searches */}
          {!searchResult && !isSearching && searchHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Recent Searches
                </span>
                <button onClick={() => { clearHistory(); setSearchHistory([]); }}
                  className="text-xs font-bold text-slate-400 hover:text-[#0071E3]">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, i) => (
                  <button key={i}
                    onClick={() => { setSearchQuery(item.query); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl text-sm font-bold text-[#1D1D1F] hover:text-[#0071E3] transition-colors">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {item.companyName || item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Loading state indicator */}
                <div className="mb-8 bg-white rounded-2xl p-6 flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-[#0071E3] animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <AnimatePresence mode="wait">
                        <motion.p key={loadingStep} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="text-sm font-bold text-[#1D1D1F]">
                          {loadingSteps[loadingStep]}
                        </motion.p>
                      </AnimatePresence>
                      <span className="text-xs text-slate-400 font-bold">~30s</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#0071E3] rounded-full"
                        animate={{ width: ['0%', '90%'] }}
                        transition={{ duration: 30, ease: 'easeInOut' }} />
                    </div>
                  </div>
                </div>
                <SearchSkeleton />
              </motion.div>
            )}

            {!isSearching && searchResult && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-12 space-y-6">
                
                {/* Results header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h2 className="text-2xl font-black text-[#1D1D1F] flex items-center gap-3">
                      <Brain className="w-6 h-6 text-[#0071E3]" />
                      Intelligence Results: {searchResult.company?.name}
                    </h2>
                    {leadScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Lead Score</span>
                        <span className="text-lg font-black px-3 py-0.5 rounded-full" style={{
                          backgroundColor: leadScore.score >= 70 ? '#dcfce7' : leadScore.score >= 40 ? '#fef3c7' : '#fee2e2',
                          color: leadScore.score >= 70 ? '#16a34a' : leadScore.score >= 40 ? '#d97706' : '#dc2626'
                        }}>
                          {leadScore.score}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => exportIntelligencePdf(searchResult, searchResult.company?.name || 'Company')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] text-white text-xs font-black rounded-xl hover:bg-[#0071E3]/90 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button onClick={clearSearch} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2">
                      <X className="w-4 h-4" /> Close Results
                    </button>
                  </div>
                </div>

                {/* Buying Signals Strip */}
                {buyingSignals.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Live Signals
                    </span>
                    {buyingSignals.map((sig, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black"
                        style={{
                          backgroundColor: sig.type === 'hot' ? '#fee2e2' : sig.type === 'warm' ? '#fef3c7' : '#f1f5f9',
                          color: sig.type === 'hot' ? '#dc2626' : sig.type === 'warm' ? '#d97706' : '#64748b'
                        }}>
                        <span>{sig.icon}</span> {sig.label}
                        {sig.type === 'hot' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Company Overview */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <CompanyLogo website={searchResult.company?.website} name={searchResult.company?.name || ''} size={52} />
                        <div>
                          <h3 className="text-xl font-black text-[#1D1D1F]">{searchResult.company?.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Overview</p>
                          {searchResult.company?.tagline && (
                            <p className="text-xs text-slate-500 italic mt-1">"{searchResult.company.tagline}"</p>
                          )}
                        </div>
                      </div>
                      <StockTicker website={searchResult.company?.website} companyName={searchResult.company?.name || ''} />
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {[
                        { icon: <Globe className="w-3.5 h-3.5" />, label: 'Industry', value: searchResult.company?.industry },
                        { icon: <Users className="w-3.5 h-3.5" />, label: 'Size', value: searchResult.company?.size },
                        { icon: <Building2 className="w-3.5 h-3.5" />, label: 'HQ', value: searchResult.company?.headquarters },
                        { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Revenue', value: searchResult.financials?.revenue },
                      ].map((stat, i) => stat.value ? (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1 text-slate-400">{stat.icon}
                            <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                          </div>
                          <p className="text-xs font-black text-[#1D1D1F] truncate">{stat.value}</p>
                        </div>
                      ) : null)}
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">{searchResult.company?.summary}</p>

                    {/* Intent Meter */}
                    {searchResult.company?.intentScore?.score != null && (
                      <div className="mb-6">
                        <IntentMeter 
                          score={searchResult.company.intentScore.score} 
                          justification={searchResult.company.intentScore.justification} 
                        />
                      </div>
                    )}

                    {/* Recent News */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-[#1D1D1F] uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#0071E3]" /> Recent News
                      </h4>
                      {searchResult.company?.recentNews?.map((news: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                          <div className="w-2 h-2 rounded-full bg-[#0071E3] mt-1.5 flex-shrink-0" />
                          <p className="text-sm font-medium text-slate-700">{news}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column: Key Facts + Financials */}
                  <div className="space-y-6">
                    {/* Key Facts */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-black text-[#1D1D1F]">Key Facts</h3>
                      </div>
                      <div className="space-y-5">
                        {searchResult.interestingFacts?.map((fact: any, i: number) => (
                          <div key={i} className="group">
                            <h4 className="text-sm font-black text-[#1D1D1F] mb-1 group-hover:text-[#0071E3] transition-colors">{fact.title}</h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-1">{fact.description}</p>
                            {fact.source && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              <ExternalLink className="w-3 h-3" /> Source: {fact.source}
                            </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financials */}
                    {searchResult.financials && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-black text-[#1D1D1F]">Financials</h3>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: 'Revenue', value: searchResult.financials.revenue },
                            { label: 'Growth', value: searchResult.financials.growth },
                            { label: 'Valuation', value: searchResult.financials.valuation },
                          ].map((f, i) => f.value ? (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{f.label}</span>
                              <span className="text-sm font-black text-[#1D1D1F]">{f.value}</span>
                            </div>
                          ) : null)}
                        </div>
                      </div>
                    )}

                    {/* Competitors */}
                    {searchResult.competitors?.length > 0 && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-red-500" />
                          </div>
                          <h3 className="text-lg font-black text-[#1D1D1F]">Competitors</h3>
                        </div>
                        <div className="space-y-3">
                          {searchResult.competitors.map((c: any, i: number) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-black text-[#1D1D1F]">{c.name}</span>
                                {c.marketShare && <span className="text-xs font-bold text-slate-400">{c.marketShare}</span>}
                              </div>
                              {c.advantage && <p className="text-xs text-slate-500">{c.advantage}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key People */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResult.keyPeople?.map((person: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white font-black text-sm">
                              {person.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#1D1D1F]">{person.name}</h4>
                              <p className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest">{person.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {person.influence && (
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${person.influence === 'High' ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-slate-100 text-slate-400'}`}>
                                {person.influence}
                              </span>
                            )}
                            {person.linkedin && person.linkedin !== 'N/A' && (
                              <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-slate-50 hover:bg-[#0071E3]/10 rounded-xl text-slate-400 hover:text-[#0071E3] transition-colors">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#f6f6f8]">
                          <p className="text-[10px] font-black uppercase text-[#0071E3] tracking-widest mb-2 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Outreach Hook
                          </p>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed">"{person.activity?.bestHook || person.hook || 'Focus on their strategic priorities and recent activity.'}"</p>
                        </div>
                        {(person.focus || person.activity?.themes?.length > 0) && (
                          <p className="mt-3 text-[10px] text-slate-400 font-bold">Focus: {person.focus || person.activity?.themes?.slice(0, 2).join(', ')}</p>
                        )}
                        {person.email && (
                          <p className="mt-2 text-[10px] text-slate-500 font-medium truncate">{person.email} <span className="ml-1 text-[9px] text-slate-400 uppercase tracking-widest">{person.emailConfidence || ''}</span></p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Tech Stack */}
                  {searchResult.techStack?.length > 0 && (
                    <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-black text-[#1D1D1F] mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#0071E3]" /> Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.techStack.map((tech: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-[#f6f6f8] text-[#1D1D1F] text-xs font-bold rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Similar Companies */}
                  <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#0071E3]/5 rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-[#0071E3]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#1D1D1F]">Similar Companies to Approach</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI-Powered Recommendations</p>
                      </div>
                    </div>
                    {(searchResult.similarCompanies?.length || 0) > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {searchResult.similarCompanies.map((company: any, i: number) => (
                          <div key={i} className="p-5 bg-[#f6f6f8] rounded-2xl hover:bg-[#0071E3]/5 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-sm font-black text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">{company.name || 'Unknown'}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{company.industry || ''}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">{company.whyApproach || 'Similar profile to current target.'}</p>
                            <div className="flex gap-2">
                              <button onClick={() => addToLeads(company.name)}
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-xl transition-all ${leads.includes(company.name) ? 'bg-[#0071E3] text-white' : 'bg-white text-slate-600 hover:text-[#0071E3]'}`}>
                                Lead
                              </button>
                              <button onClick={() => onSelectCompany(company.name)}
                                className="flex-1 py-1.5 text-[10px] font-black uppercase bg-white rounded-xl text-slate-600 hover:text-[#0071E3] transition-all">
                                Research
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 bg-[#f6f6f8] rounded-2xl text-center">
                        <p className="text-sm font-medium text-slate-500">No similar companies available yet. Try re-running research.</p>
                      </div>
                    )}
                  </div>

                  {/* Outreach Email */}
                  <div className="lg:col-span-3 bg-[#1D1D1F] rounded-3xl p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Mail className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-[#0071E3]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black">AI Outreach Draft</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personalized for {searchResult.company?.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                            <Mail className="w-4 h-4 text-blue-400" /> Connect Outlook
                          </button>
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                            <Mail className="w-4 h-4 text-red-400" /> Connect Gmail
                          </button>
                        </div>
                      </div>
                      <div className="space-y-5 max-w-4xl">
                        <div className="flex items-center gap-4 py-3 border-b border-white/10">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-20">To:</span>
                          <span className="text-sm font-bold">
                            {(() => {
                              const e = searchResult.outreach?.emails?.[0];
                              if (!e) return searchResult.suggestedEmail?.recipient || 'Recipient not identified';
                              const parts = [e.recipientName, e.recipientTitle].filter(Boolean).join(', ');
                              const addr = e.recipientEmailGuess || e.email;
                              if (parts && addr) return parts + ' <' + addr + '>';
                              return parts || addr || 'Recipient not identified';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 py-3 border-b border-white/10">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-20">Subject:</span>
                          <span className="text-sm font-bold">{searchResult.outreach?.emails?.[0]?.subject || searchResult.suggestedEmail?.subject || 'Subject not available'}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-20 mt-1">Body:</span>
                          <div className="flex-1 bg-white/5 rounded-2xl p-6">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-200">
                              {searchResult.outreach?.emails?.[0]?.body || searchResult.suggestedEmail?.body || 'Email draft not yet generated. Re-run research to produce a draft.'}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                              <button onClick={() => navigator.clipboard.writeText(searchResult.outreach?.emails?.[0]?.body || searchResult.suggestedEmail?.body || "")}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                                <Copy className="w-3 h-3" /> Copy Draft
                              </button>
                              <button onClick={() => onSelectCompany(searchResult.company?.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-[#1D1D1F] hover:bg-slate-100 rounded-xl text-xs font-bold transition-all">
                                <Brain className="w-3 h-3" /> Deep Research
                              </button>
                              <button onClick={() => addToLeads(searchResult.company?.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                                <Users className="w-3 h-3" />
                                {leads.includes(searchResult.company?.name) ? 'In Leads' : 'Add to Leads'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* AI Follow-up Chat */}
                  <div className="lg:col-span-3 bg-white rounded-3xl overflow-hidden">
                    <div className="px-8 py-5 flex items-center gap-3" style={{borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
                      <div className="w-10 h-10 bg-[#0071E3]/10 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#0071E3]" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#1D1D1F]">Ask AI about {searchResult?.company?.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">Follow-up questions, deeper analysis, custom insights</p>
                      </div>
                    </div>
                    {/* Messages */}
                    <div className="px-8 py-4 space-y-3 max-h-64 overflow-y-auto">
                      {chatMessages.length === 0 && (
                        <div className="flex flex-wrap gap-2 py-2">
                          {['What are their biggest pain points?', 'Who should I contact first?', 'What is their budget cycle?'].map((q, i) => (
                            <button key={i} onClick={() => setChatInput(q)}
                              className="px-3 py-1.5 bg-[#f6f6f8] rounded-xl text-xs font-bold text-slate-600 hover:text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors">
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium ${
                            msg.role === 'user' 
                              ? 'bg-[#0071E3] text-white rounded-br-sm' 
                              : 'bg-[#f6f6f8] text-[#1D1D1F] rounded-bl-sm'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-[#f6f6f8] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Input */}
                    <form onSubmit={handleChatSubmit} className="px-8 py-4" style={{borderTop: '1px solid rgba(0,0,0,0.06)'}}>
                      <div className="flex gap-3">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          placeholder={`Ask anything about ${searchResult?.company?.name}...`}
                          className="flex-1 bg-[#f6f6f8] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                          disabled={isChatLoading} />
                        <button type="submit" disabled={isChatLoading || !chatInput.trim()}
                          className="px-5 py-2.5 bg-[#0071E3] text-white rounded-2xl text-xs font-black disabled:opacity-50 hover:bg-[#0071E3]/90 transition-all">
                          Ask
                        </button>
                      </div>
                    </form>
                  </div>
              </motion.div>
            )}

            {!isSearching && !searchResult && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: <Target className="w-8 h-8 text-[#0071E3]" />, bg: 'bg-[#0071E3]/5', title: 'Target List', desc: 'Use AI search to identify high-intent accounts and build your target list.', color: 'text-[#0071E3]' },
                  { icon: <TrendingUp className="w-8 h-8 text-blue-500" />, bg: 'bg-blue-50', title: 'Market Pulse', desc: 'Real-time market signals and industry shifts appear as you monitor accounts.', color: 'text-blue-600' },
                  { icon: <Users className="w-8 h-8 text-slate-600" />, bg: 'bg-slate-100', title: 'Network', desc: 'Connect your accounts to discover warm introduction paths and shared connections.', color: 'text-slate-600' },
                ].map((card, i) => (
                  <div key={i} className="p-10 rounded-3xl bg-white hover:shadow-lg transition-all group cursor-pointer">
                    <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center mb-8`}>
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-[#1D1D1F]">{card.title}</h3>
                    <p className="text-slate-500 font-medium text-sm">{card.desc}</p>
                    <div className={`mt-8 flex items-center gap-2 ${card.color} font-black text-xs uppercase tracking-widest`}>
                      Explore <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications */}
          <AnimatePresence>
            {notification && (
              <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-8 left-1/2 z-50 px-6 py-3 bg-[#1D1D1F] text-white rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]">
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Info className="w-5 h-5 text-blue-400" />}
                <p className="text-sm font-bold">{notification.message}</p>
                <div className="md:col-span-3 mt-4">
                  <ActivityFeed />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
