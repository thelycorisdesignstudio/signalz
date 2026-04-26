import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Mail, 
  Brain, 
  Settings, 
  ArrowLeft, 
  Bell, 
  LogOut,
  Linkedin,
  Star,
  UserCircle,
  SignalHigh,
  Save,
  Link as LinkIcon,
  Activity,
  Users as UsersIcon,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

import { Sidebar } from './Sidebar';
import { parseLinkedInProfile } from '../services/ai';

interface MyProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateDashboard?: () => void;
  onNavigateWatchlist?: () => void;
  onNavigateLeads?: () => void;
  onNavigateSequences?: () => void;
  onNavigateSettings?: () => void;
  onNavigateHelp?: () => void;
  onNavigateAccounts?: () => void;
  onNavigateProfile?: () => void;
}

export const MyProfilePage: React.FC<MyProfilePageProps> = ({ 
  onBack, 
  onLogout, 
  onNavigateDashboard, 
  onNavigateWatchlist,
  onNavigateLeads,
  onNavigateSequences,
  onNavigateSettings,
  onNavigateHelp,
  onNavigateAccounts,
  onNavigateProfile
}) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!linkedinUrl) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const data = await parseLinkedInProfile(linkedinUrl);
      
      if (!data) {
        throw new Error('Failed to parse profile. Please check the URL and try again.');
      }
      
      setProfileData(data);
      setIsConnected(true);
    } catch (err: any) {
      console.error("LinkedIn Parsing Error:", err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar 
        activeView="my-profile"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark pt-16 md:pt-0 pb-16 md:pb-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-background-dark/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">My Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Personal Details */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Personal Details
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                      <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Change Photo</button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input type="text" defaultValue="Alex Rivera" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                      <input type="text" defaultValue="Senior Account Executive" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input type="email" defaultValue="alex.rivera@signalz.ai" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input type="tel" defaultValue="+1 (555) 019-2834" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* LinkedIn Integration */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  LinkedIn Integration
                </h3>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <div className="p-6">
                {!isConnected ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Connect your LinkedIn profile to sync your network, track recent activities, and get better outreach suggestions.
                    </p>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="url" 
                          placeholder="https://linkedin.com/in/your-profile" 
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0A66C2] outline-none transition-all`} 
                        />
                      </div>
                      <button 
                        onClick={handleConnect}
                        disabled={!linkedinUrl || isConnecting}
                        className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Connecting...
                          </>
                        ) : (
                          'Connect Profile'
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs text-rose-500 font-medium mt-2">{error}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <img src={profileData?.profile_pic_url || "https://picsum.photos/seed/user/100/100"} alt="LinkedIn Profile" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-bold">{profileData?.full_name || 'Alex Rivera'}</p>
                          <p className="text-xs text-slate-500">{profileData?.headline || 'Senior Account Executive at Signalz AI'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsConnected(false);
                          setProfileData(null);
                        }}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Disconnect
                      </button>
                    </div>

                    {/* Network Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center">
                        <UsersIcon className="w-6 h-6 text-primary mb-2" />
                        <p className="text-2xl font-black">{profileData?.connections?.toLocaleString() || '4,281'}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connections</p>
                      </div>
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center">
                        <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                        <p className="text-2xl font-black">{profileData?.follower_count?.toLocaleString() || '12.5k'}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Followers</p>
                      </div>
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center">
                        <MessageSquare className="w-6 h-6 text-purple-500 mb-2" />
                        <p className="text-2xl font-black">{profileData?.articles?.length || '84'}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activities</p>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                      <h4 className="font-bold text-sm mb-4">Recent Network Activities</h4>
                      <div className="space-y-3">
                        {profileData?.activities?.slice(0, 3).map((activity: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                              <Activity className="w-4 h-4 m-2 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm">{activity.title || 'Recent activity'}</p>
                              <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{activity.date || 'Recently'}</p>
                            </div>
                          </div>
                        )) || (
                          <>
                            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                <img src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm"><span className="font-bold">Sarah Jenkins</span> (VP Infra at Aramco) posted a new article.</p>
                                <p className="text-xs text-slate-500 mt-1">"The Future of Edge Computing in EMEA"</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">2 hours ago</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                <img src="https://picsum.photos/seed/mark/100/100" alt="Mark" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm"><span className="font-bold">Mark Chen</span> (Director of DevOps) commented on your post.</p>
                                <p className="text-xs text-slate-500 mt-1">"Great insights on reducing legacy tech debt!"</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">5 hours ago</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  );
};
