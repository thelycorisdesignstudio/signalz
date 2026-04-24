import React from 'react';
import { Sidebar } from './Sidebar';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  activeView: 'dashboard' | 'account-brief' | 'my-profile' | 'watchlist' | 'settings' | 'help' | 'leads' | 'sequences' | 'accounts';
  onNavigateDashboard: () => void;
  onNavigateProfile: () => void;
  onNavigateWatchlist: () => void;
  onNavigateLeads: () => void;
  onNavigateSequences: () => void;
  onNavigateSettings: () => void;
  onNavigateHelp: () => void;
  onNavigateAccounts: () => void;
  onLogout: () => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  activeView,
  onNavigateDashboard,
  onNavigateProfile,
  onNavigateWatchlist,
  onNavigateLeads,
  onNavigateSequences,
  onNavigateSettings,
  onNavigateHelp,
  onNavigateAccounts,
  onLogout
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      <Sidebar 
        activeView={activeView}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateProfile={onNavigateProfile}
        onNavigateWatchlist={onNavigateWatchlist}
        onNavigateLeads={onNavigateLeads}
        onNavigateSequences={onNavigateSequences}
        onNavigateSettings={onNavigateSettings}
        onNavigateHelp={onNavigateHelp}
        onNavigateAccounts={onNavigateAccounts}
        onLogout={onLogout}
      />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Construction className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
            We're working hard to bring you this feature. Check back soon for updates!
          </p>
          <button 
            onClick={onNavigateDashboard}
            className="mt-8 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};
