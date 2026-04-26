import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  Zap,
  Eye,
  CalendarDays,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Trash2,
  Plus,
  X
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

interface WatchedCompany {
  _id: string;
  name: string;
  industry: string;
  website: string;
  intentScore: number;
  status: string;
  lastActivity: string;
}

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hours / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

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
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', website: '' });

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/watchlist/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const addCompany = async () => {
    if (!newCompany.name.trim()) return;
    try {
      const res = await fetch('/api/watchlist/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCompany, status: 'Research', intentScore: 0 }),
      });
      if (res.ok) {
        setNewCompany({ name: '', industry: '', website: '' });
        setShowAddModal(false);
        fetchCompanies();
      }
    } catch {}
  };

  const removeCompany = async (id: string) => {
    try {
      await fetch(`/api/watchlist/companies/${id}`, { method: 'DELETE' });
      setCompanies(companies.filter(c => c._id !== id));
    } catch {}
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const watching = companies.length;
  const hotSignals = companies.filter(c => c.intentScore > 70).length;
  const recentActivity = companies.filter(c => {
    if (!c.lastActivity) return false;
    return Date.now() - new Date(c.lastActivity).getTime() < 7 * 86400000;
  }).length;

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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold"
            style={{ background: '#0071E3' }}
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Watching', value: watching, icon: <Eye className="w-5 h-5" style={{ color: '#0071E3' }} /> },
              { label: 'High Intent', value: hotSignals, icon: <Zap className="w-5 h-5 text-amber-500" /> },
              { label: 'Active This Week', value: recentActivity, icon: <CalendarDays className="w-5 h-5 text-green-500" /> },
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

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
              style={{ background: '#fff', color: '#1D1D1F' }}
            />
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0071E3' }} />
              <p className="text-sm font-medium" style={{ color: '#6e6e73' }}>Loading watchlist...</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3"
            >
              <Eye className="w-10 h-10" style={{ color: '#c7c7cc' }} />
              <p className="font-bold text-base" style={{ color: '#6e6e73' }}>
                {companies.length === 0 ? 'No companies in your watchlist yet.' : 'No companies match your search'}
              </p>
              <p className="text-sm" style={{ color: '#c7c7cc' }}>
                {companies.length === 0 ? 'Companies you research are automatically added here.' : 'Try different keywords'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((company, i) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-3xl p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${company.website || company.name.toLowerCase().replace(/\s/g, '') + '.com'}&sz=32`}
                        alt=""
                        className="w-10 h-10 rounded-2xl bg-slate-100"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <h3 className="font-black text-base" style={{ color: '#1D1D1F' }}>{company.name}</h3>
                        <p className="text-xs font-medium" style={{ color: '#6e6e73' }}>{company.industry || 'Unknown'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCompany(company._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: '#6e6e73' }}>Intent Score</span>
                    <span className={`text-3xl font-black ${scoreColor(company.intentScore)}`}>{company.intentScore}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Status</p>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0071E3]/10 text-[#0071E3]">
                        {company.status || 'Research'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: '#6e6e73' }}>Last Activity</p>
                      <p className="text-xs font-bold mt-1" style={{ color: '#1D1D1F' }}>{timeAgo(company.lastActivity)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid #f0f0f5' }}>
                    <button
                      onClick={() => onNavigateDashboard()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl text-sm font-bold text-white transition-all"
                      style={{ background: '#0071E3' }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Research Now
                    </button>
                    {company.website && (
                      <a
                        href={`https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-2xl transition-colors"
                        style={{ background: '#f6f6f8', color: '#6e6e73' }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Company Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add to Watchlist</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Company Name</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={newCompany.name}
                    onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Industry</label>
                  <input
                    type="text"
                    placeholder="Technology"
                    value={newCompany.industry}
                    onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Website</label>
                  <input
                    type="text"
                    placeholder="acme.com"
                    value={newCompany.website}
                    onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <button
                  onClick={addCompany}
                  disabled={!newCompany.name.trim()}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  Add to Watchlist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
