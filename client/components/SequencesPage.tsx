import React, { useState, useEffect } from 'react';
import {
  Play,
  Search,
  Plus,
  Mail,
  Linkedin,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Users,
  CalendarCheck,
  TrendingUp,
  Pause,
  Loader2,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';

interface SequencesPageProps {
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

type StepType = 'email' | 'linkedin' | 'followup' | 'call';

interface SequenceStep {
  type: StepType;
  label: string;
}

interface Sequence {
  _id: string;
  name: string;
  steps: SequenceStep[];
  activeContacts: number;
  replied: number;
  bounced: number;
  status: 'Active' | 'Paused' | 'Draft';
}

const StepIcon: React.FC<{ type: StepType }> = ({ type }) => {
  const iconProps = { className: 'w-3.5 h-3.5', style: { color: '#fff' } };
  if (type === 'email') return <Mail {...iconProps} />;
  if (type === 'linkedin') return <Linkedin {...iconProps} />;
  if (type === 'followup') return <MessageSquare {...iconProps} />;
  return <Phone {...iconProps} />;
};

const stepBg: Record<StepType, string> = {
  email: '#0071E3',
  linkedin: '#1D1D1F',
  followup: '#34c759',
  call: '#ff9500',
};

const statusStyle: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Paused': 'bg-amber-100 text-amber-700',
  'Draft': 'bg-gray-100 text-gray-500',
};

export const SequencesPage: React.FC<SequencesPageProps> = (props) => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSteps, setNewSteps] = useState<SequenceStep[]>([{ type: 'email', label: 'Email' }]);

  const fetchSequences = async () => {
    try {
      const res = await fetch('/api/sequences');
      if (res.ok) {
        const data = await res.json();
        setSequences(data);
      }
    } catch (err) {
      console.error('Failed to fetch sequences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSequences(); }, []);

  const createSequence = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, steps: newSteps, status: 'Draft' }),
      });
      if (res.ok) {
        setNewName('');
        setNewSteps([{ type: 'email', label: 'Email' }]);
        setShowCreateModal(false);
        fetchSequences();
      }
    } catch {}
  };

  const deleteSequence = async (id: string) => {
    try {
      await fetch(`/api/sequences/${id}`, { method: 'DELETE' });
      setSequences(sequences.filter(s => s._id !== id));
    } catch {}
  };

  const toggleStatus = async (seq: Sequence) => {
    const newStatus = seq.status === 'Active' ? 'Paused' : 'Active';
    try {
      await fetch(`/api/sequences/${seq._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSequences(sequences.map(s => s._id === seq._id ? { ...s, status: newStatus as any } : s));
    } catch {}
  };

  const addStep = (type: StepType) => {
    const labels: Record<StepType, string> = { email: 'Email', linkedin: 'LinkedIn', followup: 'Follow-up', call: 'Call' };
    setNewSteps([...newSteps, { type, label: labels[type] }]);
  };

  const filtered = sequences.filter(seq =>
    seq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = sequences.filter(s => s.status === 'Active').length;
  const totalContacts = sequences.reduce((sum, s) => sum + (s.activeContacts || 0), 0);
  const avgReply = sequences.filter(s => (s.activeContacts || 0) > 0).length > 0
    ? Math.round(sequences.filter(s => (s.activeContacts || 0) > 0).reduce((sum, s) => sum + ((s.replied || 0) / (s.activeContacts || 1)) * 100, 0) / sequences.filter(s => (s.activeContacts || 0) > 0).length)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="sequences" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Sequences</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold"
            style={{ background: '#0071E3' }}
          >
            <Plus className="w-4 h-4" />
            New Sequence
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Sequences', value: activeCount, icon: <Play className="w-5 h-5" style={{ color: '#0071E3' }} /> },
              { label: 'Total Contacts', value: totalContacts, icon: <Users className="w-5 h-5 text-green-500" /> },
              { label: 'Reply Rate', value: `${avgReply}%`, icon: <TrendingUp className="w-5 h-5 text-amber-500" /> },
              { label: 'Total Sequences', value: sequences.length, icon: <CalendarCheck className="w-5 h-5 text-emerald-500" /> },
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
              placeholder="Search sequences..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
              style={{ background: '#fff', color: '#1D1D1F' }}
            />
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0071E3' }} />
              <p className="text-sm font-medium" style={{ color: '#6e6e73' }}>Loading sequences...</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3"
            >
              <Mail className="w-10 h-10" style={{ color: '#c7c7cc' }} />
              <p className="font-bold text-base" style={{ color: '#6e6e73' }}>
                {sequences.length === 0 ? 'No sequences yet. Create your first outreach sequence.' : 'No sequences match your search'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((seq, i) => {
                const replyPct = (seq.activeContacts || 0) > 0 ? Math.round(((seq.replied || 0) / seq.activeContacts) * 100) : 0;
                const bouncePct = (seq.activeContacts || 0) > 0 ? Math.round(((seq.bounced || 0) / seq.activeContacts) * 100) : 0;
                return (
                  <motion.div
                    key={seq._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-3xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black" style={{ color: '#1D1D1F' }}>{seq.name}</h3>
                        <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold ${statusStyle[seq.status]}`}>
                          {seq.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(seq)}
                          className="p-2 rounded-xl transition-colors"
                          style={{ color: '#6e6e73' }}
                        >
                          {seq.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteSequence(seq._id)}
                          className="p-2 rounded-xl transition-colors text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-5 flex-wrap">
                      {seq.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: stepBg[step.type] || '#6e6e73' }}
                            >
                              <StepIcon type={step.type} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: '#6e6e73' }}>{step.label}</span>
                          </div>
                          {idx < seq.steps.length - 1 && (
                            <div className="w-6 h-px mb-4" style={{ background: '#c7c7cc' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid #f0f0f5' }}>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Active</p>
                        <p className="text-2xl font-black" style={{ color: '#1D1D1F' }}>{seq.activeContacts || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Reply Rate</p>
                        <p className="text-2xl font-black text-green-600">{replyPct}%</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Bounced</p>
                        <p className="text-2xl font-black text-red-500">{bouncePct}%</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Sequence Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Create New Sequence</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Sequence Name</label>
                  <input
                    type="text"
                    placeholder="Enterprise Outreach Q2"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f6f6f8] text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Steps</label>
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {newSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stepBg[step.type] }}>
                            <StepIcon type={step.type} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: '#6e6e73' }}>{step.label}</span>
                        </div>
                        {idx < newSteps.length - 1 && <div className="w-4 h-px mb-4" style={{ background: '#c7c7cc' }} />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {(['email', 'linkedin', 'followup', 'call'] as StepType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => addStep(type)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f6f6f8] hover:bg-[#0071E3]/10 transition-colors"
                      >
                        + {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={createSequence}
                  disabled={!newName.trim()}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  Create Sequence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
