import React from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Globe, 
  Database,
  Save
} from 'lucide-react';
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

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      <Sidebar activeView="settings" {...props} />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold tracking-tight">Settings</h2>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-primary rounded-lg font-medium text-sm">
                  <User className="w-4 h-4" />
                  Profile & Account
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                  <Bell className="w-4 h-4" />
                  Notifications
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                  <Shield className="w-4 h-4" />
                  Security
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                  <Users className="w-4 h-4" />
                  Team Members
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                  <Database className="w-4 h-4" />
                  Integrations
                </a>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                      <input type="text" defaultValue="" placeholder="First Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                      <input type="text" defaultValue="" placeholder="Last Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" defaultValue="" placeholder="your@email.com" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
                    <input type="text" defaultValue="" placeholder="Your Job Title" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Company Details</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                    <input type="text" defaultValue="" placeholder="Your Company Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                    <input type="url" defaultValue="" placeholder="https://yourcompany.com" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
