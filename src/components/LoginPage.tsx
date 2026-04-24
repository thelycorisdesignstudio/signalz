import React, { useState } from 'react';
import { Mail, Lock, Eye, LayoutGrid, SignalHigh } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-[#f6f6f8] text-slate-900 selection:bg-primary/30 font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-[#f6f6f8] to-[#f6f6f8]"></div>
      
      <div className="relative z-10 flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:px-10">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <SignalHigh className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Signalz</h2>
          </button>
          <div>
            <a className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" href="#">Help & Support</a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[440px] space-y-8"
          >
            {/* Welcome Section */}
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Welcome back</h1>
              <p className="text-slate-500">Log in to your Signalz account to continue</p>
            </div>

            {/* SSO Options */}
            <div className="space-y-3">
              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all shadow-sm">
                <img 
                  alt="Google Logo" 
                  className="h-5 w-5" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAHdEMdrd8I5aHJQuk3UlV6XmuDCJIYSQelhTCyFjgUHnFSq0hB8W3FJ9mAeIOfj-2wxLOx4TgBvUxkmesUtZp0J9o7yd8mzCWh6IxFjdMerLXRUNUuMi3hZHwhoJAB0TKZxNj0c1xNio3SzpsLkdbVZSPXtT9JT2WoSOxSYE3YxgnfqnnjkfwxekYBMICYPTkbYQNCE9lyGqCMg1n7B2QDIH8b7dC_8L2kxunKIi0_LwCzR_DnPNqwGDh4bgTqTZyaKIspZdJT2g"
                  referrerPolicy="no-referrer"
                />
                <span>Continue with Google</span>
              </button>
              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all shadow-sm">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                <span>Sign in with Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-widest text-slate-400">OR</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Email Login Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    placeholder="name@company.com" 
                    required 
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button className="w-full rounded-lg bg-primary hover:bg-primary/90 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" type="submit">
                Sign In
              </button>
            </form>

            {/* Sign Up Footer */}
            <p className="text-center text-sm text-slate-500">
              Don't have an account? 
              <a className="font-bold text-primary hover:underline decoration-2 underline-offset-4 ml-1" href="#">Sign up for free</a>
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="mt-auto px-10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <a className="hover:text-slate-600 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-slate-600 transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-slate-600 transition-colors" href="#">Cookie Policy</a>
            </div>
            <div>
              © 2026 Signalz Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
