import React from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Zap, Target, BarChart3, ShieldCheck, Globe, BrainCircuit, CheckCircle2, Users, TrendingUp, MessageSquare, Award, Clock, Search, Rocket, Sparkles } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate?: (view: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  return (
    <div className="pt-24 pb-20 overflow-hidden bg-white">
      <Helmet>
        <title>Signalz | AI-Powered B2B Sales Intelligence & Outreach</title>
        <meta name="description" content="Signalz is the ultimate AI-powered sales intelligence platform. Automate intent data gathering, map buying committees, and generate hyper-personalized outreach to close more enterprise deals." />
        <meta name="keywords" content="B2B sales, intent data, sales intelligence, AI outreach, sales automation, revenue operations, account-based marketing, ABM" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Signalz",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "AI-powered B2B sales intelligence and automated outreach platform.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          `}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl -z-10"
        />
        
        <motion.div {...fadeInUp}>
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full border border-blue-100">
            Next-Gen Sales Intelligence Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Turn Buying Signals into <br />
            <span className="text-blue-600">Predictable Revenue.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-600 mb-10 leading-relaxed">
            Signalz is the ultimate AI-driven sales intelligence platform. We help B2B revenue teams identify high-intent prospects, map complex stakeholder structures, and generate hyper-personalized outreach that converts at scale. Stop guessing and start closing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all">
              Book a Live Demo
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required • 14-day free trial • Cancel anytime</p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-10 pointer-events-none" />
            <img 
              src="https://picsum.photos/seed/dashboard-ui-sales/1200/600" 
              alt="Signalz AI Sales Intelligence Dashboard Interface" 
              className="rounded-2xl opacity-90 w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-6 -right-6 hidden lg:block bg-white p-5 rounded-2xl shadow-xl border border-slate-100 z-20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-sm font-bold text-slate-900">High Intent Signal Detected</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Enterprise Corp visited Pricing Page (3x)</p>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-6 -left-6 hidden lg:block bg-white p-5 rounded-2xl shadow-xl border border-slate-100 z-20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">AI Draft Ready</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Personalized email generated for VP of IT</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by innovative revenue teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            {/* Placeholder logos */}
            {['', 'GlobalTech', 'Innovate Inc', 'Nexus Systems', 'Quantum Data'].map((company, i) => (
              <div key={i} className="text-xl font-black font-display text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6 tracking-tight">
            A Complete System for Modern Outbound
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Signalz replaces fragmented tools with a unified, AI-native platform designed to accelerate your sales cycle from discovery to closed-won.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-display font-bold text-slate-900 mb-4">How Signalz Works</h3>
            <p className="text-slate-600 text-lg">A seamless workflow from signal to meeting booked.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
            {[
              { step: "01", title: "Listen", desc: "We monitor billions of data points across the web for buying signals." },
              { step: "02", title: "Identify", desc: "AI maps the buying committee and finds verified contact info." },
              { step: "03", title: "Personalize", desc: "LLMs draft hyper-relevant outreach based on deep account context." },
              { step: "04", title: "Engage", desc: "Sync with your CRM and sales engagement platform to send." }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl text-center relative shadow-sm hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg shadow-blue-500/30">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <div className="bg-slate-100 rounded-3xl p-8 aspect-square relative overflow-hidden">
              <img src="https://picsum.photos/seed/feature1/800/800" alt="Intent Data Visualization" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 rounded-3xl" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Real-Time Intent Data</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Stop cold calling in the dark. Our proprietary intent engine monitors billions of data points across the web to alert you the exact moment a target account begins researching solutions in your category.
            </p>
            <ul className="space-y-4">
              {[
                'First-party website visitor tracking',
                'Third-party topic surging alerts',
                'Job change and hiring signals',
                'Funding and news event monitoring'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Automated Stakeholder Mapping</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              B2B deals involve an average of 7 decision-makers. Signalz automatically builds dynamic organizational charts for your target accounts, identifying champions, blockers, and economic buyers.
            </p>
            <ul className="space-y-4">
              {[
                'Identify buying committee members instantly',
                'Map reporting structures and influence',
                'Find the best path of introduction',
                'Track engagement across the entire account'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="bg-slate-100 rounded-3xl p-8 aspect-square relative overflow-hidden">
              <img src="https://picsum.photos/seed/feature2/800/800" alt="Stakeholder Mapping UI" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 rounded-3xl" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-slate-100 rounded-3xl p-8 aspect-square relative overflow-hidden">
              <img src="https://picsum.photos/seed/feature3/800/800" alt="AI Outreach Generation" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 rounded-3xl" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Generative AI Outreach</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Leverage advanced LLMs to craft hyper-personalized emails and LinkedIn messages. Our AI analyzes the prospect's background, company news, and intent signals to generate copy that gets replies.
            </p>
            <ul className="space-y-4">
              {[
                'Context-aware message generation',
                'Multi-channel sequence drafting',
                'Tone and style customization',
                'A/B testing recommendations'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Everything you need to close faster
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We combine real-time activity signals with deep account intelligence to give you an unfair advantage in a competitive market.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
          >
            {[
              {
                icon: Zap,
                title: "Intent Signals",
                desc: "Track website visits, whitepaper downloads, and pricing views in real-time to strike when the iron is hot."
              },
              {
                icon: Target,
                title: "Stakeholder Mapping",
                desc: "Identify key decision-makers and their roles within target accounts automatically without manual research."
              },
              {
                icon: BrainCircuit,
                title: "AI Outreach",
                desc: "Generate hyper-personalized outreach angles based on recent activity, pain points, and company news."
              },
              {
                icon: BarChart3,
                title: "Account Briefs",
                desc: "Get a comprehensive 360-degree view of any account in seconds, perfectly formatted for your pre-call prep."
              },
              {
                icon: ShieldCheck,
                title: "Secure & Scalable",
                desc: "Built with enterprise-grade security, SOC2 compliance, and scalability at the core for global teams."
              },
              {
                icon: Globe,
                title: "Global Reach",
                desc: "Access deep intelligence on millions of companies and stakeholders worldwide, updated continuously."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ROI Calculator Preview */}
          <div className="bg-white rounded-[3rem] p-12 lg:p-16 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">
                  Calculate your potential ROI
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  See how much time and money your team can save by automating account research and outreach generation with Signalz.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    Average 10+ hours saved per rep, per week
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    3x increase in positive reply rates
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    40% reduction in sales cycle length
                  </li>
                </ul>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-lg">
                  Try the Calculator
                </button>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Number of Sales Reps</label>
                    <input type="range" min="1" max="100" defaultValue="10" className="w-full accent-blue-600" />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                      <span>1 Rep</span>
                      <span>100 Reps</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Estimated Annual Savings</p>
                    <p className="text-5xl font-display font-black text-emerald-600">$240,000+</p>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Based on 10 hours saved per week at $60/hr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Unrivaled Data Coverage
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Signalz aggregates and analyzes billions of data points across the web to provide the most comprehensive view of your target accounts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "First-Party Intent",
              desc: "Track anonymous website visitors, content downloads, and email engagement to see who is actively researching your solutions.",
              icon: Target
            },
            {
              title: "Third-Party Signals",
              desc: "Monitor topic surging across thousands of B2B publishers, forums, and review sites to catch buyers early in their journey.",
              icon: Globe
            },
            {
              title: "Firmographic Data",
              desc: "Access deep company profiles including revenue, employee count, technology stack, and recent funding rounds.",
              icon: BarChart3
            },
            {
              title: "Executive Moves",
              desc: "Get real-time alerts when key decision-makers change jobs, get promoted, or join your target accounts.",
              icon: Users
            }
          ].map((source, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <source.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{source.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{source.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Signalz leverages cutting-edge Large Language Models to automate the most time-consuming parts of your sales process.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "The 'Why Now' Engine",
              desc: "Our AI constantly scans news, earnings calls, and hiring trends to identify the exact moment an account is ready to buy. It synthesizes complex signals into a simple, actionable reason to reach out today.",
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-100"
            },
            {
              title: "Automated Stakeholder Mapping",
              desc: "Stop manually building org charts. Signalz automatically identifies the buying committee, maps reporting structures, and highlights the best path to power based on past successful deals.",
              icon: Users,
              color: "text-blue-500",
              bg: "bg-blue-100"
            },
            {
              title: "Hyper-Personalized Drafting",
              desc: "Generate highly relevant emails and LinkedIn messages in seconds. Our AI combines firmographic data, recent news, and the prospect's background to craft outreach that sounds human and converts.",
              icon: MessageSquare,
              color: "text-emerald-500",
              bg: "bg-emerald-100"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-6 tracking-tight">
              From cold list to closed-won in 4 steps
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Signalz automates the most time-consuming parts of the sales process, letting your team focus on building relationships and closing deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0"></div>

            {[
              {
                step: "01",
                title: "Identify Intent",
                desc: "We monitor billions of data points to find companies actively researching your solution, prioritizing your outreach.",
                icon: Target,
                color: "text-blue-600",
                bg: "bg-blue-100"
              },
              {
                step: "02",
                title: "Map the Committee",
                desc: "Signalz automatically builds the org chart, identifying decision-makers, champions, and potential blockers.",
                icon: Users,
                color: "text-indigo-600",
                bg: "bg-indigo-100"
              },
              {
                step: "03",
                title: "Generate Outreach",
                desc: "Our AI analyzes the prospect's background and company news to draft hyper-personalized, multi-channel sequences.",
                icon: Sparkles,
                color: "text-emerald-600",
                bg: "bg-emerald-100"
              },
              {
                step: "04",
                title: "Engage & Close",
                desc: "Review the drafts, hit send, and watch your reply rates soar. Spend your time on calls, not writing emails.",
                icon: Rocket,
                color: "text-amber-600",
                bg: "bg-amber-100"
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-full ${item.bg} border-4 border-white shadow-xl flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-10 h-10 ${item.color}`} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Built for modern revenue teams
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              See how different roles use Signalz to hit their targets and drive predictable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: "Account Executives",
                desc: "Stop wasting time on cold accounts. Focus your energy on prospects showing active buying intent and use AI to craft personalized outreach that books meetings.",
                benefits: ["Prioritize accounts by intent score", "Map complex buying committees", "Generate hyper-personalized emails"]
              },
              {
                role: "Sales Development (SDRs)",
                desc: "Hit your meeting quota faster. Signalz provides you with the exact trigger events and contact information needed to break into target accounts.",
                benefits: ["Real-time job change alerts", "Verified contact information", "Automated sequence drafting"]
              },
              {
                role: "Revenue Operations",
                desc: "Ensure your CRM data is always accurate and actionable. Signalz automatically enriches account records and routes high-intent signals to the right rep.",
                benefits: ["Automated CRM enrichment", "Lead routing based on intent", "Comprehensive ROI reporting"]
              }
            ].map((useCase, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{useCase.role}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{useCase.desc}</p>
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-700 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Loved by top-performing sales teams
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            See how Signalz is transforming the way modern revenue organizations operate.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Signalz completely changed our outbound motion. We're no longer guessing who to contact. The AI drafts save our reps 10+ hours a week.",
              author: "Sarah Jenkins",
              role: "VP of Sales, TechCorp",
              image: "https://picsum.photos/seed/user1/100/100"
            },
            {
              quote: "The stakeholder mapping feature alone is worth the price. We can navigate complex enterprise deals with so much more confidence now.",
              author: "Michael Chang",
              role: "Enterprise AE, CloudScale",
              image: "https://picsum.photos/seed/user2/100/100"
            },
            {
              quote: "Our reply rates jumped by 300% in the first month. The personalization at scale that Signalz provides is simply unmatched in the market.",
              author: "Elena Rodriguez",
              role: "Head of SDRs, GrowthInc",
              image: "https://picsum.photos/seed/user3/100/100"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="text-blue-500 mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 21L16.41 14.594C16.645 13.984 16.763 13.333 16.763 12.667V7.5H21.5V12.667C21.5 15.612 20.33 18.436 18.256 20.51L14.017 21ZM5.01697 21L7.40997 14.594C7.64497 13.984 7.76297 13.333 7.76297 12.667V7.5H12.5V12.667C12.5 15.612 11.33 18.436 9.25597 20.51L5.01697 21Z" />
                </svg>
              </div>
              <p className="text-slate-700 text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-lg">Everything you need to know about the product and billing.</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "How does the AI personalization work?",
                a: "Our system uses advanced Large Language Models (LLMs) combined with our proprietary database of company information, recent news, and intent signals. It analyzes the prospect's profile and company context to generate highly relevant, human-sounding outreach messages."
              },
              {
                q: "What CRM systems do you integrate with?",
                a: "Signalz natively integrates with Salesforce, HubSpot, Microsoft Dynamics, and Pipedrive. We also offer a robust API and Zapier integration for connecting with hundreds of other tools in your sales stack."
              },
              {
                q: "Where do you get your intent data?",
                a: "We aggregate data from multiple premium sources, including first-party website tracking (via our pixel), third-party content consumption networks, public web scraping for news and job postings, and proprietary partnerships."
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We are SOC2 Type II certified, GDPR compliant, and use enterprise-grade encryption for all data at rest and in transit. We never use your proprietary CRM data to train our public AI models."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-3">
                  <span className="text-blue-500 mt-1"><Search className="w-5 h-5" /></span>
                  {faq.q}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-8 relative z-10 tracking-tight">
            Ready to supercharge your sales pipeline?
          </h2>
          <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Join hundreds of high-performing sales teams using Signalz to identify, engage, and close their best opportunities faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={onGetStarted}
              className="inline-block px-10 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:bg-slate-50 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Start Your Free Trial
            </button>
            <button className="inline-block px-10 py-5 bg-blue-700 text-white rounded-full font-bold text-xl hover:bg-blue-800 transition-all border border-blue-500">
              Talk to Sales
            </button>
          </div>
          <p className="mt-8 text-blue-200 text-sm font-medium relative z-10">14-day free trial • Full feature access • No credit card required</p>
        </div>
      </section>
    </div>
  );
};

