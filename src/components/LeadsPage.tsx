import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Linkedin,
  Plus,
  BrainCircuit,
  Zap,
  MoreHorizontal,
  TrendingUp,
  CalendarCheck,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';

interface LeadsPageProps {
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

const SAMPLE_LEADS = [
  { id: 1, name: 'Sundar Pichai', title: 'CEO', company: 'Google', email: 'sundar@google.com', status: 'Meeting Booked', score: 95, linkedin: 'https://linkedin.com/in/sundarpichai' },
  { id: 2, name: 'Satya Nadella', title: 'CEO', company: 'Microsoft', email: 'satya@microsoft.com', status: 'Replied', score: 88, linkedin: 'https://linkedin.com/in/satyanadella' },
  { id: 3, name: 'Sam Altman', title: 'CEO', company: 'OpenAI', email: 'sam@openai.com', status: 'Contacted', score: 82, linkedin: 'https://linkedin.com/in/samaltman' },
  { id: 4, name: 'Patrick Collison', title: 'CEO', company: 'Stripe', email: 'patrick@stripe.com', status: 'Replied', score: 79, linkedin: 'https://linkedin.com/in/patrickcollison' },
  { id: 5, name: 'Dylan Field', title: 'CEO', company: 'Figma', email: 'dylan@figma.com', status: 'New', score: 71, linkedin: 'https://linkedin.com/in/dylanfield' },
  { id: 6, name: 'Ivan Zhao', title: 'CEO', company: 'Notion', email: 'ivan@notion.so', status: 'Contacted', score: 65, linkedin: 'https://linkedin.com/in/ivanz' },
  { id: 7, name: 'Karri Saarinen', title: 'CEO', company: 'Linear', email: 'karri@linear.app', status: 'New', score: 38, linkedin: 'https://linkedin.com/in/karrisaarinen' },
  { id: 8, name: 'Guillermo Rauch', title: 'CEO', company: 'Vercel', email: 'rauchg@vercel.com', status: 'Meeting Booked', score: 91, linkedin: 'https://linkedin.com/in/guillermo-rauch' },
];

const statusStyle: Record<string, string> = {
  'New': 'bg-[#0071E3]/10 text-[#0071E3]',
  'Contacted': 'bg-amber-100 text-amber-700',
  'Replied': 'bg-green-100 text-green-700',
  'Meeting Booked': 'bg-emerald-100 text-emerald-700',
};

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = SAMPLE_LEADS.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = SAMPLE_LEADS.length;
  const hotLeads = SAMPLE_LEADS.filter(l => l.score > 70).length;
  const replied = SAMPLE_LEADS.filter(l => l.status === 'Replied').length;
  const meetings = SAMPLE_LEADS.filter(l => l.status === 'Meeting Booked').length;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="leads" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Leads</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold transition-all"
            style={{ background: '#0071E3' }}
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: totalLeads, icon: <Users className="w-5 h-5" style={{ color: '#0071E3' }} /> },
              { label: 'Hot Leads', value: hotLeads, icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
              { label: 'Replied', value: replied, icon: <MessageSquare className="w-5 h-5 text-green-500" /> },
              { label: 'Meetings Booked', value: meetings, icon: <CalendarCheck className="w-5 h-5 text-emerald-500" /> },
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
            {/* Search + Filter Bar */}
            <div className="p-5 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid #f0f0f5' }}>
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
                <input
                  type="text"
                  placeholder="Search leads…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
                  style={{ background: '#f6f6f8', color: '#1D1D1F' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'New', 'Contacted', 'Replied', 'Meeting Booked'].map(s => (
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: '#f6f6f8', color: '#6e6e73' }}>
                    <th className="px-6 py-3 font-bold">Name</th>
                    <th className="px-6 py-3 font-bold">Title & Company</th>
                    <th className="px-6 py-3 font-bold">Contact</th>
                    <th className="px-6 py-3 font-bold">Score</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-10 h-10" style={{ color: '#c7c7cc' }} />
                          <p className="font-bold text-base" style={{ color: '#6e6e73' }}>No leads match your search</p>
                          <p className="text-sm" style={{ color: '#c7c7cc' }}>Try adjusting the filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors cursor-pointer"
                      style={{ borderTop: '1px solid #f0f0f5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f6f6f8')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                            style={{ background: '#0071E3' }}
                          >
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-bold" style={{ color: '#1D1D1F' }}>{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: '#1D1D1F' }}>{lead.title}</div>
                        <div className="text-xs font-medium" style={{ color: '#6e6e73' }}>{lead.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }} title={lead.email}>
                            <Mail className="w-4 h-4" />
                          </a>
                          <a href={lead.linkedin} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }}>
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-black ${scoreColor(lead.score)}`}>{lead.score}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[lead.status] || ''}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => props.onNavigateDashboard()}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#6e6e73' }}
                            title="Deep Research"
                          >
                            <BrainCircuit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }} title="Add to Sequence">
                            <Zap className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }}>
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
