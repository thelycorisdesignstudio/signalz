import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, SignalHigh, Loader2, Sparkles, LineChart } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onBack: () => void;
  onLogin?: (token: string, user: any) => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin, onSignUp, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      onLogin?.(data.token, data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first to receive a magic link');
      return;
    }
    setMagicLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send magic link');
        return;
      }
      if (data.magicLink) {
        const token = data.magicLink.split('/').pop();
        const verifyRes = await fetch(`/api/auth/verify-magic/${token}`);
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.token) {
          onLogin?.(verifyData.token, verifyData.user);
          return;
        }
      }
      setMagicSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-x-hidden bg-white text-slate-900 font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight">Signalz</span>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-black text-white leading-tight">
              Your AI-powered<br />sales intelligence<br />agent
            </h2>
            <p className="text-white/70 text-lg font-medium max-w-md">
              Find the right people, discover their emails, and draft personalized outreach — all from a single company search.
            </p>
            <div className="space-y-4">
              {[
                'Deep company intelligence in seconds',
                'Real email discovery with SMTP verification',
                'AI-drafted personalized outreach',
                'Org chart & relationship mapping',
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                  <span className="text-white/80 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-sm">
            Trusted by sales teams worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-[#f6f6f8]">
        <header className="flex items-center justify-between px-6 py-4 lg:px-10 lg:hidden">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <SignalHigh className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Signalz</h2>
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[420px] space-y-7"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Welcome back</h1>
              <p className="text-slate-500">Log in to your Signalz account to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {magicSent ? (
              <div className="text-center py-8 space-y-3">
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-black text-slate-900">Check your email</h3>
                <p className="text-slate-500">We sent a magic sign-in link to <strong>{email}</strong></p>
                <button onClick={() => setMagicSent(false)} className="text-sm text-primary font-bold hover:underline mt-2">
                  Try another method
                </button>
              </div>
            ) : (
              <>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="name@company.com"
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-semibold text-slate-700">Password</label>
                      <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-primary hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Enter your password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-widest text-slate-400">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={handleMagicLink}
                  disabled={magicLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all shadow-sm disabled:opacity-50"
                >
                  {magicLoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
                  {magicLoading ? 'Sending magic link...' : 'Sign in with Magic Link'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?
                  <button onClick={onSignUp} className="font-bold text-primary hover:underline decoration-2 underline-offset-4 ml-1">Sign up for free</button>
                </p>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
