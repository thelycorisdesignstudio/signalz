import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Loader2,
  Trash2,
  X
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

interface Lead {
  _id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  score: number;
  status: string;
  notes: string;
}

const statusStyle: Record<string, string> = {
  'New': 'bg-[#0071E3]/10 text-[#0071E3]',
  'Contacted': 'bg-amber-100 text-amber-700',
  'Replied': 'bg-green-100 text-green-700',
  'Meeting Booked': 'bg-emerald-100 text-emerald-700',
  'Qualified': 'bg-purple-100 text-purple-700',
  'Disqualified': 'bg-gray-100 text-gray-500',
};

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', title: '', company: '', email: '', linkedin: '' });

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const addLead = async () => {
    if (!newLead.name.trim()) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        setNewLead({ name: '', title: '', company: '', email: '', linkedin: '' });
        setShowAddModal(false);
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to add lead:', err);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter(l => l._id !== id));
    } catch {}
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
    } catch {}
  };

  const filtered = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.score > 70).length;
  const replied = leads.filter(l => l.status === 'Replied').length;
  const meetings = leads.filter(l => l.status === 'Meeting Booked').length;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="leads" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Leads</h2>
          <button
            onClick={() => setShowAddModal(true)}
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
            <div className="p-5 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid #f0f0f5' }}>
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
                <input
                  type="text"
                  placeholder="Search leads..."
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#0071E3' }} />
                        <p className="mt-3 text-sm font-medium" style={{ color: '#6e6e73' }}>Loading leads...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-10 h-10" style={{ color: '#c7c7cc' }} />
                          <p className="font-bold text-base" style={{ color: '#6e6e73' }}>
                            {leads.length === 0 ? 'No leads yet. Search a company on the Dashboard to discover leads.' : 'No leads match your search'}
                          </p>
                          <p className="text-sm" style={{ color: '#c7c7cc' }}>
                            {leads.length === 0 ? 'Leads are automatically created when you research companies.' : 'Try adjusting the filters or search query'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((lead, i) => (
                    <motion.tr
                      key={lead._id}
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
                            {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }} title={lead.email}>
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {lead.linkedin && (
                            <a href={lead.linkedin} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg transition-colors" style={{ color: '#6e6e73' }}>
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-black ${scoreColor(lead.score)}`}>{lead.score}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${statusStyle[lead.status] || 'bg-gray-100 text-gray-500'}`}
                        >
                          {['New', 'Contacted', 'Replied', 'Meeting Booked', 'Qualified', 'Disqualified'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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
                          <button
                            onClick={() => deleteLead(lead._id)}
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

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add New Lead</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'John Smith', required: true },
                  { key: 'title', label: 'Job Title', placeholder: 'VP of Engineering' },
                  { key: 'company', label: 'Company', placeholder: 'Acme Corp' },
                  { key: 'email', label: 'Email', placeholder: 'john@acme.com' },
                  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={(newLead as any)[field.key]}
                      onChange={e => setNewLead({ ...newLead, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                  </div>
                ))}
                <button
                  onClick={addLead}
                  disabled={!newLead.name.trim()}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  Add Lead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
