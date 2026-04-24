import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  Zap,
  Eye,
  CalendarDays,
  ArrowUpRight,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';

interface WatchlistPageProps {
  onLogout: () => void;
  onNavigateDashboard: () => void;
  onNavigateProfile: () => void;
  onNavigateWatchlist?: () => void;
  onNavigateLeads?: () => void;
  onNavigateSequences?: () => void;
  onNavigateSettings?: () => void;
  onNavigateHelp?: () => void;
  onNavigateAccounts?: () => void;
}

type SignalType = 'Hiring' | 'Funding' | 'Leadership' | 'Product Launch';

interface WatchedCompany {
  id: number;
  name: string;
  industry: string;
  website: string;
  intentScore: number;
  lastSignal: string;
  signalType: SignalType;
  isNew: boolean;
}

const SAMPLE_COMPANIES: WatchedCompany[] = [
  { id: 1, name: 'Google', industry: 'Technology', website: 'google.com', intentScore: 92, lastSignal: '2 hours ago', signalType: 'Hiring', isNew: false },
  { id: 2, name: 'Apple', industry: 'Consumer Electronics', website: 'apple.com', intentScore: 85, lastSignal: '5 hours ago', signalType: 'Product Launch', isNew: false },
  { id: 3, name: 'Microsoft', industry: 'Technology', website: 'microsoft.com', intentScore: 78, lastSignal: '1 day ago', signalType: 'Leadership', isNew: false },
  { id: 4, name: 'Stripe', industry: 'FinTech', website: 'stripe.com', intentScore: 88, lastSignal: '3 hours ago', signalType: 'Funding', isNew: true },
  { id: 5, name: 'OpenAI', industry: 'Artificial Intelligence', website: 'openai.com', intentScore: 96, lastSignal: '30 min ago', signalType: 'Hiring', isNew: true },
  { id: 6, name: 'Anthropic', industry: 'Artificial Intelligence', website: 'anthropic.com', intentScore: 91, lastSignal: '1 hour ago', signalType: 'Funding', isNew: true },
];

const signalStyle: Record<SignalType, { bg: string; color: string }> = {
  'Hiring': { bg: '#0071E3/10', color: '#0071E3' },
  'Funding': { bg: '#34c759/10', color: '#16a34a' },
  'Leadership': { bg: '#ff9500/10', color: '#d97706' },
  'Product Launch': { bg: '#af52de/10', color: '#7c3aed' },
};

const signalBadgeStyle: Record<SignalType, React.CSSProperties> = {
  'Hiring': { background: 'rgba(0,113,227,0.1)', color: '#0071E3' },
  'Funding': { background: 'rgba(52,199,89,0.1)', color: '#16a34a' },
  'Leadership': { background: 'rgba(255,149,0,0.1)', color: '#d97706' },
  'Product Launch': { background: 'rgba(175,82,222,0.1)', color: '#7c3aed' },
};

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onLogout,
  onNavigateDashboard,
  onNavigateProfile,
  onNavigateWatchlist,
  onNavigateLeads,
  onNavigateSequences,
  onNavigateSettings,
  onNavigateHelp,
  onNavigateAccounts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<'All' | SignalType>('All');

  const filtered = SAMPLE_COMPANIES.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSignal = signalFilter === 'All' || c.signalType === signalFilter;
    return matchesSearch && matchesSignal;
  });

  const watching = SAMPLE_COMPANIES.length;
  const hotSignals = SAMPLE_COMPANIES.filter(c => c.intentScore > 80).length;
  const newThisWeek = SAMPLE_COMPANIES.filter(c => c.isNew).length;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar
        activeView="watchlist"
        onNavigateDashboard={onNavigateDashboard}
        onNavigateProfile={onNavigateProfile}
        onNavigateWatchlist={onNavigateWatchlist || (() => {})}
        onNavigateLeads={onNavigateLeads || (() => {})}
        onNavigateSequences={onNavigateSequences || (() => {})}
        onNavigateSettings={onNavigateSettings || (() => {})}
        onNavigateHelp={onNavigateHelp || (() => {})}
        onNavigateAccounts={onNavigateAccounts || (() => {})}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Watchlist</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold"
            style={{ background: '#0071E3' }}
          >
            <Eye className="w-4 h-4" />
            Add Company
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Watching', value: watching, icon: <Eye className="w-5 h-5" style={{ color: '#0071E3' }} /> },
              { label: 'Hot Signals', value: hotSignals, icon: <Zap className="w-5 h-5 text-amber-500" /> },
              { label: 'New This Week', value: newThisWeek, icon: <CalendarDays className="w-5 h-5 text-green-500" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: '#6e6e73' }}>{stat.label}</span>
                  {stat.icon}
                </div>
                <p className="text-4xl font-black" style={{ color: '#1D1D1F' }}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
              <input
                type="text"
                placeholder="Search companies…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
                style={{ background: '#fff', color: '#1D1D1F' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['All', 'Hiring', 'Funding', 'Leadership', 'Product Launch'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSignalFilter(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={
                    signalFilter === s
                      ? { background: '#0071E3', color: '#fff' }
                      : { background: '#fff', color: '#1D1D1F' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Company Cards */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3"
            >
              <Search className="w-10 h-10" style={{ color: '#c7c7cc' }} />
              <p className="font-bold text-base" style={{ color: '#6e6e73' }}>No companies match your search</p>
              <p className="text-sm" style={{ color: '#c7c7cc' }}>Try different keywords or filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-3xl p-6 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black text-white"
                        style={{ background: '#0071E3' }}
                      >
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-base" style={{ color: '#1D1D1F' }}>{company.name}</h3>
                        <p className="text-xs font-medium" style={{ color: '#6e6e73' }}>{company.industry}</p>
                      </div>
                    </div>
                    {company.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#0071E3' }}>
                        New
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: '#6e6e73' }}>Intent Score</span>
                    <span className={`text-3xl font-black ${scoreColor(company.intentScore)}`}>{company.intentScore}</span>
                  </div>

                  {/* Signal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Latest Signal</p>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={signalBadgeStyle[company.signalType]}
                      >
                        {company.signalType}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: '#6e6e73' }}>Last Activity</p>
                      <p className="text-xs font-bold mt-1" style={{ color: '#1D1D1F' }}>{company.lastSignal}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid #f0f0f5' }}>
                    <button
                      onClick={() => onNavigateDashboard()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl text-sm font-bold text-white transition-all"
                      style={{ background: '#0071E3' }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Research Now
                    </button>
                    <a
                      href={`https://${company.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-2xl transition-colors"
                      style={{ background: '#f6f6f8', color: '#6e6e73' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      className="p-2 rounded-2xl transition-colors"
                      style={{ background: '#f6f6f8', color: '#6e6e73' }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
