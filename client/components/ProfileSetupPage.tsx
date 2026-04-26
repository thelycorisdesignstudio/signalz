import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  SignalHigh 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSetupPageProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ onComplete, onBack }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
              <SignalHigh className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight">Signalz</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intelligence Platform</p>
            </div>
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
            <Users className="w-5 h-5" />
            <span>Connections</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </a>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-200 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500 outline-none" 
              placeholder="Search..." 
              type="text"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto"
        >
          <header className="mb-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Profile Setup</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">Connect your professional identity to get started with Signalz Intelligence.</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Options */}
            <div className="lg:col-span-7 space-y-6">
              {/* LinkedIn Sync Section */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-lg">Sync LinkedIn Profile</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Import your professional experience, skills, and network automatically to personalize your intelligence feeds.</p>
                    <button className="bg-[#0077b5] hover:bg-[#006396] text-white px-6 py-2.5 rounded font-medium flex items-center gap-2 transition-colors">
                      <span>Sync Now</span>
                    </button>
                  </div>
                  <div className="md:w-48 bg-slate-200 dark:bg-slate-800 min-h-[120px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary to-blue-400"></div>
                    <SignalHigh className="w-12 h-12 text-slate-400 dark:text-slate-600 relative z-10" />
                  </div>
                </div>
              </div>

              {/* SSO Section */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 px-1">Single Sign-On</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                    <img 
                      alt="Google" 
                      className="w-5 h-5" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD64ydC4DaJZs-EV2pbg8GA9S39DVfFzLyf7Km-iD3a7O0N8WWqedAgWChZ_z3ERLmAR3QpTSy1eV04NSQMO3MOEmXd1DhBZeKAjBRVOl0PI-vn0GsATx-7frXy03VGuOq7t13UTnKoDJdUhOv0ABjB-yzUZ0XLpSJigUqUCQyukGqBOAo4towSvzbkwW77Q67369DP_8GlqwDD5184emxGxTfDFcT8zPUwYOoBdO3ZIwekShhXjYTr2bD66r-0HfBDmQ52afPnf-o"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-medium">Continue with Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                    <img 
                      alt="Microsoft" 
                      className="w-5 h-5" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxzY5-LIqGB2SYjdJSOyGLpiVaGdX4trHc7jw6zgYT9l1pxWdoVBb2pyuBjtofB5c7HeIVLtW9HSrgGriZSTsMGXFhGuIxDfIyb63kIj7PNEjRBm5ZD19JuS25419-EuQ8WpLHP4x7YmbIVi1Yerw7DE7zKVF-UMeJINqNzej5LIgH4piWeEWeJKsE7WGbxdq3Xsv34SMYpydCB23mtl8rwAdIi4qn-OH13yGtJDGWr6_uLieScicpVSIA3m6v9jcRHEuKT9MkGP4"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-medium">Sign in with Microsoft</span>
                  </button>
                </div>
              </section>

              {/* Manual Account Section */}
              <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 px-1">Create Account with Email</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onComplete(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase px-1">First Name</label>
                      <input className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-slate-100" placeholder="Jane" type="text" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase px-1">Last Name</label>
                      <input className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-slate-100" placeholder="Doe" type="text" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase px-1">Email Address</label>
                    <input className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-slate-100" placeholder="jane@company.com" type="email" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase px-1">Password</label>
                    <input className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-slate-100" placeholder="••••••••" type="password" required />
                  </div>
                  <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all mt-4" type="submit">
                    Complete Profile Setup
                  </button>
                </form>
              </section>
            </div>

            {/* Right Column Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-8 space-y-6">
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Why sync your profile?
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Personalized market intelligence tailored to your industry expertise.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Identify high-value connections within your professional network automatically.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Skip manual data entry and get started with a pre-filled workspace.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="font-bold mb-2">Privacy & Security</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    We use enterprise-grade encryption. Signalz will never post to your social accounts without permission.
                  </p>
                  <a className="inline-block mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline" href="#">Read Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

