import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  TrendingUp,
  Activity,
  Users,
  CalendarDays,
  MoreHorizontal,
  ArrowUpRight,
  Loader2,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';

interface AccountsPageProps {
  onLogout: () => void;
  onNavigateDashboard: () => void;
  onNavigateProfile: () => void;
  onNavigateWatchlist: () => void;
  onNavigateLeads: () => void;
  onNavigateSequences: () => void;
  onNavigateSettings: () => void;
  onNavigateHelp: () => void;
  onNavigateAccounts: () => void;
}

interface Account {
  _id: string;
  name: string;
  industry: string;
  employees: string;
  intentScore: number;
  status: string;
  website: string;
  lastActivity: string;
}

const statusStyle: Record<string, string> = {
  'Research': 'bg-[#0071E3]/10 text-[#0071E3]',
  'Active': 'bg-green-100 text-green-700',
  'Nurture': 'bg-amber-100 text-amber-700',
  'Closed': 'bg-gray-100 text-gray-500',
};

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hours / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

export const AccountsPage: React.FC<AccountsPageProps> = (props) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', industry: '', website: '' });

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const addAccount = async () => {
    if (!newAccount.name.trim()) return;
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAccount, status: 'Research', intentScore: 0 }),
      });
      if (res.ok) {
        setNewAccount({ name: '', industry: '', website: '' });
        setShowAddModal(false);
        fetchAccounts();
      }
    } catch {}
  };

  const deleteAccount = async (id: string) => {
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      setAccounts(accounts.filter(a => a._id !== id));
    } catch {}
  };

  const filtered = accounts.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = accounts.length;
  const active = accounts.filter(a => a.status === 'Active').length;
  const highIntent = accounts.filter(a => a.intentScore > 70).length;
  const thisWeek = accounts.filter(a => {
    const diff = Date.now() - new Date(a.lastActivity).getTime();
    return diff < 7 * 86400000;
  }).length;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="accounts" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Accounts</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold"
            style={{ background: '#0071E3' }}
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Accounts', value: total, icon: <Building2 className="w-5 h-5" style={{ color: '#0071E3' }} /> },
              { label: 'Active', value: active, icon: <Activity className="w-5 h-5 text-green-500" /> },
              { label: 'High Intent', value: highIntent, icon: <TrendingUp className="w-5 h-5 text-amber-500" /> },
              { label: 'Active This Week', value: thisWeek, icon: <CalendarDays className="w-5 h-5 text-emerald-500" /> },
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

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="bg-white rounded-3xl overflow-hidden"
          >
            <div className="p-5 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid #f0f0f5' }}>
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
                  style={{ background: '#f6f6f8', color: '#1D1D1F' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Research', 'Active', 'Nurture', 'Closed'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={
                      statusFilter === s
                        ? { background: '#0071E3', color: '#fff' }
                        : { background: '#f6f6f8', color: '#1D1D1F' }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: '#f6f6f8', color: '#6e6e73' }}>
                    <th className="px-6 py-3 font-bold">Company</th>
                    <th className="px-6 py-3 font-bold">Industry</th>
                    <th className="px-6 py-3 font-bold">Employees</th>
                    <th className="px-6 py-3 font-bold">Intent Score</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Last Activity</th>
                    <th className="px-6 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#0071E3' }} />
                        <p className="mt-3 text-sm font-medium" style={{ color: '#6e6e73' }}>Loading accounts...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Building2 className="w-10 h-10" style={{ color: '#c7c7cc' }} />
                          <p className="font-bold text-base" style={{ color: '#6e6e73' }}>
                            {accounts.length === 0 ? 'No accounts yet. Search a company on the Dashboard to add it here.' : 'No accounts match your filters'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((acc, i) => (
                    <motion.tr
                      key={acc._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors"
                      style={{ borderTop: '1px solid #f0f0f5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f6f6f8')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${acc.website || acc.name.toLowerCase().replace(/\s/g, '') + '.com'}&sz=32`}
                            alt=""
                            className="w-8 h-8 rounded-lg bg-slate-100"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="font-bold" style={{ color: '#1D1D1F' }}>{acc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#6e6e73' }}>{acc.industry || '-'}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#6e6e73' }}>{acc.employees || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-black ${scoreColor(acc.intentScore)}`}>{acc.intentScore}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[acc.status] || ''}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium" style={{ color: '#6e6e73' }}>
                        {acc.lastActivity ? timeAgo(acc.lastActivity) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => props.onNavigateDashboard()}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#6e6e73' }}
                            title="Research"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAccount(acc._id)}
                            className="p-1.5 rounded-lg transition-colors text-red-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add New Account</h3>
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
                    value={newAccount.name}
                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Industry</label>
                  <input
                    type="text"
                    placeholder="Technology"
                    value={newAccount.industry}
                    onChange={e => setNewAccount({ ...newAccount, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Website</label>
                  <input
                    type="text"
                    placeholder="acme.com"
                    value={newAccount.website}
                    onChange={e => setNewAccount({ ...newAccount, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <button
                  onClick={addAccount}
                  disabled={!newAccount.name.trim()}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  Add Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
