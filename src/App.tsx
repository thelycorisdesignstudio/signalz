/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LineChart, 
  ArrowRight, 
  Zap, 
  Network, 
  Sparkles, 
  Globe, 
  Users, 
  Share2, 
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Linkedin,
  Building2,
  Briefcase,
  Activity,
  MessageSquare,
  Newspaper,
  MapPin,
  DollarSign,
  Handshake,
  Settings,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { LoginPage } from './components/LoginPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { DashboardPage } from './components/DashboardPage';
import { AccountBriefPage } from './components/AccountBriefPage';
import { MyProfilePage } from './components/MyProfilePage';
import { WatchlistPage } from './components/WatchlistPage';
import { GenericPage } from './components/GenericPage';
import { LandingPage } from './components/LandingPage';
import { AccountsPage } from './components/AccountsPage';
import { LeadsPage } from './components/LeadsPage';
import { SequencesPage } from './components/SequencesPage';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';

import { FeaturesPage } from './components/FeaturesPage';
import { SolutionsPage } from './components/SolutionsPage';
import { PricingPage } from './components/PricingPage';
import { ResourcesPage } from './components/ResourcesPage';

const Navbar = ({ onLogin, onGetStarted, onNavigate }: { onLogin: () => void, onGetStarted: () => void, onNavigate: (view: any) => void }) => (
  <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-primary/5">
      <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
          <LineChart className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-slate-900 text-xl font-black tracking-tight">Signalz</h2>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
          <button 
            key={item} 
            onClick={() => onNavigate(item.toLowerCase() as any)} 
            className="text-slate-600 hover:text-primary text-sm font-bold transition-all hover:scale-105"
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <button 
          onClick={onLogin}
          className="hidden sm:block text-slate-900 text-sm font-bold px-5 py-2 hover:bg-slate-100 rounded-full transition-all"
        >
          Login
        </button>
        <button 
          onClick={onGetStarted}
          className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-lg shadow-primary/20"
        >
          Get Started
        </button>
      </div>
    </div>
  </header>
);

const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
    </div>
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Signalz Intelligence
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tight text-slate-900 dark:text-slate-100"
        >
          Turn every <span className="text-primary">signal</span> into a <span className="font-serif">closed deal.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl"
        >
          Signalz identifies high-intent prospects in real-time, mapping stakeholders and generating personalized outreach that actually converts.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90 text-white text-lg font-bold px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group"
          >
            Start Your Free Trial 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-lg font-bold px-10 py-5 rounded-2xl transition-all border border-slate-200 dark:border-slate-800">
            Watch Demo
          </button>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-20 relative group"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="mx-auto bg-slate-200 dark:bg-slate-700 h-5 w-48 rounded-md"></div>
          </div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKTWBQCDCYEcTXaVyTnBxZY7THhVwTTA08NiXqZRqw4l1lQ3RxJGti1ao1ed88o3qjtWRQTTlCHri3RA5oRhfmZRQx_cJszlSOzcaGqm5j4RxGlNcFTZ3Q3TbKDAOOM4oj40NMCktsI4omwOv8u8Kan_4Rfm-F6ZoZF-PXSNXbnfF7zNBNHxPgugo3zrM6oajPKF9Va0uWfcrfm8CydRUg9v-A1U7LFn7gmc8ploW8r0JoJh_g-Ct9WHgrShcfMF8yR5-1avtB9z0" 
            alt="Dashboard showing sales data and AI analytics charts"
            className="w-full h-full object-cover aspect-[16/9]"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>
  </section>
);

