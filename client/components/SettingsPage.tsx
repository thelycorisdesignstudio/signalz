import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Globe,
  Database,
  Save,
  Loader2,
  CheckCircle2,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';

interface SettingsPageProps {
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

interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  mission: string;
  valueLine: string;
  targetIndustries: string;
  targetRoles: string;
  outreachTone: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem('signalz_profile');
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    const user = localStorage.getItem('signalz_user');
    const parsed = user ? JSON.parse(user) : {};
    return {
      name: parsed.name || '',
      email: parsed.email || '',
      company: parsed.company || '',
      role: parsed.role || '',
      website: '',
      mission: '',
      valueLine: '',
      targetIndustries: '',
      targetRoles: '',
      outreachTone: 'professional',
    };
  });

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem('signalz_profile', JSON.stringify(profile));
      const token = localStorage.getItem('signalz_token');
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: profile.name, company: profile.company, role: profile.role }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#f6f6f8] border-0 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-all";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block";

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'mission', label: 'Sales Mission', icon: Target },
    { id: 'outreach', label: 'Outreach Settings', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased" style={{ background: '#f6f6f8', color: '#1D1D1F' }}>
      <Sidebar activeView="settings" {...props} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>Settings</h2>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold disabled:opacity-50"
            style={{ background: saved ? '#34c759' : '#0071E3' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-56 shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all text-left"
                    style={
                      activeTab === tab.id
                        ? { background: '#0071E3', color: '#fff' }
                        : { color: '#6e6e73' }
                    }
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 space-y-6">
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-5" style={{ color: '#1D1D1F' }}>Profile Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Full Name</label>
                          <input type="text" value={profile.name} onChange={e => updateField('name', e.target.value)} placeholder="Sonny Sehgal" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Job Title / Role</label>
                          <input type="text" value={profile.role} onChange={e => updateField('role', e.target.value)} placeholder="CEO" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" value={profile.email} onChange={e => updateField('email', e.target.value)} placeholder="you@company.com" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-5" style={{ color: '#1D1D1F' }}>Company Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Company Name</label>
                        <input type="text" value={profile.company} onChange={e => updateField('company', e.target.value)} placeholder="Transputec" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Company Website</label>
                        <input type="url" value={profile.website} onChange={e => updateField('website', e.target.value)} placeholder="https://transputec.com" className={inputClass} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mission' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-2" style={{ color: '#1D1D1F' }}>Your Sales Mission</h3>
                    <p className="text-sm font-medium mb-5" style={{ color: '#6e6e73' }}>
                      Tell Signalz your goal once. It finds the right people, watches for the right moment, and writes the right message.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Mission Statement</label>
                        <textarea
                          value={profile.mission}
                          onChange={e => updateField('mission', e.target.value)}
                          placeholder="I am Sonny Sehgal, CEO of Transputec. My goal is to sell Kuhnic AI voice agents to UK-based businesses with 50-500 employees, specifically targeting ops directors and CEOs in professional services, financial services, and logistics."
                          rows={4}
                          className={inputClass + ' resize-none'}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Your Value Proposition (one line)</label>
                        <input
                          type="text"
                          value={profile.valueLine}
                          onChange={e => updateField('valueLine', e.target.value)}
                          placeholder="We help businesses automate 80% of inbound calls with AI voice agents — cutting costs and improving customer experience."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-5" style={{ color: '#1D1D1F' }}>Target Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Target Industries</label>
                        <input
                          type="text"
                          value={profile.targetIndustries}
                          onChange={e => updateField('targetIndustries', e.target.value)}
                          placeholder="Professional services, Financial services, Logistics, Healthcare"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Target Roles / Decision Makers</label>
                        <input
                          type="text"
                          value={profile.targetRoles}
                          onChange={e => updateField('targetRoles', e.target.value)}
                          placeholder="CEO, COO, VP Operations, Head of Customer Service"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'outreach' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-5" style={{ color: '#1D1D1F' }}>Outreach Tone & Style</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Outreach Tone</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'professional', label: 'Professional', desc: 'Polished and businesslike' },
                            { id: 'casual', label: 'Casual', desc: 'Friendly and conversational' },
                            { id: 'direct', label: 'Direct', desc: 'Straight to the point' },
                          ].map(tone => (
                            <button
                              key={tone.id}
                              onClick={() => updateField('outreachTone', tone.id)}
                              className="p-4 rounded-2xl text-left transition-all"
                              style={
                                profile.outreachTone === tone.id
                                  ? { background: '#0071E3', color: '#fff' }
                                  : { background: '#f6f6f8', color: '#1D1D1F' }
                              }
                            >
                              <p className="font-bold text-sm">{tone.label}</p>
                              <p className="text-xs mt-1 opacity-70">{tone.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-black mb-2" style={{ color: '#1D1D1F' }}>Email Signature</h3>
                    <p className="text-sm font-medium mb-4" style={{ color: '#6e6e73' }}>This info is used to personalize your outreach emails.</p>
                    <div className="p-4 rounded-2xl" style={{ background: '#f6f6f8' }}>
                      <p className="font-bold text-sm">{profile.name || 'Your Name'}</p>
                      <p className="text-xs font-medium" style={{ color: '#6e6e73' }}>{profile.role || 'Your Role'} at {profile.company || 'Your Company'}</p>
                      {profile.website && <p className="text-xs font-medium mt-1" style={{ color: '#0071E3' }}>{profile.website}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'integrations') && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-white rounded-3xl p-12 flex flex-col items-center gap-3">
                    <Settings className="w-10 h-10" style={{ color: '#c7c7cc' }} />
                    <p className="font-bold text-base" style={{ color: '#6e6e73' }}>
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings coming soon
                    </p>
                    <p className="text-sm" style={{ color: '#c7c7cc' }}>This section is under development</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
