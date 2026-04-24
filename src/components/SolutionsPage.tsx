import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  Target, 
  ArrowLeft,
  CheckCircle2,
  Rocket,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

interface SolutionsPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onBack, onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2 rounded-full transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6"
            >
              Solutions for Every <br /><span className="text-primary">Revenue Team</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Signalz provides tailored intelligence for every stage of your sales cycle.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: "Sales Development",
                desc: "Equip your SDRs with high-intent leads and personalized outreach angles that break through the noise.",
                features: ["Intent-based prospecting", "Automated outreach drafts", "Stakeholder identification", "Real-time signal alerts"]
              },
              {
                icon: Building2,
                title: "Account Executives",
                desc: "Close complex enterprise deals faster with deep account intelligence and stakeholder mapping.",
                features: ["Decision-maker mapping", "Account health scoring", "Competitive intelligence", "Strategic outreach angles"]
              },
              {
                icon: Users,
                title: "Customer Success",
                desc: "Identify expansion opportunities and prevent churn with real-time monitoring of your customer accounts.",
                features: ["Churn risk detection", "Expansion signal alerts", "Stakeholder change tracking", "Account health monitoring"]
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {item.desc}
                </p>
                <ul className="space-y-3">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Experience the future of sales today</h2>
            <button 
              onClick={onGetStarted}
              className="bg-white text-primary hover:bg-slate-100 text-lg font-black px-10 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 relative z-10"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500 text-sm font-medium">© 2026 Signalz by Lycoris Labs. All rights reserved.</p>
      </footer>
    </div>
  );
};
