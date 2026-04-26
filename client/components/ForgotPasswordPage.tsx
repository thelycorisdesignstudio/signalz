import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, SignalHigh, Loader2, CheckCircle2, ArrowLeft, Sparkles, LineChart, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onLogin: () => void;
  onResetComplete: (token: string, user: any) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack, onLogin, onResetComplete }) => {
  const [step, setStep] = useState<'email' | 'magic-sent' | 'reset-form'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
        return;
      }
      if (data.resetLink) {
        const token = data.resetLink.split('/').pop();
        setResetToken(token);
      }
      setStep('reset-form');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
        return;
      }
      if (data.magicLink) {
        const token = data.magicLink.split('/').pop();
        const verifyRes = await fetch(`/api/auth/verify-magic/${token}`);
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.token) {
          onResetComplete(verifyData.token, verifyData.user);
          return;
        }
      }
      setStep('magic-sent');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !resetToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        return;
      }
      onResetComplete(data.token, data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white/80" />
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Account<br />recovery
            </h2>
            <p className="text-white/70 text-lg font-medium max-w-md">
              Don't worry — we'll help you get back to your sales intelligence dashboard in no time.
            </p>
          </div>

          <p className="text-white/40 text-sm">
            Your data is always secure with us
          </p>
        </div>
      </div>

      {/* Right Side - Recovery Form */}
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
            {step === 'email' && (
              <>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Reset password</h1>
                  <p className="text-slate-500">Enter your email and we'll help you get back in</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleForgotPassword}>
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

                  <button
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={loading || !email}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-widest text-slate-400">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-base font-bold text-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  Sign in with Magic Link
                </button>

                <p className="text-center">
                  <button onClick={onLogin} className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-4 flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </button>
                </p>
              </>
            )}

            {step === 'magic-sent' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Check your email</h1>
                <p className="text-slate-500">We sent a magic sign-in link to <strong>{email}</strong>.</p>
                <p className="text-sm text-slate-400">Click the link in your email to sign in instantly.</p>
                <button onClick={onLogin} className="text-sm font-bold text-primary hover:underline mt-4">
                  Back to login
                </button>
              </div>
            )}

            {step === 'reset-form' && (
              <>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Set new password</h1>
                  <p className="text-slate-500">Choose a strong password for your account</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Min. 6 characters"
                        required
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
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
                    disabled={loading || !newPassword}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
