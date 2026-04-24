import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowLeft,
  Zap,
  Sparkles,
  Rocket,
  Shield,
  Users
} from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack, onGetStarted }) => {
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
              Simple, Transparent <br /><span className="text-primary">Pricing</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Choose the plan that's right for your team and start closing more deals.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
            {[
              {
                title: "Starter",
                price: "$99",
                desc: "Perfect for individual sales reps and small teams.",
                features: ["Up to 50 accounts tracked", "Real-time intent signals", "Basic stakeholder mapping", "AI outreach drafts"],
                button: "Start Free Trial",
                popular: false
              },
              {
                title: "Professional",
                price: "$299",
                desc: "Ideal for growing sales teams and revenue operations.",
                features: ["Up to 500 accounts tracked", "Advanced intent signals", "Full stakeholder mapping", "AI outreach personalization", "CRM integrations"],
                button: "Start Free Trial",
                popular: true
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border ${item.popular ? 'border-primary shadow-2xl shadow-primary/10' : 'border-slate-200 dark:border-slate-800'} relative`}
              >
                {item.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2">{item.title}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{item.price}</span>
                  {item.price !== "Custom" && <span className="text-slate-500 text-sm font-bold">/ month</span>}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                  {item.desc}
                </p>
                <ul className="space-y-4 mb-10">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-xl font-black transition-all ${item.popular ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {item.button}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto text-left space-y-8 mt-12">
              {[
                { q: "How does the free trial work?", a: "You can try Signalz for free for 14 days. No credit card required. You'll have access to all the features of the Professional plan." },
                { q: "Can I change my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from your account settings." },
                { q: "What kind of support do you offer?", a: "We offer 24/7 email support for all plans. Professional customers also get priority support." }
              ].map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-bold text-lg">{faq.q}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500 text-sm font-medium">© 2026 Signalz by Lycoris Labs. All rights reserved.</p>
      </footer>
    </div>
  );
};
