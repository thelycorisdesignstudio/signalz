import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Building2, SignalHigh, Loader2, CheckCircle2, LineChart } from 'lucide-react';
import { motion } from 'motion/react';

interface SignUpPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSignUp: (token: string, user: any) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onBack, onLogin, onSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      onSignUp(data.token, data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-400'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

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
              Start closing<br />smarter, not<br />harder
            </h2>
            <p className="text-white/70 text-lg font-medium max-w-md">
              Join thousands of sales professionals using AI to discover leads, find emails, and craft perfect outreach.
            </p>
            <div className="space-y-4">
              {[
                'Free to get started — no credit card',
                'Research unlimited companies',
                'Find verified email addresses',
                'AI-generated personalized outreach',
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-white/60" />
                  <span className="text-white/80 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-sm">
            Set up in under 2 minutes
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
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
            className="w-full max-w-[420px] space-y-6"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Create your account</h1>
              <p className="text-slate-500">Start discovering sales intelligence in minutes</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="John Smith"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Min. 6 characters"
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
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{strengthLabels[passwordStrength]}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Company <span className="text-slate-400">(optional)</span></label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Acme Corp"
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="w-full rounded-xl bg-primary hover:bg-primary/90 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                type="submit"
                disabled={loading || !email || !password}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Already have an account?
              <button onClick={onLogin} className="font-bold text-primary hover:underline decoration-2 underline-offset-4 ml-1">Sign in</button>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
