import React, { useState } from 'react';
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
  Pause
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
  id: number;
  name: string;
  steps: SequenceStep[];
  active: number;
  replied: number;
  bounced: number;
  status: 'Active' | 'Paused' | 'Draft';
}

const SAMPLE_SEQUENCES: Sequence[] = [
  {
    id: 1,
    name: 'Enterprise Outreach',
    steps: [
      { type: 'email', label: 'Email' },
      { type: 'linkedin', label: 'LinkedIn' },
      { type: 'followup', label: 'Follow-up' },
      { type: 'call', label: 'Call' },
    ],
    active: 142,
    replied: 24,
    bounced: 3,
    status: 'Active',
  },
  {
    id: 2,
    name: 'SaaS Decision Makers',
    steps: [
      { type: 'email', label: 'Email' },
      { type: 'followup', label: 'Follow-up' },
      { type: 'linkedin', label: 'LinkedIn' },
      { type: 'followup', label: 'Follow-up' },
      { type: 'call', label: 'Call' },
    ],
    active: 98,
    replied: 18,
    bounced: 2,
    status: 'Active',
  },
  {
    id: 3,
    name: 'AI Startup Founders',
    steps: [
      { type: 'linkedin', label: 'LinkedIn' },
      { type: 'email', label: 'Email' },
      { type: 'followup', label: 'Follow-up' },
    ],
    active: 57,
    replied: 14,
    bounced: 1,
    status: 'Paused',
  },
  {
    id: 4,
    name: 'Series B+ Companies',
    steps: [
      { type: 'email', label: 'Email' },
      { type: 'linkedin', label: 'LinkedIn' },
      { type: 'followup', label: 'Follow-up' },
      { type: 'call', label: 'Call' },
      { type: 'email', label: 'Email' },
      { type: 'followup', label: 'Follow-up' },
      { type: 'call', label: 'Call' },
    ],
    active: 0,
    replied: 0,
    bounced: 0,
    status: 'Draft',
  },
];

const StepIcon: React.FC<{ type: StepType }> = ({ type }) => {
  const props = { className: 'w-3.5 h-3.5', style: { color: '#fff' } };
  if (type === 'email') return <Mail {...props} />;
  if (type === 'linkedin') return <Linkedin {...props} />;
  if (type === 'followup') return <MessageSquare {...props} />;
  return <Phone {...props} />;
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
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SAMPLE_SEQUENCES.filter(seq =>
    seq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = SAMPLE_SEQUENCES.filter(s => s.status === 'Active').length;
  const totalContacts = SAMPLE_SEQUENCES.reduce((sum, s) => sum + s.active, 0);
  const avgReply = Math.round(
    SAMPLE_SEQUENCES.filter(s => s.active > 0).reduce((sum, s) => sum + (s.replied / s.active) * 100, 0) /
    SAMPLE_SEQUENCES.filter(s => s.active > 0).length
  );
  const meetings = 12; // sample

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="sequences" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Sequences</h2>
          <button
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

          {/* Sequences Cards */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6e6e73' }} />
            <input
              type="text"
              placeholder="Search sequences…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm font-medium outline-none"
              style={{ background: '#fff', color: '#1D1D1F' }}
            />
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-20 flex flex-col items-center gap-3"
            >
              <Search className="w-10 h-10" style={{ color: '#c7c7cc' }} />
              <p className="font-bold text-base" style={{ color: '#6e6e73' }}>No sequences match your search</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((seq, i) => {
                const replyPct = seq.active > 0 ? Math.round((seq.replied / seq.active) * 100) : 0;
                const bouncePct = seq.active > 0 ? Math.round((seq.bounced / seq.active) * 100) : 0;
                return (
                  <motion.div
                    key={seq.id}
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
                        <button className="p-2 rounded-xl transition-colors" style={{ color: '#6e6e73' }}>
                          {seq.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 rounded-xl transition-colors" style={{ color: '#6e6e73' }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Steps Visualization */}
                    <div className="flex items-center gap-1 mb-5 flex-wrap">
                      {seq.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: stepBg[step.type] }}
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

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid #f0f0f5' }}>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#6e6e73' }}>Active</p>
                        <p className="text-2xl font-black" style={{ color: '#1D1D1F' }}>{seq.active}</p>
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
      </main>
    </div>
  );
};
