import React from 'react';
import { LayoutDashboard, Building2, BellRing, Star, UserCircle, Settings, HelpCircle, LogOut, SignalHigh, Users, Mail, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'account-brief' | 'my-profile' | 'watchlist' | 'settings' | 'help' | 'leads' | 'sequences' | 'accounts';
  onNavigateDashboard: () => void;
  onNavigateProfile: () => void;
  onNavigateWatchlist: () => void;
  onNavigateLeads?: () => void;
  onNavigateSequences?: () => void;
  onNavigateSettings?: () => void;
  onNavigateHelp?: () => void;
  onNavigateAccounts?: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigateDashboard,
  onNavigateProfile,
  onNavigateWatchlist,
  onNavigateLeads = onNavigateDashboard,
  onNavigateSequences = onNavigateDashboard,
  onNavigateSettings = onNavigateDashboard,
  onNavigateHelp = onNavigateDashboard,
  onNavigateAccounts = onNavigateDashboard,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getButtonClass = (view: string | string[]) => {
    const isActive = Array.isArray(view) ? view.includes(activeView) : activeView === view;
    return `w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
      isActive 
        ? 'bg-[#0071E3]/10 text-[#0071E3]' 
        : 'text-slate-600 hover:bg-slate-100'
    }`;
  };

  const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', onClick: onNavigateDashboard, view: 'dashboard' },
    { icon: Building2, label: 'Accounts', onClick: onNavigateAccounts, view: ['accounts', 'account-brief'] },
    { icon: Star, label: 'Watchlist', onClick: onNavigateWatchlist, view: 'watchlist' },
    { icon: UserCircle, label: 'Profile', onClick: onNavigateProfile, view: 'my-profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-white flex-col h-screen sticky top-0 z-50" style={{borderRight: "1px solid rgba(0,0,0,0.06)"}}>
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="size-8 bg-[#0071E3] rounded-xl flex items-center justify-center text-white">
            <SignalHigh className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-slate-900">Signalz</h1>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <button onClick={onNavigateDashboard} className={getButtonClass('dashboard')}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button onClick={onNavigateAccounts} className={getButtonClass(['accounts', 'account-brief'])}>
            <Building2 className="w-5 h-5" />
            Accounts
          </button>
          <button onClick={onNavigateLeads} className={getButtonClass('leads')}>
            <Users className="w-5 h-5" />
            Leads
          </button>
          <button onClick={onNavigateSequences} className={getButtonClass('sequences')}>
            <Mail className="w-5 h-5" />
            Sequences
          </button>
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking</div>
          <button onClick={onNavigateWatchlist} className={getButtonClass('watchlist')}>
            <Star className="w-5 h-5" />
            Watchlist
          </button>
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</div>
          <button onClick={onNavigateProfile} className={getButtonClass('my-profile')}>
            <UserCircle className="w-5 h-5" />
            My Profile
          </button>
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</div>
          <button onClick={onNavigateSettings} className={getButtonClass('settings')}>
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button onClick={onNavigateHelp} className={getButtonClass('help')}>
            <HelpCircle className="w-5 h-5" />
            Help Center
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-4 text-sm font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white  flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-[#0071E3] rounded-xl flex items-center justify-center text-white">
            <SignalHigh className="w-5 h-5" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Signalz</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <button onClick={() => { onNavigateDashboard(); setIsMobileMenuOpen(false); }} className={getButtonClass('dashboard')}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button onClick={() => { onNavigateAccounts(); setIsMobileMenuOpen(false); }} className={getButtonClass(['accounts', 'account-brief'])}>
              <Building2 className="w-5 h-5" />
              Accounts
            </button>
            <button onClick={() => { onNavigateLeads(); setIsMobileMenuOpen(false); }} className={getButtonClass('leads')}>
              <Users className="w-5 h-5" />
              Leads
            </button>
            <button onClick={() => { onNavigateSequences(); setIsMobileMenuOpen(false); }} className={getButtonClass('sequences')}>
              <Mail className="w-5 h-5" />
              Sequences
            </button>
            <button onClick={() => { onNavigateWatchlist(); setIsMobileMenuOpen(false); }} className={getButtonClass('watchlist')}>
              <Star className="w-5 h-5" />
              Watchlist
            </button>
            <button onClick={() => { onNavigateProfile(); setIsMobileMenuOpen(false); }} className={getButtonClass('my-profile')}>
              <UserCircle className="w-5 h-5" />
              My Profile
            </button>
            <button onClick={() => { onNavigateSettings(); setIsMobileMenuOpen(false); }} className={getButtonClass('settings')}>
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button onClick={() => { onNavigateHelp(); setIsMobileMenuOpen(false); }} className={getButtonClass('help')}>
              <HelpCircle className="w-5 h-5" />
              Help Center
            </button>
            <div className="my-4 "></div>
            <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white  flex items-center justify-around px-2 z-40 pb-safe">
        {mobileNavItems.map((item, i) => {
          const isActive = Array.isArray(item.view) ? item.view.includes(activeView) : activeView === item.view;
          return (
            <button 
              key={i}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-[#0071E3]' : 'text-slate-500'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
