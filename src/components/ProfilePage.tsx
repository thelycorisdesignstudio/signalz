import React, { useState } from 'react';
import { Linkedin, CheckCircle2, XCircle, AlertCircle, RefreshCcw, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LinkedInParsingStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ProfilePage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'partial' | 'error'>('idle');
  const [parsingResults, setParsingResults] = useState<LinkedInParsingStatus[]>([]);

  const simulateLinkedInConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('idle');
    setParsingResults([]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const results: LinkedInParsingStatus[] = [
      { field: 'Profile Name', status: 'success', message: 'Successfully parsed: John Doe' },
      { field: 'Headline', status: 'success', message: 'Successfully parsed: Senior Sales Executive at Signalz' },
      { field: 'Connections', status: 'success', message: '500+ connections fetched' },
      { field: 'Network Size', status: 'not_found', message: 'Exact network size could not be determined from public profile' },
      { field: 'Experience History', status: 'partial' as any, message: 'Only last 2 roles were successfully parsed due to profile privacy settings' },
    ];

    setParsingResults(results);
    setConnectionStatus('partial');
    setIsConnecting(false);
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-display font-extrabold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your personal settings and external integrations.</p>
      </header>

      <div className="space-y-8">
        {/* LinkedIn Integration Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linkedin/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-md">
              <div className="w-16 h-16 bg-linkedin rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-linkedin/20">
                <Linkedin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">LinkedIn Integration</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Connect your LinkedIn profile to sync your network, fetch stakeholder insights, and personalize your outreach messages automatically.
              </p>
              
              {connectionStatus === 'idle' && !isConnecting && (
                <button
                  onClick={simulateLinkedInConnect}
                  className="px-8 py-4 bg-linkedin text-white rounded-full font-bold flex items-center gap-2 hover:bg-linkedin/90 transition-all shadow-xl shadow-linkedin/20"
                >
                  Connect LinkedIn Profile
                </button>
              )}

              {isConnecting && (
                <div className="flex items-center gap-3 text-linkedin font-bold">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Authenticating with LinkedIn...
                </div>
              )}
            </div>

            <div className="flex-1">
              <AnimatePresence>
                {(connectionStatus !== 'idle' || isConnecting) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-50 rounded-3xl border border-slate-100 p-6"
                  >
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Parsing Status</h3>
                    <div className="space-y-3">
                      {isConnecting ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-5 h-5 bg-slate-200 rounded-full" />
                            <div className="h-4 bg-slate-200 rounded-md w-32" />
                          </div>
                        ))
                      ) : (
                        parsingResults.map((result, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            {result.status === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : result.status === 'not_found' ? (
                              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">{result.field}</p>
                              <p className="text-xs text-slate-500">{result.message}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {!isConnecting && connectionStatus === 'partial' && (
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-2">
                          <Info className="w-4 h-4" />
                          How to resolve parsing issues:
                        </div>
                        <ul className="text-[11px] text-amber-800/80 space-y-1 list-disc pl-4">
                          <li>Ensure your LinkedIn profile is set to "Public" visibility.</li>
                          <li>Check if "Profile Photo" and "Network" are visible to everyone in your privacy settings.</li>
                          <li>Try disconnecting and reconnecting if the issue persists.</li>
                        </ul>
                        <button 
                          onClick={simulateLinkedInConnect}
                          className="mt-3 text-xs font-bold text-amber-700 flex items-center gap-1 hover:underline"
                        >
                          <RefreshCcw className="w-3 h-3" /> Retry Connection
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Other Profile Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" defaultValue="" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-linkedin/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" defaultValue="" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-linkedin/20" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts for high-intent signals</p>
                </div>
                <div className="w-12 h-6 bg-linkedin rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">AI Outreach Suggestions</p>
                  <p className="text-xs text-slate-500">Auto-generate angles for new signals</p>
                </div>
                <div className="w-12 h-6 bg-linkedin rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

