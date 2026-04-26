import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GenericPageProps {
  title: string;
  content: React.ReactNode;
  onBack: () => void;
}

export const GenericPage: React.FC<GenericPageProps> = ({ title, content, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-primary/10 py-20">
        <div className="container mx-auto px-4 md:px-10 lg:px-20 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-10 lg:px-20 max-w-4xl py-16">
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary hover:prose-a:text-primary/80">
          {content}
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
        <div className="container mx-auto px-4 md:px-10 lg:px-20 text-center">
          <p className="text-slate-500 text-sm font-medium">© 2026 Signalz by Lycoris Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
