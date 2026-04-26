import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Video, 
  FileText, 
  ExternalLink,
  ChevronRight,
  LifeBuoy,
  Activity,
  Play,
  Database
} from 'lucide-react';
import { Sidebar } from './Sidebar';

interface HelpPageProps {
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

const CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', icon: Book, description: 'Learn the basics of Signalz and set up your account.' },
  { id: 'intent-data', title: 'Understanding Intent Data', icon: Activity, description: 'Deep dive into how intent scores are calculated and used.' },
  { id: 'sequences', title: 'Mastering Sequences', icon: Play, description: 'Create, manage, and optimize your outreach sequences.' },
  { id: 'integrations', title: 'Integrations & API', icon: Database, description: 'Connect Signalz with your CRM and other tools.' },
];

const POPULAR_ARTICLES = [
  'How to configure your first intent topic',
  'Best practices for cold outreach sequences',
  'Connecting Salesforce to Signalz',
  'Understanding the Lead Scoring model',
  'Setting up custom alerts for high-intent accounts'
];

export const HelpPage: React.FC<HelpPageProps> = (props) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      <Sidebar activeView="help" {...props} />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex items-center px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold tracking-tight">Help Center</h2>
        </header>

        {/* Hero Search Section */}
        <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20 p-8 md:p-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you today?</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Search our knowledge base for guides, tutorials, and troubleshooting articles.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-12">
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="#" className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Book className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Knowledge Base</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Browse detailed articles and step-by-step guides.</p>
            </a>
            <a href="#" className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Video Tutorials</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Watch quick lessons on how to use key features.</p>
            </a>
            <a href="#" className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Community Forum</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Connect with other users and share best practices.</p>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold">Browse by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <a key={category.id} href="#" className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-primary shrink-0">
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{category.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{category.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Articles & Support */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Popular Articles
                </h3>
                <ul className="space-y-3">
                  {POPULAR_ARTICLES.map((article, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary flex items-start gap-2 group">
                        <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-slate-300 group-hover:text-primary transition-colors" />
                        <span className="leading-snug">{article}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-md p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Still need help?</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Our support team is available 24/7 to help you with any technical issues or questions.
                </p>
                <button className="w-full py-2.5 bg-white text-primary font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  Contact Support
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