const StorySection = () => (
  <section className="py-24 bg-slate-50 dark:bg-slate-950">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Visual Storytelling</h2>
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 leading-tight">
            Stop guessing. <br />Start <span className="text-primary underline decoration-primary/30 underline-offset-8">knowing.</span>
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Signalz analyzes millions of data points across the web to find the exact moment your prospects are ready to buy. We map the entire decision-making unit so you know exactly who to talk to and what to say.
          </p>
          <div className="space-y-6">
            {[
              { title: 'Identify High Intent', desc: 'Spot prospects researching your category before they even reach out.' },
              { title: 'Map Stakeholders', desc: 'Understand the hierarchy and influence within target accounts.' },
              { title: 'Automate Outreach', desc: 'Generate personalized messages that resonate with specific pain points.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl"></div>
          <div className="relative grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-2">Stakeholder Map</h4>
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 mt-8"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-2">Intent Scoring</h4>
              <div className="text-2xl font-black text-emerald-500">98%</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 -mt-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-2">Real-time Alerts</h4>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 mt-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-2">AI Outreach</h4>
              <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-12">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: 'Revenue Increase', value: '35%', trend: '+12%', color: 'text-emerald-500' },
          { label: 'Time Saved', value: '20h', trend: '/ week', color: 'text-slate-500' },
          { label: 'Data Accuracy', value: '99.9%', trend: 'Verified', color: 'text-primary' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center sm:items-start gap-2 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-slate-900 dark:text-slate-100 text-4xl font-black">{stat.value}</p>
              <p className={`${stat.color} text-sm font-bold flex items-center`}>
                {stat.trend.startsWith('+') && <TrendingUp className="w-3 h-3 mr-1" />}
                {stat.trend}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="container mx-auto px-4 md:px-10 lg:px-20 py-32">
    <div className="flex flex-col items-center text-center gap-4 mb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
      >
        Platform Capabilities
      </motion.div>
      <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 max-w-4xl leading-tight">
        Everything you need to <span className="text-primary">dominate</span> your market
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[
        { 
          icon: Zap, 
          title: 'Real-time Signals', 
          desc: 'Get notified the instant a prospect shows high buying intent or key company organizational changes occur. Never miss an opening.' 
        },
        { 
          icon: Network, 
          title: 'Stakeholder Mapping', 
          desc: 'Visualize the decision-making hierarchy and automatically identify the key champions and blockers in every account.' 
        },
        { 
          icon: Sparkles, 
          title: 'Personalized Outreach', 
          desc: 'Generate hyper-personalized messages based on deep behavioral data and insights that resonate with each specific prospect.' 
        }
      ].map((feature, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <feature.icon className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">{feature.title}</h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            {feature.desc}
          </p>
          <a href="#" className="mt-8 inline-flex items-center text-primary font-black text-sm group/link">
            Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      ))}
    </div>
  </section>
);

const CoreEngines = () => (
  <section className="bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 py-32">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-center text-center gap-4 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
        >
          Core Engines
        </motion.div>
        <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 max-w-4xl leading-tight">
          The intelligence powering your <span className="text-primary">revenue growth</span>
        </h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Our proprietary engines extract, analyze, and synthesize millions of data points to deliver actionable insights directly to your CRM.
        </p>
      </div>

      <div className="space-y-32">
        {/* Engine 1: LinkedIn Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative"
          >
            <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]">
                  <Linkedin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Executive Analysis</h4>
                  <p className="text-sm text-slate-500">Real-time profile tracking</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Briefcase, text: 'Extract executive profiles (name, role, tenure, history)' },
                  { icon: MessageSquare, text: 'Track recent posts, comments, and engagement' },
                  { icon: Activity, text: 'Detect role changes, promotions, job switches' },
                  { icon: Users, text: 'Identify activity frequency (active vs passive)' },
                  { icon: Network, text: 'Map topics they talk about (AI, cost optimization, etc.)' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-[#0A66C2]/5 border border-[#0A66C2]/20 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A66C2]"></div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  "CFO has posted twice about cost control → <span className="text-[#0A66C2] font-bold">strong financial efficiency angle</span>"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] text-sm font-bold">
              <Linkedin className="w-4 h-4" /> Engine 01
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              LinkedIn Intelligence Engine
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Understand exactly what your buyers care about right now. We monitor executive digital footprints to uncover their priorities, pain points, and career trajectories.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A66C2] shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Know when a champion moves to a new target account.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A66C2] shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Tailor your messaging based on their recent public comments.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0A66C2] shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Identify which stakeholders are most likely to engage.</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Engine 2: Company Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
              <Building2 className="w-4 h-4" /> Engine 02
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              Company Signal Engine
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Catch organizational shifts before they become public knowledge. We aggregate and analyze company-wide data to spot expansion, funding, and strategic pivots.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Time your outreach perfectly with funding announcements.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Spot new technology initiatives through hiring patterns.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Identify expansion into new markets indicating budget availability.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Macro Analysis</h4>
                  <p className="text-sm text-slate-500">Organizational intent signals</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Newspaper, text: 'News aggregation (last 30–90 days)' },
                  { icon: Globe, text: 'Press releases & media mentions' },
                  { icon: Users, text: 'Hiring trends (job postings analysis)' },
                  { icon: MapPin, text: 'Expansion signals (new offices, markets)' },
                  { icon: DollarSign, text: 'Funding / capital events' },
                  { icon: Handshake, text: 'Partnerships & contracts' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  "Company expanding in UAE → <span className="text-emerald-600 dark:text-emerald-400 font-bold">infrastructure + vendor opportunity</span>"
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-32 bg-white dark:bg-slate-900">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-center text-center gap-4 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
        >
          How It Works
        </motion.div>
        <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 max-w-4xl leading-tight">
          From signal to <span className="text-primary">closed won</span> in 3 steps
        </h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          We've simplified the complex process of B2B intelligence gathering into a seamless, automated workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"></div>
        
        {[
          {
            step: "01",
            title: "Connect & Configure",
            desc: "Sync your CRM and define your Ideal Customer Profile (ICP). Signalz automatically begins monitoring millions of data points across your target accounts.",
            icon: Settings
          },
          {
            step: "02",
            title: "Detect & Analyze",
            desc: "Our AI engines identify high-intent signals—from executive job changes to funding rounds—and score them based on your specific criteria.",
            icon: BrainCircuit
          },
          {
            step: "03",
            title: "Engage & Convert",
            desc: "Receive real-time alerts with hyper-personalized outreach templates, ready to send to the right stakeholder at the exact right moment.",
            icon: Zap
          }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="relative flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center relative z-10 mb-8 group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-0 group-hover:opacity-100"></div>
              <item.icon className="w-10 h-10 text-primary" />
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                {item.step}
              </div>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">{item.title}</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const UseCases = () => (
  <section className="py-32 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-center text-center gap-4 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
        >
          Use Cases
        </motion.div>
        <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 max-w-4xl leading-tight">
          Built for modern <span className="text-primary">revenue teams</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            role: "Account Executives",
            title: "Close bigger deals, faster.",
            desc: "Stop wasting time on cold outreach. Know exactly which accounts are in-market and who holds the budget. Use AI-generated account briefs to prep for meetings in seconds.",
            features: ["Real-time intent alerts", "Automated account research", "Stakeholder mapping"]
          },
          {
            role: "SDRs & BDRs",
            title: "Book more qualified meetings.",
            desc: "Personalize at scale. Let Signalz write hyper-relevant emails based on a prospect's recent LinkedIn activity or company news, dramatically increasing your reply rates.",
            features: ["AI-generated personalized emails", "Trigger-based outreach", "Contact discovery"]
          },
          {
            role: "Sales Leadership",
            title: "Increase pipeline predictability.",
            desc: "Get a bird's-eye view of your total addressable market's intent. Allocate resources to the accounts most likely to close this quarter.",
            features: ["Territory intent scoring", "Team activity tracking", "CRM integration"]
          },
          {
            role: "RevOps",
            title: "Clean, actionable data.",
            desc: "Ensure your CRM is always up-to-date with the latest contact information, job changes, and company firmographics without manual data entry.",
            features: ["Automated CRM enrichment", "Data decay prevention", "Custom signal routing"]
          }
        ].map((useCase, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-full mb-6">
              For {useCase.role}
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">{useCase.title}</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {useCase.desc}
            </p>
            <ul className="space-y-3">
              {useCase.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="container mx-auto px-4 md:px-10 lg:px-20 py-32">
    <div className="relative rounded-[3rem] bg-primary overflow-hidden px-8 py-20 md:p-24 text-center flex flex-col items-center gap-10">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
      
      <h2 className="text-4xl md:text-7xl font-black text-white relative z-10 leading-tight">
        Ready to transform your <br />sales pipeline?
      </h2>
      <p className="text-xl text-white/80 max-w-2xl font-medium relative z-10">
        Join 500+ high-growth companies using Signalz to identify intent and close complex deals faster.
      </p>
      <div className="flex flex-wrap justify-center gap-6 relative z-10">
        <button 
          onClick={onGetStarted}
          className="bg-white text-primary hover:bg-slate-100 text-xl font-black px-12 py-6 rounded-2xl shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95"
        >
          Start Free 14-Day Trial
        </button>
      </div>
    </div>
  </section>
);

const Footer = ({ onNavigate }: { onNavigate: (view: any) => void }) => (
  <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-24 pb-12">
    <div className="container mx-auto px-4 md:px-10 lg:px-20">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 text-primary mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="bg-primary p-1.5 rounded-lg">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-black">Signalz</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-xs mb-8 text-lg leading-relaxed">
            The industry's leading AI sales intelligence platform by Signalz for modern revenue teams.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-primary transition-all hover:scale-110"><Globe className="w-6 h-6" /></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-all hover:scale-110"><Users className="w-6 h-6" /></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-all hover:scale-110"><Share2 className="w-6 h-6" /></a>
          </div>
        </div>
        {[
          { title: 'Product', links: ['Intent Data', 'Lead Scoring', 'API Access', 'Integrations'] },
          { title: 'Company', links: ['About Us', 'Careers', 'Partners', 'Contact'] },
          { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'GDPR Compliance'] }
        ].map((col, i) => (
          <div key={i}>
            <h5 className="text-slate-900 dark:text-slate-100 font-black mb-8 uppercase tracking-widest text-sm">{col.title}</h5>
            <ul className="flex flex-col gap-5">
              {col.links.map((link) => (
                <li key={link}>
                  <button 
                    onClick={() => onNavigate(link.toLowerCase().replace(/\s+/g, '-'))}
                    className="text-slate-600 dark:text-slate-400 text-base hover:text-primary transition-colors font-medium text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-sm font-medium">© 2026 Signalz by Lycoris Labs. All rights reserved.</p>
        <div className="flex gap-10">
          <button onClick={() => onNavigate('status')} className="text-slate-500 text-sm hover:text-primary transition-colors font-medium">Status</button>
          <button onClick={() => onNavigate('cookies')} className="text-slate-500 text-sm hover:text-primary transition-colors font-medium">Cookies</button>
        </div>
      </div>
    </div>
  </footer>
);

import { ComingSoonPage } from './components/ComingSoonPage';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'profile-setup' | 'dashboard' | 'account-brief' | 'my-profile' | 'watchlist' | 'features' | 'solutions' | 'pricing' | 'resources' | 'intent-data' | 'lead-scoring' | 'api-access' | 'integrations' | 'about-us' | 'careers' | 'partners' | 'contact' | 'privacy-policy' | 'terms-of-service' | 'gdpr-compliance' | 'status' | 'cookies' | 'accounts' | 'leads' | 'sequences' | 'settings' | 'help'>('landing');
  const [selectedAccount, setSelectedAccount] = useState<string>('Aramco');

  const commonNavProps = {
    onNavigateDashboard: () => setView('dashboard'),
    onNavigateProfile: () => setView('my-profile'),
    onNavigateWatchlist: () => setView('watchlist'),
    onNavigateLeads: () => setView('leads'),
    onNavigateSequences: () => setView('sequences'),
    onNavigateSettings: () => setView('settings'),
    onNavigateHelp: () => setView('help'),
    onNavigateAccounts: () => setView('accounts'),
    onLogout: () => setView('landing')
  };

  if (view === 'login') {
    return <LoginPage onBack={() => setView('landing')} />;
  }

  if (view === 'profile-setup') {
    return <ProfileSetupPage onComplete={() => setView('dashboard')} onBack={() => setView('landing')} />;
  }

  if (view === 'dashboard') {
    return (
      <DashboardPage 
        {...commonNavProps}
        onSelectCompany={(name) => {
          setSelectedAccount(name);
          setView('account-brief');
        }}
      />
    );
  }

  if (view === 'features') {
    return <FeaturesPage onBack={() => setView('landing')} onGetStarted={() => setView('dashboard')} />;
  }

  if (view === 'solutions') {
    return <SolutionsPage onBack={() => setView('landing')} onGetStarted={() => setView('dashboard')} />;
  }

  if (view === 'pricing') {
    return <PricingPage onBack={() => setView('landing')} onGetStarted={() => setView('dashboard')} />;
  }

  if (view === 'resources') {
    return <ResourcesPage onBack={() => setView('landing')} onGetStarted={() => setView('dashboard')} />;
  }

  if (view === 'account-brief') {
    return (
      <AccountBriefPage 
        companyName={selectedAccount}
        onBack={() => setView('dashboard')} 
        {...commonNavProps}
      />
    );
  }

  if (view === 'my-profile') {
    return (
      <MyProfilePage 
        onBack={() => setView('dashboard')} 
        {...commonNavProps}
      />
    );
  }

  if (view === 'watchlist') {
    return (
      <WatchlistPage 
        {...commonNavProps}
      />
    );
  }

  if (view === 'accounts') {
    return <AccountsPage {...commonNavProps} />;
  }

  if (view === 'leads') {
    return <LeadsPage {...commonNavProps} />;
  }

  if (view === 'sequences') {
    return <SequencesPage {...commonNavProps} />;
  }

  if (view === 'settings') {
    return <SettingsPage {...commonNavProps} />;
  }

  if (view === 'help') {
    return <HelpPage {...commonNavProps} />;
  }

  if (view === 'intent-data') {
    return (
      <GenericPage 
        title="Intent Data" 
        content={
          <>
    <h2>The Science of Buyer Intent</h2>
    <p>In modern B2B sales, timing is everything. Signalz Intent Data eliminates the guesswork by providing you with a real-time, deterministic view of which accounts are actively researching your solutions across the web.</p>
    
    <h3>How We Source Intent</h3>
    <p>Unlike legacy providers that rely on stale IP-to-company mapping or broad topic clusters, Signalz utilizes a proprietary data co-op and direct integrations to capture high-fidelity signals. We monitor:</p>
    <ul>
      <li><strong>First-Party Engagement:</strong> Deep analysis of how prospects interact with your website, content, and emails.</li>
      <li><strong>Third-Party Research:</strong> Tracking consumption of relevant articles, whitepapers, and competitor comparisons across our publisher network.</li>
      <li><strong>Social Listening:</strong> Real-time monitoring of key executives and company pages for trigger events (e.g., funding, hiring surges, leadership changes).</li>
    </ul>

    <h3>Actionable Intelligence, Not Just Data</h3>
    <p>Raw data is overwhelming. Signalz translates millions of data points into a single, actionable <strong>Intent Score</strong> for every account. When an account crosses your custom threshold, your team receives an immediate alert with the specific context needed to craft a hyper-relevant outreach message.</p>
    
    <blockquote>"Signalz Intent Data helped us identify 40% more in-market accounts before they even requested a demo. It's completely transformed our outbound strategy." - VP of Sales, TechCorp</blockquote>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'lead-scoring') {
    return (
      <GenericPage 
        title="Lead Scoring" 
        content={
          <>
    <h2>Predictive Lead Scoring Engine</h2>
    <p>Stop treating every lead equally. Signalz's AI-powered Lead Scoring engine analyzes historical win/loss data to identify the exact attributes and behaviors that indicate a high propensity to buy.</p>
    
    <h3>Dynamic Scoring Models</h3>
    <p>Our machine learning models continuously learn and adapt to your unique sales cycle. We evaluate leads based on:</p>
    <ul>
      <li><strong>Firmographics:</strong> Company size, industry, revenue, and technology stack.</li>
      <li><strong>Demographics:</strong> Job title, seniority, and role within the buying committee.</li>
      <li><strong>Behavioral Signals:</strong> Website visits, email opens, webinar attendance, and content downloads.</li>
      <li><strong>Intent Surges:</strong> Spikes in relevant research activity across the web.</li>
    </ul>

    <h3>Prioritize with Precision</h3>
    <p>Your sales reps will start their day with a prioritized list of the hottest leads. No more sifting through CRMs or guessing who to call next. Signalz ensures your team focuses 100% of their effort on the prospects most likely to convert today.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'api-access') {
    return (
      <GenericPage 
        title="Api Access" 
        content={
          <>
    <h2>Signalz REST API</h2>
    <p>Build custom workflows, enrich your proprietary databases, and integrate Signalz intelligence directly into your core applications with our robust, developer-friendly REST API.</p>
    
    <h3>Capabilities</h3>
    <ul>
      <li><strong>Account Enrichment:</strong> Retrieve detailed firmographic data, technology stacks, and recent news for any company domain.</li>
      <li><strong>Contact Discovery:</strong> Find verified email addresses and phone numbers for key decision-makers.</li>
      <li><strong>Intent Streams:</strong> Stream real-time intent signals directly into your data warehouse or BI tools.</li>
      <li><strong>Webhooks:</strong> Set up real-time notifications for critical account events (e.g., funding rounds, leadership changes).</li>
    </ul>

    <h3>Developer Experience</h3>
    <p>We provide comprehensive documentation, interactive API explorers, and SDKs for popular languages (Python, Node.js, Go) to ensure a seamless integration process. Our dedicated developer support team is always available to help you build faster.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'integrations') {
    return (
      <GenericPage 
        title="Integrations" 
        content={
          <>
    <h2>Seamlessly Connect Your Revenue Stack</h2>
    <p>Signalz is designed to be the intelligence layer that powers your existing tools. We offer native, bi-directional integrations with the platforms your team uses every day.</p>
    
    <h3>CRM Integrations</h3>
    <p>Keep your CRM data clean, enriched, and actionable. Signalz automatically updates account records, creates new contacts, and logs intent signals directly within your CRM.</p>
    <ul>
      <li>Salesforce</li>
      <li>HubSpot</li>
      <li>Microsoft Dynamics 365</li>
    </ul>

    <h3>Sales Engagement</h3>
    <p>Trigger automated outreach sequences based on real-time intent signals. Signalz pushes highly personalized, AI-generated email drafts directly into your sales engagement platform.</p>
    <ul>
      <li>Outreach</li>
      <li>SalesLoft</li>
      <li>Apollo.io</li>
    </ul>

    <h3>Communication & Collaboration</h3>
    <p>Get real-time alerts where your team already works. Route high-priority intent signals to specific Slack channels or Microsoft Teams based on territory assignments.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'about-us') {
    return (
      <GenericPage 
        title="About Us" 
        content={
          <>
    <h2>Our Mission: Intelligence-Driven Revenue</h2>
    <p>At Signalz, we believe the era of "spray and pray" sales is over. Buyers are overwhelmed with generic outreach, and sales teams are burning out trying to hit quotas with outdated tactics. We built Signalz to fundamentally change how B2B companies go to market.</p>
    
    <h3>The Signalz Story</h3>
    <p>Founded in 2024 by a team of former sales leaders and AI researchers, Signalz was born out of frustration. We saw firsthand how much time reps wasted researching accounts and writing emails, only to get ignored. We realized that the key to modern sales isn't more activity—it's better intelligence.</p>
    
    <p>We set out to build a platform that acts as a "Palantir for Sales"—a system that ingests massive amounts of unstructured data, identifies the hidden patterns of buying intent, and serves up actionable insights directly to the rep.</p>

    <h3>Our Values</h3>
    <ul>
      <li><strong>Signal Over Noise:</strong> We prioritize accuracy and relevance over sheer volume of data.</li>
      <li><strong>Action-Oriented:</strong> Intelligence is useless if it doesn't lead to action. Every insight we provide comes with a clear next step.</li>
      <li><strong>Empower the Rep:</strong> We build tools that make sales professionals faster, smarter, and more successful.</li>
    </ul>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'careers') {
    return (
      <GenericPage 
        title="Careers" 
        content={
          <>
    <h2>Build the Future of Sales Intelligence</h2>
    <p>We are a fast-growing, remote-first team of engineers, data scientists, and go-to-market experts passionate about solving complex problems. If you want to build products that have a direct, measurable impact on how companies grow, Signalz is the place for you.</p>
    
    <h3>Why Join Signalz?</h3>
    <ul>
      <li><strong>Hard Problems:</strong> We are tackling massive data engineering and machine learning challenges to process billions of signals in real-time.</li>
      <li><strong>Impact:</strong> Our product directly drives revenue for our customers. You will see the results of your work immediately.</li>
      <li><strong>Culture:</strong> We value autonomy, continuous learning, and a healthy work-life balance.</li>
    </ul>

    <h3>Open Roles</h3>
    <div className="not-prose mt-8 space-y-4">
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary transition-colors cursor-pointer">
        <h4 className="text-xl font-bold mb-2">Senior Machine Learning Engineer</h4>
        <p className="text-slate-500 mb-4">Remote (US/Canada) • Full-time</p>
        <p className="text-sm">Help us build the next generation of our predictive intent models using LLMs and graph neural networks.</p>
      </div>
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary transition-colors cursor-pointer">
        <h4 className="text-xl font-bold mb-2">Enterprise Account Executive</h4>
        <p className="text-slate-500 mb-4">Remote (US) • Full-time</p>
        <p className="text-sm">Drive revenue growth by selling the Signalz platform to VP and C-level revenue leaders at mid-market and enterprise companies.</p>
      </div>
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary transition-colors cursor-pointer">
        <h4 className="text-xl font-bold mb-2">Senior Frontend Engineer (React)</h4>
        <p className="text-slate-500 mb-4">Remote (Europe) • Full-time</p>
        <p className="text-sm">Lead the development of our core web application, focusing on performance, data visualization, and user experience.</p>
      </div>
    </div>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'partners') {
    return (
      <GenericPage 
        title="Partners" 
        content={
          <>
    <h2>The Signalz Partner Ecosystem</h2>
    <p>We believe in the power of collaboration. The Signalz Partner Program is designed to help agencies, consultants, and technology providers deliver more value to their clients and grow their own businesses.</p>
    
    <h3>Types of Partnerships</h3>
    <ul>
      <li><strong>Solution Partners:</strong> For sales consultancies, RevOps agencies, and marketing firms who want to implement and manage Signalz for their clients. Earn recurring revenue share and access exclusive co-marketing opportunities.</li>
      <li><strong>Technology Partners:</strong> For software vendors who want to integrate their platforms with Signalz. Build native integrations to enhance your product's capabilities with our intent data and intelligence.</li>
      <li><strong>Referral Partners:</strong> For individuals and businesses who want to refer clients to Signalz and earn a commission on closed deals.</li>
    </ul>

    <h3>Partner Benefits</h3>
    <p>As a Signalz partner, you gain access to dedicated partner managers, comprehensive training and certification programs, priority technical support, and a robust portal for managing your referrals and integrations.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'contact') {
    return (
      <GenericPage 
        title="Contact" 
        content={
          <>
    <h2>Contact Our Team</h2>
    <p>Whether you're interested in a demo, need technical support, or have a partnership inquiry, we're here to help.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <h3 className="text-xl font-bold mb-4 mt-0">Sales & Demos</h3>
        <p>Ready to see Signalz in action? Our team will walk you through the platform and discuss how we can help you hit your revenue goals.</p>
        <p className="font-bold text-primary">sales@transputec.com</p>
      </div>
      <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <h3 className="text-xl font-bold mb-4 mt-0">Customer Support</h3>
        <p>Current customer needing assistance? Our support team is available 24/7 to help you with any technical issues or product questions.</p>
        <p className="font-bold text-primary">support@transputec.com</p>
      </div>
    </div>

    <h3 className="mt-12">Global Headquarters</h3>
    <p>Signalz Inc.<br/>
    100 Innovation Way, Suite 400<br/>
    San Francisco, CA 94105<br/>
    United States</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'privacy-policy') {
    return (
      <GenericPage 
        title="Privacy Policy" 
        content={
          <>
    <h2>Privacy Policy</h2>
    <p className="text-sm text-slate-500">Effective Date: March 17, 2026</p>
    
    <p>Signalz Inc. ("Signalz," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This comprehensive Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website (the "Site") and use our Signalz sales intelligence platform, APIs, and related services (collectively, the "Services").</p>
    
    <h3>1. Information We Collect</h3>
    <p>We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information").</p>
    
    <h4>A. Information You Provide to Us</h4>
    <ul>
      <li><strong>Account Information:</strong> When you register for an account, we collect your first and last name, email address, phone number, company name, job title, and a secure password.</li>
      <li><strong>Payment Information:</strong> If you purchase a subscription, our third-party payment processors (e.g., Stripe) collect your billing address and payment card details. We do not store full credit card numbers on our servers.</li>
      <li><strong>Communications:</strong> When you contact us for support, request a demo, or participate in surveys, we collect the contents of those communications, including any attachments.</li>
      <li><strong>User-Generated Content:</strong> Information you upload, such as CRM data, custom templates, or notes, is securely stored to provide the Services.</li>
    </ul>

    <h4>B. Information We Collect Automatically</h4>
    <ul>
      <li><strong>Usage Data:</strong> We collect details of your access to and use of the Services, including traffic data, location data, logs, feature usage, clickstream data, and other communication data and the resources that you access and use on or through the Services.</li>
      <li><strong>Device Information:</strong> We collect information about your computer and internet connection, including your IP address, operating system, browser type, screen resolution, and device identifiers.</li>
      <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and other tracking technologies to collect information about your browsing activities over time and across third-party websites.</li>
    </ul>

    <h4>C. Information We Collect from Third Parties</h4>
    <p>To provide our core sales intelligence services, we collect professional information from publicly available sources, data brokers, and our partners. This may include names, job titles, business contact information, professional history, social media profiles (e.g., LinkedIn), and company firmographics.</p>

    <h3>2. How We Use Your Information</h3>
    <p>We use the information we collect for various business purposes, including to:</p>
    <ul>
      <li>Provide, maintain, and improve our Services, including training our AI models (only using aggregated/anonymized data unless explicitly opted-in).</li>
      <li>Process transactions and send related information, including confirmations and invoices.</li>
      <li>Send technical notices, updates, security alerts, and support and administrative messages.</li>
      <li>Respond to your comments, questions, and requests, and provide customer service.</li>
      <li>Communicate with you about products, services, offers, promotions, and events offered by Signalz.</li>
      <li>Monitor and analyze trends, usage, and activities in connection with our Services to optimize user experience.</li>
      <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of Signalz and others.</li>
      <li>Comply with legal obligations and enforce our Terms of Service.</li>
    </ul>

    <h3>3. Sharing of Your Information</h3>
    <p>We may share your personal information in the following situations:</p>
    <ul>
      <li><strong>With Service Providers:</strong> We share information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processing, data analysis, email delivery, hosting services like AWS or Google Cloud).</li>
      <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
      <li><strong>To Comply with Laws:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
      <li><strong>To Protect Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities.</li>
    </ul>

    <h3>4. Data Security and Retention</h3>
    <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process, including encryption in transit (TLS) and at rest (AES-256). However, please also remember that we cannot guarantee that the internet itself is 100% secure. We retain personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

    <h3>5. Your Privacy Rights</h3>
    <p>Depending on your location (e.g., California, EEA, UK), you may have certain rights regarding your personal information, such as the right to access, correct, update, or request deletion of your data, as well as the right to opt-out of the sale of personal information. To exercise these rights, please contact us at privacy@transputec.com.</p>

    <h3>6. Changes to This Privacy Policy</h3>
    <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Effective Date" and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'terms-of-service') {
    return (
      <GenericPage 
        title="Terms Of Service" 
        content={
          <>
    <h2>Terms of Service</h2>
    <p className="text-sm text-slate-500">Effective Date: March 17, 2026</p>
    
    <p>Welcome to Signalz, a service provided by Signalz Inc. ("Signalz", "we", "us", or "our"). Please read these comprehensive Terms of Service ("Terms") carefully, as they govern your access to and use of the Signalz platform, website, APIs, and related services (collectively, the "Services").</p>

    <h3>1. Acceptance of Terms</h3>
    <p>By accessing or using our Services, you agree to be bound by these Terms, our Privacy Policy, and any other policies referenced herein. If you do not agree to these Terms, you may not access or use the Services. If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>

    <h3>2. Description of Service</h3>
    <p>Signalz is an advanced B2B sales intelligence platform that provides data, insights, AI-driven content generation, and workflow automation tools to assist sales professionals in identifying and engaging with prospective customers. We reserve the right to modify, suspend, or discontinue the Services (or any part thereof) at any time, with or without notice.</p>

    <h3>3. Account Registration and Security</h3>
    <p>To access certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

    <h3>4. Acceptable Use Policy</h3>
    <p>You agree not to use the Services to:</p>
    <ul>
      <li>Violate any applicable local, state, national, or international law, regulation, or industry standard (including, but not limited to, the CAN-SPAM Act, GDPR, CCPA, and telemarketing laws).</li>
      <li>Infringe upon the intellectual property rights, privacy rights, or publicity rights of any third party.</li>
      <li>Transmit any viruses, malware, trojan horses, or other malicious code.</li>
      <li>Attempt to gain unauthorized access to the Services, other user accounts, or our computer systems or networks.</li>
      <li>Scrape, crawl, or use automated means to extract data from the Services without our express written permission.</li>
      <li>Resell, sublicense, distribute, or frame the data provided by the Services to third parties, except as expressly permitted by a separate enterprise agreement with Signalz.</li>
      <li>Use the Services to generate spam, unsolicited communications, or harassing messages.</li>
    </ul>

    <h3>5. Intellectual Property</h3>
    <p>The Services, including all content, software, algorithms, AI models, UI/UX design, and data models, are the exclusive property of Signalz and its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal business purposes, subject strictly to these Terms.</p>

    <h3>6. User Content and Data</h3>
    <p>You retain all rights to the data and content you upload to the Services ("User Content"). By uploading User Content, you grant Signalz a worldwide, non-exclusive, royalty-free license to use, reproduce, and process the User Content solely for the purpose of providing and improving the Services. You represent that you have all necessary rights to upload such User Content.</p>

    <h3>7. Fees, Payment, and Cancellation</h3>
    <p>Access to premium features requires payment of subscription fees. All fees are billed in advance and are non-refundable unless otherwise stated in writing or required by law. We reserve the right to change our pricing upon 30 days' notice to you. You may cancel your subscription at any time, but no refunds will be issued for partial billing periods.</p>

    <h3>8. Disclaimer of Warranties</h3>
    <p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TRANSPUTEC DISCLAIMS ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE DATA PROVIDED THROUGH THE SERVICES IS ACCURATE, COMPLETE, ERROR-FREE, OR UP-TO-DATE. YOUR USE OF THE SERVICES IS AT YOUR OWN RISK.</p>

    <h3>9. Limitation of Liability</h3>
    <p>IN NO EVENT SHALL TRANSPUTEC, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; OR (III) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>

    <h3>10. Governing Law and Dispute Resolution</h3>
    <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be resolved through binding arbitration in San Francisco, California, except for claims relating to intellectual property infringement.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'gdpr-compliance') {
    return (
      <GenericPage 
        title="GDPR Compliance" 
        content={
          <>
    <h2>GDPR Compliance Statement</h2>
    <p>Signalz Inc. is deeply committed to data privacy and security. We recognize the critical importance of the General Data Protection Regulation (GDPR) and have implemented comprehensive, enterprise-grade measures to ensure full compliance for our European users and customers.</p>
    
    <h3>Our Role as a Data Processor and Controller</h3>
    <p>Under the GDPR framework, Signalz acts in dual capacities:</p>
    <ul>
      <li><strong>Data Controller:</strong> When managing our own customer relationships, billing information, and employee data, we determine the purposes and means of processing.</li>
      <li><strong>Data Processor:</strong> When processing data on behalf of our customers using the Signalz platform (e.g., when you upload your CRM data or use our outreach tools), we act strictly upon your documented instructions.</li>
    </ul>

    <h3>Key GDPR Principles We Adhere To</h3>
    <ul>
      <li><strong>Lawfulness, Fairness, and Transparency:</strong> We process personal data lawfully, fairly, and in a transparent manner. Our Privacy Policy clearly outlines what data we collect, how it is used, and the legal basis for processing.</li>
      <li><strong>Purpose Limitation:</strong> We collect data for specified, explicit, and legitimate purposes and do not further process it in a manner incompatible with those purposes.</li>
      <li><strong>Data Minimization:</strong> We ensure that personal data is adequate, relevant, and limited to what is strictly necessary in relation to the purposes for which it is processed.</li>
      <li><strong>Accuracy:</strong> We take reasonable steps to ensure that personal data is accurate and kept up to date, providing tools for users to rectify inaccuracies.</li>
      <li><strong>Storage Limitation:</strong> We keep personal data in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed.</li>
      <li><strong>Integrity and Confidentiality:</strong> We process personal data in a manner that ensures appropriate security, including protection against unauthorized or unlawful processing and against accidental loss, destruction, or damage, using appropriate technical or organizational measures (e.g., end-to-end encryption).</li>
    </ul>

    <h3>Data Subject Rights</h3>
    <p>We fully support and facilitate the rights of individuals under the GDPR, including:</p>
    <ul>
      <li><strong>The right to be informed:</strong> Clear privacy notices.</li>
      <li><strong>The right of access:</strong> Users can request copies of their personal data.</li>
      <li><strong>The right to rectification:</strong> Users can correct inaccurate data.</li>
      <li><strong>The right to erasure ("right to be forgotten"):</strong> Users can request deletion of their data under certain circumstances.</li>
      <li><strong>The right to restrict processing:</strong> Users can limit how we use their data.</li>
      <li><strong>The right to data portability:</strong> Users can obtain and reuse their data across different services.</li>
      <li><strong>The right to object:</strong> Users can object to processing based on legitimate interests or direct marketing.</li>
      <li><strong>Rights in relation to automated decision making and profiling:</strong> Safeguards against solely automated decisions with legal effects.</li>
    </ul>
    <p>To exercise any of these rights, please contact our Data Protection Officer at dpo@transputec.com. We respond to all requests within 30 days.</p>

    <h3>Data Transfers and Sub-processors</h3>
    <p>When transferring personal data outside of the European Economic Area (EEA), we rely on approved data transfer mechanisms, such as the latest Standard Contractual Clauses (SCCs) approved by the European Commission, to ensure that the data remains protected to European standards. We maintain a strict list of vetted sub-processors, available upon request, and ensure they are bound by the same stringent data protection obligations.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'status') {
    return (
      <GenericPage 
        title="System Status" 
        content={
          <>
    <h2>System Status & Uptime</h2>
    <div className="not-prose mt-8">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-8 flex items-center gap-4 shadow-sm">
        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <div>
          <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 m-0">All Systems Operational</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Last updated: Just now</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">Web Application</span>
            <span className="text-sm text-slate-500">Dashboard, UI, and user portal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">Operational</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">REST API</span>
            <span className="text-sm text-slate-500">External API endpoints and webhooks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">Operational</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">AI Processing Engine</span>
            <span className="text-sm text-slate-500">LLM inference and content generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">Operational</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">Data Pipeline & Intent Signals</span>
            <span className="text-sm text-slate-500">Real-time data ingestion and processing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">Operational</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Uptime History (Last 90 Days)</h3>
        <div className="flex items-center gap-1 h-12 mb-2">
          {Array.from({ length: 90 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-emerald-500 rounded-sm h-full hover:opacity-80 transition-opacity cursor-pointer"
              title={`Day ${90 - i}: 100% Uptime`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-slate-500 font-medium">
          <span>90 days ago</span>
          <span>99.99% Uptime</span>
          <span>Today</span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-white">Past Incidents</h3>
      <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
        <p className="text-slate-500 text-lg">No incidents reported in the last 90 days.</p>
      </div>
    </div>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'cookies') {
    return (
      <GenericPage 
        title="Cookie Policy" 
        content={
          <>
    <h2>Cookie Policy</h2>
    <p className="text-sm text-slate-500">Effective Date: March 17, 2026</p>
    
    <p>This comprehensive Cookie Policy explains how Signalz Inc. ("we", "us", or "our") uses cookies and similar tracking technologies to recognize you when you visit our website and use the Signalz platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

    <h3>What are cookies?</h3>
    <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information. Cookies set by the website owner (in this case, Signalz) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".</p>

    <h3>Why do we use cookies?</h3>
    <p>We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website and platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our properties. Third parties serve cookies through our website for advertising, analytics, and other purposes.</p>

    <h3>Types of Cookies We Use</h3>
    <ul>
      <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website to you, you cannot refuse them.</li>
      <li><strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable or you would be required to enter your login details every time you visit the website.</li>
      <li><strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you. We use tools like Google Analytics to understand user behavior.</li>
      <li><strong>Advertising Cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</li>
    </ul>

    <h3>Other Tracking Technologies</h3>
    <p>We and our third-party partners may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enable us to recognize when someone has visited our website or opened an email that we have sent them. This allows us, for example, to monitor the traffic patterns of users from one page within our website to another, to deliver or communicate with cookies, to understand whether you have come to our website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns.</p>

    <h3>How can I control cookies?</h3>
    <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in our Cookie Consent Manager, which appears upon your first visit to our site. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.</p>
    
    <p>You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.</p>
  </>
        }
        onBack={() => setView('landing')} 
      />
    );
  }


  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 selection:bg-primary/20">
      <Navbar onLogin={() => setView('login')} onGetStarted={() => setView('dashboard')} onNavigate={(v) => setView(v)} />
      <main>
        <LandingPage onGetStarted={() => setView('dashboard')} onNavigate={(v) => setView(v)} />
      </main>
      <Footer onNavigate={(v) => setView(v)} />
    </div>
  );
}
