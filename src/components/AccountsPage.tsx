import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  TrendingUp,
  Activity,
  Users,
  CalendarDays,
  MoreHorizontal,
  ArrowUpRight
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

const SAMPLE_ACCOUNTS = [
  { id: 1, name: 'Google', industry: 'Technology', employees: '180,000+', intentScore: 92, status: 'Active', website: 'google.com', lastActivity: '2 hours ago' },
  { id: 2, name: 'Microsoft', industry: 'Technology', employees: '221,000+', intentScore: 87, status: 'Active', website: 'microsoft.com', lastActivity: '1 day ago' },
  { id: 3, name: 'Apple', industry: 'Consumer Electronics', employees: '164,000+', intentScore: 78, status: 'Research', website: 'apple.com', lastActivity: '3 days ago' },
  { id: 4, name: 'Amazon', industry: 'E-Commerce / Cloud', employees: '1,500,000+', intentScore: 65, status: 'Nurture', website: 'amazon.com', lastActivity: '5 days ago' },
  { id: 5, name: 'Meta', industry: 'Social Media', employees: '86,000+', intentScore: 55, status: 'Nurture', website: 'meta.com', lastActivity: '1 week ago' },
  { id: 6, name: 'OpenAI', industry: 'Artificial Intelligence', employees: '1,700+', intentScore: 95, status: 'Active', website: 'openai.com', lastActivity: '30 min ago' },
  { id: 7, name: 'Stripe', industry: 'FinTech', employees: '8,000+', intentScore: 83, status: 'Active', website: 'stripe.com', lastActivity: '4 hours ago' },
  { id: 8, name: 'Figma', industry: 'Design Tools', employees: '1,200+', intentScore: 72, status: 'Research', website: 'figma.com', lastActivity: '2 days ago' },
  { id: 9, name: 'Notion', industry: 'Productivity', employees: '600+', intentScore: 61, status: 'Nurture', website: 'notion.so', lastActivity: '3 days ago' },
  { id: 10, name: 'Anthropic', industry: 'Artificial Intelligence', employees: '700+', intentScore: 90, status: 'Active', website: 'anthropic.com', lastActivity: '1 hour ago' },
];

const statusStyle: Record<string, string> = {
  'Research': 'bg-[#0071E3]/10 text-[#0071E3]',
  'Active': 'bg-green-100 text-green-700',
  'Nurture': 'bg-amber-100 text-amber-700',
  'Closed': 'bg-gray-100 text-gray-500',
};

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

export const AccountsPage: React.FC<AccountsPageProps> = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = SAMPLE_ACCOUNTS.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = SAMPLE_ACCOUNTS.length;
  const active = SAMPLE_ACCOUNTS.filter(a => a.status === 'Active').length;
  const highIntent = SAMPLE_ACCOUNTS.filter(a => a.intentScore > 70).length;
  const thisWeek = 3; // sample

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="accounts" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Accounts</h2>
          <button
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
              { label: 'This Week', value: thisWeek, icon: <CalendarDays className="w-5 h-5 text-emerald-500" /> },
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

          {/* Table Card */}
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
                  placeholder="Search accounts…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
                  style={{ background: '#f6f6f8', color: '#1D1D1F' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Active', 'Research', 'Nurture', 'Closed'].map(s => (
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
                    <th className="px-6 py-3 font-bold">Account</th>
                    <th className="px-6 py-3 font-bold">Industry</th>
                    <th className="px-6 py-3 font-bold">Employees</th>
                    <th className="px-6 py-3 font-bold">Intent Score</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Last Activity</th>
                    <th className="px-6 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-10 h-10" style={{ color: '#c7c7cc' }} />
                          <p className="font-bold text-base" style={{ color: '#6e6e73' }}>No accounts match your search</p>
                          <p className="text-sm" style={{ color: '#c7c7cc' }}>Try adjusting the filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((acc, i) => (
                    <motion.tr
                      key={acc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors cursor-pointer"
                      style={{ borderTop: '1px solid #f0f0f5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f6f6f8')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                      onClick={() => props.onNavigateDashboard()}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
                            style={{ background: '#0071E3' }}
                          >
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: '#1D1D1F' }}>{acc.name}</div>
                            <div className="text-xs font-medium" style={{ color: '#6e6e73' }}>{acc.website}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#6e6e73' }}>{acc.industry}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#6e6e73' }}>{acc.employees}</td>
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-black ${scoreColor(acc.intentScore)}`}>{acc.intentScore}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[acc.status] || ''}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium" style={{ color: '#6e6e73' }}>{acc.lastActivity}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); props.onNavigateDashboard(); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#0071E3' }}
                            title="Research"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg" style={{ color: '#6e6e73' }} onClick={e => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
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
      </main>
    </div>
  );
};
