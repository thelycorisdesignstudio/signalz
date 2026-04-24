import React from 'react';
import { 
 LayoutDashboard, 
 Building2, 
 Users, 
 Mail, 
 Brain, 
 Settings, 
 ArrowLeft, 
 Search, 
 Bell, 
 Info,
 Sparkles, 
 Newspaper, 
 CreditCard, 
 UserPlus, 
 Rocket, 
 Zap, 
 TrendingUp,
 TrendingDown, 
 Shield, 
 AlertTriangle, 
 TimerOff, 
 FileEdit, 
 Bold, 
 Italic, 
 Link as LinkIcon, 
 Wand2, 
 Network, 
 CheckCircle2, 
 MessageSquare, 
 Share2, 
 Eye, 
 Rss,
 SignalHigh,
 LogOut,
 Linkedin,
 Star,
 UserCircle,
 Loader2,
 Globe,
 Cpu,
 Copy,
 Database,
 ExternalLink,
 X,
 Clock,
 Target,
 Crosshair,
 Swords,
 Scale,
 DollarSign,
 Activity,
 ActivitySquare,
 LineChart,
 PieChart,
 Bot,
 Lightbulb,
 Flame,
 MessageCircle,
 Mic,
 CalendarClock,
 Compass,
 ArrowRight,
 Maximize,
 ShieldAlert,
 Gamepad2,
 User,
 Play,
 Plus,
 Trash2,
 Calendar,
 Layers,
 BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { OrgChart } from './OrgChart';
import { RelationshipChart } from './RelationshipChart';

import { getAccountIntelligence, generateLinkedInMessage, generateEmailDraft, generateSequenceStepContent, generateEmailTemplates } from '../services/ai';

// Live stock ticker for AccountBriefPage
const ABStockTicker: React.FC<{ companyName: string }> = ({ companyName }) => {
 const [stock, setStock] = React.useState<any>(null);
 const symbolMap: Record<string, string> = {
   'google': 'GOOG', 'alphabet': 'GOOG', 'apple': 'AAPL', 'microsoft': 'MSFT',
   'amazon': 'AMZN', 'meta': 'META', 'tesla': 'TSLA', 'nvidia': 'NVDA',
   'netflix': 'NFLX', 'salesforce': 'CRM', 'oracle': 'ORCL', 'ibm': 'IBM',
   'intel': 'INTC', 'amd': 'AMD', 'uber': 'UBER', 'airbnb': 'ABNB',
   'shopify': 'SHOP', 'spotify': 'SPOT', 'snap': 'SNAP',
 };
 React.useEffect(() => {
   const sym = Object.entries(symbolMap).find(([k]) => companyName.toLowerCase().includes(k))?.[1];
   if (!sym) return;
   fetch('/api/stock/' + sym).then(r => r.json()).then(d => { if (!d.error) setStock(d); }).catch(() => {});
 }, [companyName]);
 if (!stock) return null;
 const up = stock.change >= 0;
 return (
   <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f6f6f8] rounded-xl">
     <span className="text-xs font-black text-slate-400">{stock.symbol}</span>
     <span className="text-sm font-black text-[#1D1D1F]">${stock.price?.toFixed(2)}</span>
     <span className={"text-xs font-black flex items-center gap-0.5 " + (up ? "text-green-600" : "text-red-500")}>
       {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
       {up ? '+' : ''}{stock.change?.toFixed(2)}%
     </span>
   </div>
 );
};

// Company logo
const ABCompanyLogo: React.FC<{ website?: string; name: string }> = ({ website, name }) => {
 const [err, setErr] = React.useState(false);
 const domain = website?.replace(/^https?:\/\//, '').split('/')[0] || '';
 const initials = name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
 if (!domain || err) {
   return (
     <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] font-black text-sm">
       {initials}
     </div>
   );
 }
 return (
   <img src={"https://www.google.com/s2/favicons?domain=" + domain + "&sz=128"} alt={name}
     className="w-12 h-12 rounded-2xl object-contain bg-white"
     onError={() => setErr(true)} />
 );
};


interface SequenceStep {
 id: string;
 type: 'email' | 'linkedin';
 day: number;
 subject?: string;
 content: string;
 status: 'draft' | 'ready';
}

interface AccountBriefPageProps {
 companyName: string;
 onBack: () => void;
 onLogout: () => void;
 onNavigateDashboard?: () => void;
 onNavigateProfile?: () => void;
 onNavigateWatchlist?: () => void;
 onNavigateLeads?: () => void;
 onNavigateSequences?: () => void;
 onNavigateSettings?: () => void;
 onNavigateHelp?: () => void;
 onNavigateAccounts?: () => void;
}

export const AccountBriefPage: React.FC<AccountBriefPageProps> = ({ 
 companyName, 
 onBack, 
 onLogout, 
 onNavigateDashboard, 
 onNavigateProfile, 
 onNavigateWatchlist,
 onNavigateLeads,
 onNavigateSequences,
 onNavigateSettings,
 onNavigateHelp,
 onNavigateAccounts
}) => {
 const [intelligence, setIntelligence] = React.useState<any>(null);
 const [isLoading, setIsLoading] = React.useState(true);
 const [notes, setNotes] = React.useState('');
 const [isSavingNotes, setIsSavingNotes] = React.useState(false);
 const [isEditingNotes, setIsEditingNotes] = React.useState(false);
 
 const [isLinkedInModalOpen, setIsLinkedInModalOpen] = React.useState(false);
 const [selectedStakeholder, setSelectedStakeholder] = React.useState<any>(null);
 const [generatedMessage, setGeneratedMessage] = React.useState('');
 const [isGeneratingMessage, setIsGeneratingMessage] = React.useState(false);
 const [isCopied, setIsCopied] = React.useState(false);
 const [activeTab, setActiveTab] = React.useState<'overview' | 'stakeholders' | 'outreach' | 'strategy' | 'org-chart'>('overview');
 const [trackedCompanies, setTrackedCompanies] = React.useState<any[]>([]);
 const [isLoadingTracked, setIsLoadingTracked] = React.useState(false);
 const [isWatchlisted, setIsWatchlisted] = React.useState(false);
 const [leads, setLeads] = React.useState<string[]>([]);
 const [queue, setQueue] = React.useState<string[]>([]);
 const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'info' } | null>(null);

 const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
 setNotification({ message, type });
 setTimeout(() => setNotification(null), 3000);
 };

 const addToLeads = (companyName: string) => {
 if (!leads.includes(companyName)) {
 setLeads([...leads, companyName]);
 showNotification(`${companyName} added to your Leads list.`);
 } else {
 showNotification(`${companyName} is already in your Leads.`, 'info');
 }
 };

 const addToQueue = (companyName: string) => {
 if (!queue.includes(companyName)) {
 setQueue([...queue, companyName]);
 showNotification(`${companyName} added to your Outreach Queue.`);
 } else {
 showNotification(`${companyName} is already in your Queue.`, 'info');
 }
 };
 const [expandedStakeholders, setExpandedStakeholders] = React.useState<Set<string>>(new Set());
 const [emailDraft, setEmailDraft] = React.useState('');
 const [emailSubject, setEmailSubject] = React.useState('');
 const [selectedRecipientIndex, setSelectedRecipientIndex] = React.useState(0);
 const [sequences, setSequences] = React.useState<Record<number, SequenceStep[]>>({});
 const [selectedStepIndex, setSelectedStepIndex] = React.useState(0);
 const [isGeneratingStep, setIsGeneratingStep] = React.useState(false);
 const [emailTemplates, setEmailTemplates] = React.useState<any[]>([]);
 const [isGeneratingTemplates, setIsGeneratingTemplates] = React.useState(false);
 const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);

 React.useEffect(() => {
 fetchIntelligence();
 fetchNotes();
 fetchTrackedCompanies();
 fetchTemplates();
 }, [companyName]);

 const fetchTemplates = async () => {
 setIsGeneratingTemplates(true);
 try {
 const data = await generateEmailTemplates(companyName, intelligence?.company?.summary || "Company research in progress");
 if (data?.templates) {
 setEmailTemplates(data.templates);
 if (data.templates.length > 0) setSelectedTemplateId(data.templates[0].id);
 }
 } catch (error) {
 console.error("Failed to fetch templates:", error);
 } finally {
 setIsGeneratingTemplates(false);
 }
 };

 React.useEffect(() => {
 if (intelligence?.outreach_angles?.[0]?.draft) {
 setEmailDraft(intelligence.outreach_angles[0].draft);
 }
 }, [intelligence]);

 const toggleStakeholder = (id: string) => {
 const newSet = new Set(expandedStakeholders);
 if (newSet.has(id)) newSet.delete(id);
 else newSet.add(id);
 setExpandedStakeholders(newSet);
 };

 const fetchTrackedCompanies = async () => {
 setIsLoadingTracked(true);
 try {
 // In a real app, this would fetch from a database
 await new Promise(resolve => setTimeout(resolve, 600));
 setTrackedCompanies([]);
 } catch (error) {
 console.error('Failed to fetch tracked companies', error);
 } finally {
 setIsLoadingTracked(false);
 }
 };

 const fetchIntelligence = async () => {
 setIsLoading(true);
 try {
 // In a real app, we'd pass recent signals here
 const recentSignals = [
 { type: 'Website Visit', detail: '2 stakeholders viewed "Enterprise Pricing"', highIntent: true }
 ];
 const data = await getAccountIntelligence(companyName, recentSignals);
 setIntelligence(data);
 
 if (data?.keyPeople) {
 const initialSequences: Record<number, SequenceStep[]> = {};
 data.keyPeople.forEach((person: any, idx: number) => {
 initialSequences[idx] = [
 {
 id: Math.random().toString(36).substr(2, 9),
 type: 'email',
 day: 1,
 subject: person.tailoredEmail?.subject || 'Connecting regarding Market Expansion',
 content: person.tailoredEmail?.body || 'I noticed your recent work and wanted to reach out...',
 status: 'ready'
 },
 {
 id: Math.random().toString(36).substr(2, 9),
 type: 'linkedin',
 day: 3,
 content: `Hi ${person.name.split(' ')[0]}, I'd love to connect and learn more about your work at ${companyName}.`,
 status: 'draft'
 }
 ];
 });
 setSequences(initialSequences);
 }

 if (data?.keyPeople?.[0]?.tailoredEmail) {
 setEmailDraft(data.keyPeople[0].tailoredEmail.body);
 setEmailSubject(data.keyPeople[0].tailoredEmail.subject);
 setSelectedRecipientIndex(0);
 } else if (data?.suggestedEmail?.body) {
 setEmailDraft(data.suggestedEmail.body);
 setEmailSubject(data.suggestedEmail.subject || '');
 }
 } catch (error) {
 console.error("Failed to fetch intelligence:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const addSequenceStep = () => {
 const currentSequence = sequences[selectedRecipientIndex] || [];
 const lastDay = currentSequence.length > 0 ? currentSequence[currentSequence.length - 1].day : 0;
 const newStep: SequenceStep = {
 id: Math.random().toString(36).substr(2, 9),
 type: 'email',
 day: lastDay + 2,
 subject: 'Follow-up',
 content: '',
 status: 'draft'
 };
 
 setSequences({
 ...sequences,
 [selectedRecipientIndex]: [...currentSequence, newStep]
 });
 setSelectedStepIndex(currentSequence.length);
 };

 const removeSequenceStep = (index: number) => {
 const currentSequence = sequences[selectedRecipientIndex] || [];
 const newSequence = currentSequence.filter((_, i) => i !== index);
 setSequences({
 ...sequences,
 [selectedRecipientIndex]: newSequence
 });
 if (selectedStepIndex >= newSequence.length) {
 setSelectedStepIndex(Math.max(0, newSequence.length - 1));
 }
 };

 const updateSequenceStep = (index: number, updates: Partial<SequenceStep>) => {
 const currentSequence = sequences[selectedRecipientIndex] || [];
 const newSequence = currentSequence.map((step, i) => i === index ? { ...step, ...updates } : step);
 setSequences({
 ...sequences,
 [selectedRecipientIndex]: newSequence
 });
 
 // If updating the currently selected step, also update the main editor if it's the same
 if (index === selectedStepIndex) {
 if (updates.content !== undefined) setEmailDraft(updates.content);
 if (updates.subject !== undefined) setEmailSubject(updates.subject);
 }
 };

 const generateStepContent = async (index: number) => {
 const currentSequence = sequences[selectedRecipientIndex] || [];
 const step = currentSequence[index];
 const stakeholder = intelligence?.keyPeople?.[selectedRecipientIndex];
 
 if (!stakeholder) return;

 setIsGeneratingStep(true);
 try {
 const previousSteps = currentSequence.slice(0, index).map(s => ({ type: s.type, content: s.content }));
 const result = await generateSequenceStepContent(
 step.type,
 index + 1,
 stakeholder,
 companyName,
 intelligence?.summary || '',
 previousSteps
 );
 
 updateSequenceStep(index, {
 subject: result.subject || step.subject,
 content: result.content,
 status: 'ready'
 });
 } catch (error) {
 console.error("Failed to generate step content:", error);
 } finally {
 setIsGeneratingStep(false);
 }
 };

 const fetchNotes = async () => {
 try {
 const res = await fetch(`/api/notes/${encodeURIComponent(companyName)}`);
 const data = await res.json();
 setNotes(data.notes || '');
 } catch (error) {
 console.error("Failed to fetch notes:", error);
 }
 };

 const handleSaveNotes = async () => {
 setIsSavingNotes(true);
 try {
 await fetch(`/api/notes/${encodeURIComponent(companyName)}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ notes }),
 });
 setIsEditingNotes(false);
 } catch (error) {
 console.error("Failed to save notes:", error);
 } finally {
 setIsSavingNotes(false);
 }
 };

 const handleGenerateEmailDraft = async (stakeholder?: any, index?: number) => {
 if (index !== undefined) {
 setSelectedRecipientIndex(index);
 if (stakeholder?.tailoredEmail) {
 setEmailDraft(stakeholder.tailoredEmail.body);
 setEmailSubject(stakeholder.tailoredEmail.subject);
 }
 setActiveTab('outreach');
 return;
 }
 
 setIsGeneratingMessage(true);
 try {
 const signals = intelligence?.signals || [];
 const draft = await generateEmailDraft(companyName, intelligence?.summary || '', signals, stakeholder);
 
 setEmailDraft(draft);
 setActiveTab('outreach');
 } catch (error) {
 console.error("Failed to generate email draft:", error);
 } finally {
 setIsGeneratingMessage(false);
 }
 };

 const handleLinkedInConnect = async (stakeholder: any) => {
 setSelectedStakeholder(stakeholder);
 setIsLinkedInModalOpen(true);
 setIsGeneratingMessage(true);
 setGeneratedMessage('');
 setIsCopied(false);
 
 try {
 const message = await generateLinkedInMessage(
 stakeholder, 
 companyName, 
 intelligence?.summary || "General growth and market expansion"
 );
 setGeneratedMessage(message);
 } catch (error) {
 console.error("LinkedIn Message Gen Error:", error);
 } finally {
 setIsGeneratingMessage(false);
 }
 };

 const copyToClipboard = () => {
 navigator.clipboard.writeText(generatedMessage);
 setIsCopied(true);
 setTimeout(() => setIsCopied(false), 2000);
 };

 return (
 <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
 <Sidebar 
 activeView="account-brief"
 onNavigateDashboard={onNavigateDashboard!}
 onNavigateProfile={onNavigateProfile!}
 onNavigateWatchlist={onNavigateWatchlist!}
 onNavigateLeads={onNavigateLeads}
 onNavigateSequences={onNavigateSequences}
 onNavigateSettings={onNavigateSettings}
 onNavigateHelp={onNavigateHelp}
 onNavigateAccounts={onNavigateAccounts}
 onLogout={onLogout}
 />

 {/* Main Content */}
 <main className="flex-1 flex flex-col overflow-hidden bg-[#f6f6f8] pt-16 md:pt-0 pb-16 md:pb-0">
 {/* Header */}
 <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 bg-white backdrop-blur-sm z-10">
 <div className="flex items-center gap-4">
 <button onClick={onBack} className="p-2 text-slate-400 hover:text-[#0071E3] transition-colors">
 <ArrowLeft className="w-5 h-5"/>
 </button>
 <h2 className="text-lg font-bold">Account Intelligence: {companyName}</h2>
 </div>
 <div className="flex items-center gap-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
 <input 
 className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-[#0071E3] w-64 outline-none"
 placeholder="Search account data..."
 type="text"
 />
 </div>
 <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
 <Bell className="w-5 h-5"/>
 </button>
 <button className="bg-[#0071E3] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#0071E3]/90 transition-colors">
 Refresh Signals
 </button>
 </div>
 </header>

 {/* Scrollable Area */}
 <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
 {/* Account Overview Top Section */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-wrap items-start justify-between gap-6"
 >
 <div className="flex items-start gap-6">
 <div className="size-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
 {/* Company Logo or Initials */}
 <div className="text-3xl font-black text-[#0071E3]">
 {companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
 </div>
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-3">
 <h1 className="text-4xl font-black tracking-tight">{companyName}</h1>
 <span className="px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-bold uppercase tracking-wider">Tier 1</span>
 <button 
 onClick={() => setIsWatchlisted(!isWatchlisted)}
 className={`p-2 rounded-full transition-all ${isWatchlisted ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:text-amber-500'}`}
 title={isWatchlisted ? "Remove from Watchlist": "Add to Watchlist"}
 >
 <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-amber-500' : ''}`} />
 </button>
 </div>
 <p className="text-slate-500 text-lg">Global Technology Solutions | Fortune 500 Infrastructure Provider</p>
 <div className="flex gap-2 pt-2">
 <button 
 onClick={() => addToLeads(companyName)}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold ${leads.includes(companyName) ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-white hover:bg-slate-50'}`}
 >
 <UserPlus className="w-4 h-4"/>
 {leads.includes(companyName) ? 'In Leads' : 'Add to Leads'}
 </button>
 <button 
 onClick={() => addToQueue(companyName)}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold ${queue.includes(companyName) ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-white hover:bg-slate-50'}`}
 >
 <Layers className="w-4 h-4"/>
 {queue.includes(companyName) ? 'In Queue' : 'Add to Outreach Queue'}
 </button>
 </div>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="flex flex-col items-end px-4 py-2 bg-white rounded-xl min-w-[140px]">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Pipeline</span>
 <span className="text-2xl font-bold">$1.2M</span>
 </div>
 <div className="flex flex-col items-end px-4 py-2 bg-white rounded-xl min-w-[140px]">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Lead Score</span>
 <span className="text-2xl font-bold text-green-500">92</span>
 </div>
 <div className="flex flex-col items-end px-4 py-2 bg-white rounded-xl min-w-[140px]">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Intent Score</span>
 <div className="flex items-center gap-2">
 <span className={`text-2xl font-bold ${intelligence?.company?.intentScore?.score >= 80 ? 'text-orange-500' : 'text-blue-500'}`}>
 {intelligence?.company?.intentScore?.score || '85'}
 </span>
 <Zap className={`w-4 h-4 ${intelligence?.company?.intentScore?.score >= 80 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-blue-500'}`} />
 </div>
 </div>
 </div>
 </motion.div>

 {/* Tabs */}
 <div className="flex items-center gap-6 border-b ">
 {[
 { id: 'overview', label: 'Overview' },
 { id: 'stakeholders', label: 'Stakeholders' },
 { id: 'outreach', label: 'Outreach' },
 { id: 'strategy', label: 'Strategy' },
 { id: 'org-chart', label: 'Org & Relationships' }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
 activeTab === tab.id 
 ? 'border-[#0071E3] text-[#0071E3]' 
 : 'border-transparent text-slate-500 hover:text-slate-700'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 <div className="mt-6">
 {activeTab === 'overview' && (
 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12 lg:col-span-8 space-y-6">
 {/* Data Quality Banner (ground truth indicator) */}
 {intelligence?.meta && (
 <section className={`rounded-xl p-4 flex items-center justify-between ${
 intelligence.meta.dataQuality === 'verified' ? 'bg-emerald-50 border border-emerald-200' :
 intelligence.meta.dataQuality === 'partial' ? 'bg-amber-50 border border-amber-200' :
 intelligence.meta.dataQuality === 'no_people_found' ? 'bg-red-50 border border-red-200' :
 'bg-slate-50 border border-slate-200'
 }`}>
 <div className="flex items-center gap-3">
 {intelligence.meta.dataQuality === 'verified' ? <CheckCircle2 className="w-5 h-5 text-emerald-600"/> :
 intelligence.meta.dataQuality === 'partial' ? <AlertTriangle className="w-5 h-5 text-amber-600"/> :
 <Info className="w-5 h-5 text-slate-500"/>}
 <div>
 <p className="text-sm font-bold text-slate-900">
 Data Quality: {String(intelligence.meta.dataQuality || 'unknown').replace(/_/g, ' ').toUpperCase()}
 </p>
 <p className="text-xs text-slate-600">
 {intelligence.meta.peopleCount || 0} verified {(intelligence.meta.peopleCount || 0) === 1 ? 'person' : 'people'} - {intelligence.meta.sourcesCount || 0} citation{intelligence.meta.sourcesCount === 1 ? '' : 's'}
 {intelligence.meta.lastVerified ? ' - verified ' + new Date(intelligence.meta.lastVerified).toLocaleDateString() : ''}
 </p>
 </div>
 </div>
 {Array.isArray(intelligence.meta.caveats) && intelligence.meta.caveats.length > 0 && (
 <details className="text-xs">
 <summary className="cursor-pointer text-slate-500 hover:text-slate-700">caveats ({intelligence.meta.caveats.length})</summary>
 <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600 max-w-xs">
 {intelligence.meta.caveats.map((c: string, i: number) => (<li key={i}>{c}</li>))}
 </ul>
 </details>
 )}
 </section>
 )}

 {/* Intelligence Summary */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-[#0071E3]"/>
 Intelligence Summary
 </h3>
 <span className="text-xs text-slate-500">Updated 2h ago</span>
 </div>
 <div className="p-6 space-y-4">
 {isLoading ? (
 <div className="flex items-center justify-center py-10">
 <Zap className="w-8 h-8 text-[#0071E3] animate-pulse"/>
 </div>
 ) : intelligence ? (
 <>
 <p className="text-slate-600 leading-relaxed">
 "{intelligence.summary || `Analysis for ${companyName} suggests a strong market position with focus on growth.`}"
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
 <h4 className="text-xs font-bold text-blue-500 uppercase mb-2">Key Signals</h4>
 <ul className="text-sm space-y-2">
 {intelligence.signals?.map((signal: any, i: number) => (
 <li key={i} className="flex items-start gap-2">
 <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5"/>
 <span>{typeof signal === 'string' ? signal : signal.title}</span>
 </li>
 ))}
 </ul>
 </div>
 <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
 <h4 className="text-xs font-bold text-orange-500 uppercase mb-2">Growth Intent</h4>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs text-slate-500">Intent Score:</span>
 <span className="text-xs font-bold text-orange-500">{intelligence.company?.intentScore?.score || 85}/100</span>
 </div>
 <p className="text-[10px] text-slate-500 leading-relaxed italic">
 "{intelligence.company?.intentScore?.justification || 'High hiring volume in engineering and recent Series E funding suggests aggressive expansion.'}"
 </p>
 </div>
 </div>
 </div>
 </>
 ) : (
 <p className="text-slate-500 text-center py-10">No intelligence data available.</p>
 )}
 </div>
 </section>
 {/* Key People Table (verified, evidence-backed) */}
 {Array.isArray(intelligence?.keyPeople) && intelligence.keyPeople.length > 0 && (
 <section className="bg-white rounded-xl overflow-hidden">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Users className="w-5 h-5 text-[#0071E3]"/>
 Key People
 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Evidence-Verified</span>
 </h3>
 <span className="text-xs text-slate-500">{intelligence.keyPeople.length} verified</span>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-slate-50/50">
 <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
 <th className="px-5 py-3">Name</th>
 <th className="px-5 py-3">Title</th>
 <th className="px-5 py-3">LinkedIn</th>
 <th className="px-5 py-3">Email</th>
 <th className="px-5 py-3">Best Hook</th>
 </tr>
 </thead>
 <tbody>
 {intelligence.keyPeople.map((person: any, i: number) => (
 <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/40">
 <td className="px-5 py-3 font-bold text-slate-900">{person.name}</td>
 <td className="px-5 py-3 text-slate-600">{person.title}</td>
 <td className="px-5 py-3">
 {person.linkedin ? (
 <a href={person.linkedin} target="_blank" rel="noreferrer" className="text-[#0A66C2] hover:underline inline-flex items-center gap-1 text-xs">
 <Linkedin className="w-3 h-3"/>
 {person.linkedinStatus === 'verified' ? 'Verified' : 'View'}
 </a>
 ) : (
 <span className="text-slate-400 text-xs italic">not found</span>
 )}
 </td>
 <td className="px-5 py-3">
 {person.email ? (
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono text-slate-700">{person.email}</span>
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
 person.emailConfidence === 'verified' ? 'bg-emerald-100 text-emerald-700' :
 person.emailConfidence === 'high' ? 'bg-blue-100 text-blue-700' :
 person.emailConfidence === 'medium' ? 'bg-amber-100 text-amber-700' :
 'bg-slate-100 text-slate-500'
 }`}>{person.emailConfidence}</span>
 </div>
 ) : (
 <span className="text-slate-400 text-xs italic">-</span>
 )}
 </td>
 <td className="px-5 py-3 text-xs text-slate-600 max-w-xs">
 {person.activity?.bestHook ? (
 <span className="italic">"{person.activity.bestHook.slice(0, 140)}"</span>
 ) : person.evidence?.[0]?.snippet ? (
 <span className="text-slate-400 line-clamp-2">{person.evidence[0].snippet.slice(0, 100)}...</span>
 ) : (
 <span className="text-slate-400">-</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-slate-50/30 border-t border-slate-100 text-[10px] text-slate-500">
 Every person is traceable to at least one source. Click a LinkedIn badge to open the verified profile.
 </div>
 </section>
 )}

 {/* Ownership + Scale metrics */}
 {(intelligence?.company?.ownership || intelligence?.company?.scaleMetrics) && (
 <section className="bg-white rounded-xl overflow-hidden">
 <div className="p-5 border-b flex items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Building2 className="w-5 h-5 text-[#0071E3]"/>
 Ownership & Scale
 </h3>
 </div>
 <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
 {intelligence.company?.ownership?.type && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Type</p><p className="text-sm font-bold mt-1">{intelligence.company.ownership.type}</p></div>
 )}
 {intelligence.company?.ownership?.parent && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Parent</p><p className="text-sm font-bold mt-1">{intelligence.company.ownership.parent}</p></div>
 )}
 {intelligence.company?.scaleMetrics?.employees && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Employees</p><p className="text-sm font-bold mt-1">{intelligence.company.scaleMetrics.employees}</p></div>
 )}
 {intelligence.company?.scaleMetrics?.customers && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Customers</p><p className="text-sm font-bold mt-1">{intelligence.company.scaleMetrics.customers}</p></div>
 )}
 {intelligence.company?.scaleMetrics?.offices && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Offices</p><p className="text-sm font-bold mt-1">{intelligence.company.scaleMetrics.offices}</p></div>
 )}
 {intelligence.company?.scaleMetrics?.revenue && (
 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Revenue</p><p className="text-sm font-bold mt-1">{intelligence.company.scaleMetrics.revenue}</p></div>
 )}
 {Array.isArray(intelligence.company?.ownership?.investors) && intelligence.company.ownership.investors.length > 0 && (
 <div className="col-span-2 md:col-span-4">
 <p className="text-[10px] font-bold text-slate-400 uppercase">Investors</p>
 <div className="flex flex-wrap gap-2 mt-2">
 {intelligence.company.ownership.investors.map((inv: string, i: number) => (
 <span key={i} className="px-3 py-1 bg-slate-100 rounded text-xs font-medium">{inv}</span>
 ))}
 </div>
 </div>
 )}
 </div>
 </section>
 )}

 {/* Strategic Activity Timeline (3/6/12 Months) */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Clock className="w-5 h-5 text-[#0071E3]"/>
 Strategic Activity Timeline
 </h3>
 <div className="flex gap-2">
 <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">3M</span>
 <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">6M</span>
 <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">12M</span>
 </div>
 </div>
 <div className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
 {/* 3 Months */}
 <div className="space-y-4">
 <h4 className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest border-b border-[#0071E3]/10 pb-2">Last 3 Months</h4>
 <div className="space-y-3">
 {(intelligence?.company?.timeline?.last3Months || [
 { event: "Series E Funding ($450M)", date: "2 days ago", type: "funding"},
 { event: "EMEA Expansion Launch", date: "1 month ago", type: "growth"}
 ]).map((item: any, i: number) => (
 <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:size-1.5 before:rounded-full before:bg-[#0071E3]">
 <p className="text-xs font-bold">{item.event}</p>
 <p className="text-[10px] text-slate-500">{item.date}</p>
 </div>
 ))}
 </div>
 </div>
 {/* 6 Months */}
 <div className="space-y-4">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Last 6 Months</h4>
 <div className="space-y-3">
 {(intelligence?.company?.timeline?.last6Months || [
 { event: "New CPO Marcus Thorne Joins", date: "4 months ago", type: "leadership"},
 { event: "Product Launch: Shield v3", date: "5 months ago", type: "product"}
 ]).map((item: any, i: number) => (
 <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:size-1.5 before:rounded-full before:bg-slate-300">
 <p className="text-xs font-bold text-slate-700">{item.event}</p>
 <p className="text-[10px] text-slate-500">{item.date}</p>
 </div>
 ))}
 </div>
 </div>
 {/* 12 Months */}
 <div className="space-y-4">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Last 12 Months</h4>
 <div className="space-y-3">
 {(intelligence?.company?.timeline?.last12Months || [
 { event: "Acquisition of Armadillo Cyber", date: "9 months ago", type: "m&a"},
 { event: "Series D Funding ($200M)", date: "11 months ago", type: "funding"}
 ]).map((item: any, i: number) => (
 <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:size-1.5 before:rounded-full before:bg-slate-200">
 <p className="text-xs font-bold text-slate-500">{item.event}</p>
 <p className="text-[10px] text-slate-400">{item.date}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Internal Notes Section */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <FileEdit className="w-5 h-5 text-[#0071E3]"/>
 Internal Notes
 </h3>
 {isEditingNotes ? (
 <div className="flex items-center gap-2">
 <button 
 onClick={() => setIsEditingNotes(false)}
 className="text-xs font-bold text-slate-500 hover:text-slate-700"
 >
 Cancel
 </button>
 <button 
 onClick={handleSaveNotes}
 disabled={isSavingNotes}
 className="text-xs font-bold text-[#0071E3] hover:underline disabled:opacity-50"
 >
 {isSavingNotes ? 'Saving...' : 'Save Notes'}
 </button>
 </div>
 ) : (
 <button 
 onClick={() => setIsEditingNotes(true)}
 className="text-xs font-bold text-[#0071E3] hover:underline"
 >
 Edit Notes
 </button>
 )}
 </div>
 <div className="p-6">
 {isEditingNotes ? (
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Add private notes about this account... (e.g. key pain points, internal champions, next steps)"
 className="w-full h-32 p-4 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0071E3] transition-all resize-none"
 />
 ) : (
 <div className="w-full min-h-[8rem] p-4 bg-slate-50 border border-transparent rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
 {notes || <span className="text-slate-400">No notes added yet. Click Edit Notes to add some.</span>}
 </div>
 )}
 </div>
 </section>
 {/* "Why Now"Engine (Critical) */}
 <section className="bg-gradient-to-br from-[#0071E3]/10 to-transparent rounded-xl border border-[#0071E3]/20 overflow-hidden ">
 <div className="p-5 border-b border-[#0071E3]/10 flex justify-between items-center bg-white/50 backdrop-blur-sm">
 <h3 className="font-bold flex items-center gap-2 text-[#0071E3]">
 <Zap className="w-5 h-5 fill-[#0071E3]"/>
 "Why Now"Engine
 </h3>
 <span className="text-[10px] font-bold bg-[#0071E3] text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">Critical</span>
 </div>
 <div className="p-6">
 <p className="text-sm font-bold text-slate-900 mb-2">Why you should contact Sarah Jenkins this week:</p>
 <p className="text-sm text-slate-600 leading-relaxed">
 "Sarah just posted about EMEA expansion challenges, while their competitor announced a new edge node in Frankfurt. Their Q3 budget cycle closes in 14 days, and our latency report directly addresses her stated pain points."
 </p>
 <button className="mt-4 w-full py-2 bg-[#0071E3] text-white text-xs font-bold rounded-lg hover:bg-[#0071E3]/90 transition-colors shadow-[#0071E3]/20">
 Generate Outreach Draft
 </button>
 </div>
 </section>

 {/* Predictive Opportunity Engine */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <LineChart className="w-5 h-5 text-[#0071E3]"/>
 Predictive Opportunity Engine
 </h3>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 rounded-lg bg-slate-50 ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendor Switching</h4>
 <p className="text-2xl font-black text-orange-500 mb-1">High</p>
 <p className="text-[10px] text-slate-500 leading-relaxed">Current contract with Competitor X expires in 4 months.</p>
 </div>
 <div className="p-4 rounded-lg bg-slate-50 ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Cycle</h4>
 <p className="text-2xl font-black text-emerald-500 mb-1">Q3 Planning</p>
 <p className="text-[10px] text-slate-500 leading-relaxed">Historical data shows 60% of IT spend allocated in Q3.</p>
 </div>
 <div className="p-4 rounded-lg bg-slate-50 ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming RFPs</h4>
 <p className="text-2xl font-black text-blue-500 mb-1">Expected</p>
 <p className="text-[10px] text-slate-500 leading-relaxed">Cloud Infrastructure RFP likely within 45 days.</p>
 </div>
 </div>
 </section>

 {/* Market Intelligence (Dynamic) */}
 {(intelligence?.competitors || intelligence?.techStack) && (
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Globe className="w-5 h-5 text-[#0071E3]"/>
 Market Intelligence
 </h3>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Competitors */}
 {intelligence?.competitors && intelligence.competitors.length > 0 && (
 <div className="space-y-4">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
 <Swords className="w-4 h-4"/>
 Top Competitors
 </h4>
 <div className="space-y-3">
 {intelligence.competitors.map((comp: any, i: number) => (
 <div key={i} className="p-3 bg-slate-50 rounded-lg ">
 <div className="flex justify-between items-center mb-1">
 <p className="text-sm font-bold">{comp.name}</p>
 <span className="text-[10px] font-bold text-slate-500">{comp.marketShare} Share</span>
 </div>
 <p className="text-[10px] text-emerald-600 font-medium">
 <span className="font-bold">Advantage:</span> {comp.advantage}
 </p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Technology Stack */}
 {intelligence?.techStack && intelligence.techStack.length > 0 && (
 <div className="space-y-4">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
 <Cpu className="w-4 h-4"/>
 Technology Stack
 </h4>
 <div className="flex flex-wrap gap-2">
 {intelligence.techStack.map((tech: string, i: number) => (
 <span key={i} className="px-3 py-1.5 bg-blue-500/5 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-500/10">
 {tech}
 </span>
 ))}
 </div>
 <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
 <p className="text-[10px] text-amber-700 flex items-start gap-2">
 <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0"/>
 <span>Detected legacy systems in their security stack. Potential modernization opportunity.</span>
 </p>
 </div>
 </div>
 )}
 </div>
 </section>
 )}

 {/* Strategic Decision Makers (Dynamic) */}
 {intelligence?.keyPeople && intelligence.keyPeople.length > 0 && (
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-[#0A66C2]/5">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Linkedin className="w-5 h-5 text-[#0A66C2]"/>
 Strategic Decision Makers
 </h3>
 <span className="text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/10 px-2 py-0.5 rounded uppercase">LinkedIn Verified</span>
 </div>
 <div className="p-5 space-y-4">
 <p className="text-xs text-slate-500 mb-2">Key stakeholders at {companyName} identified for potential future partnerships.</p>
 <div className="space-y-3">
 {intelligence.keyPeople.slice(0, 3).map((person: any, i: number) => (
 <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group hover:border-[#0071E3]/30 transition-all">
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
 <img src={`https://picsum.photos/seed/${person.name}/100/100`} alt={person.name} referrerPolicy="no-referrer"/>
 </div>
 <div>
 <p className="text-sm font-bold group-hover:text-[#0071E3] transition-colors">{person.name}</p>
 <p className="text-[10px] text-slate-500">{person.title}</p>
 <div className="flex items-center gap-2 mt-1">
 <button 
 onClick={() => handleGenerateEmailDraft(person, i)}
 className="text-[9px] font-bold text-[#0071E3] hover:underline flex items-center gap-1"
 >
 <Mail className="w-3 h-3"/> Draft Email
 </button>
 <button 
 onClick={() => handleLinkedInConnect(person)}
 className="text-[9px] font-bold text-[#0A66C2] hover:underline flex items-center gap-1"
 >
 <Linkedin className="w-3 h-3"/> Connect
 </button>
 </div>
 </div>
 </div>
 <div className="text-right">
 <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${person.influence === 'High' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
 {person.influence} Influence
 </span>
 <p className="text-[9px] text-slate-400 mt-1 italic">{person.focus}</p>
 </div>
 </div>
 ))}
 </div>
 <button 
 onClick={() => setActiveTab('stakeholders')}
 className="w-full py-2 bg-[#0A66C2] text-white text-xs font-bold rounded-lg hover:bg-[#0A66C2]/90 flex items-center justify-center gap-2 transition-all"
 >
 <Linkedin className="w-4 h-4"/> View All {intelligence.keyPeople.length} Decision Makers on LinkedIn
 </button>
 </div>
 </section>
 )}

 {/* Citations (evidence panel) */}
 {Array.isArray(intelligence?.citations) && intelligence.citations.length > 0 && (
 <section className="bg-white rounded-xl overflow-hidden">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <ExternalLink className="w-5 h-5 text-[#0071E3]"/>
 Sources & Citations
 </h3>
 <span className="text-xs text-slate-500">{intelligence.citations.length} sources</span>
 </div>
 <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
 {intelligence.citations.slice(0, 20).map((c: any, i: number) => (
 <div key={i} className="flex items-start gap-2 text-xs">
 <span className="text-[10px] font-bold text-slate-400 mt-0.5">{c.id || (i + 1)}</span>
 <div className="flex-1 min-w-0">
 {c.url ? (
 <a href={c.url} target="_blank" rel="noreferrer" className="font-bold text-[#0071E3] hover:underline truncate block">{c.source}</a>
 ) : (
 <span className="font-bold text-slate-700">{c.source}</span>
 )}
 {c.snippet && <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{c.snippet}</p>}
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Advanced Intelligence Placeholder */}
 <section className="bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden">
 <div className="p-8 text-center space-y-4">
 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto ">
 <Database className="w-8 h-8 text-[#0071E3]"/>
 </div>
 <div>
 <h3 className="text-lg font-black text-slate-900">Unlock Advanced Insights</h3>
 <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">
 Connect your CRM and Social accounts to unlock predictive revenue attribution and autonomous monitoring.
 </p>
 </div>
 <button className="px-6 py-2.5 bg-[#0071E3] text-white text-xs font-black rounded-xl hover:bg-[#0071E3]/90 transition-all uppercase tracking-widest">
 Connect Data Sources
 </button>
 </div>
 </section>


 {/* Company Activity Feed */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold flex items-center gap-2">
 <Newspaper className="w-5 h-5 text-[#0071E3]"/>
 Company Activity Feed
 </h3>
 <button className="text-xs font-semibold text-[#0071E3] hover:underline">View All News</button>
 </div>
 <div className="p-6">
 <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
 {/* News Item */}
 <div className="relative flex items-start gap-4">
 <div className="relative size-10 flex flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow ring-8 ring-white z-10">
 <CreditCard className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <p className="text-sm font-bold">Signal: Series E Funding ($450M)</p>
 <time className="text-[10px] font-bold text-slate-400 uppercase">2 days ago</time>
 </div>
 <p className="text-xs text-slate-500 mb-2">Source: TechCrunch • Confidence: 100%</p>
 <div className="bg-slate-50 p-3 rounded-lg space-y-2">
 <p className="text-xs text-slate-700"><span className="font-bold">Insight:</span> Capital explicitly earmarked for EMEA expansion. This funding can be leveraged to accelerate the adoption of Signalz's 'localized edge security nodes' in response to competitor TechCorp's actions.</p>
 <p className="text-xs text-emerald-600 font-medium"><span className="font-bold">Action:</span> Pitch localized edge security nodes to Sarah Jenkins.</p>
 <button className="mt-1 text-[10px] font-bold text-[#0071E3] hover:underline flex items-center gap-1">
 <Zap className="w-3 h-3"/> Generate Pitch
 </button>
 </div>
 </div>
 </div>

 {/* Company Hiring Trends */}
 <div className="relative flex items-start gap-4">
 <div className="relative size-10 flex flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow ring-8 ring-white z-10">
 <TrendingUp className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <p className="text-sm font-bold">Company Hiring Trends</p>
 <time className="text-[10px] font-bold text-slate-400 uppercase">Updated Today</time>
 </div>
 <div className="bg-slate-50 p-4 rounded-lg ">
 {intelligence?.hiringTrends && intelligence.hiringTrends.length > 0 ? (
 <div className="space-y-4">
 {intelligence.hiringTrends.map((trend: any, idx: number) => (
 <div key={idx} className="space-y-2">
 <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
 <span>{trend.department}</span>
 <span>{trend.openRoles} roles</span>
 </div>
 <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
 <div className="bg-[#0071E3] h-full"style={{ width: `${Math.min(trend.openRoles * 2, 100)}%` }}></div>
 </div>
 <p className="text-[10px] text-emerald-500 font-bold">{trend.growth} growth</p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 italic">No specific hiring trends available at this time.</p>
 )}
 </div>
 </div>
 </div>

 {/* Funding Rounds */}
 <div className="relative flex items-start gap-4">
 <div className="relative size-10 flex flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow ring-8 ring-white z-10">
 <CreditCard className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <p className="text-sm font-bold">Funding & Financials</p>
 <time className="text-[10px] font-bold text-slate-400 uppercase">Historical</time>
 </div>
 <div className="space-y-2">
 {intelligence?.fundingRounds && intelligence.fundingRounds.length > 0 ? (
 intelligence.fundingRounds.map((round: any, idx: number) => (
 <div key={idx} className="p-3 bg-white rounded-lg flex items-center justify-between">
 <div>
 <p className="text-xs font-bold">{round.round}</p>
 <p className="text-[10px] text-slate-500">{round.date}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-bold text-emerald-500">{round.amount}</p>
 <p className="text-[10px] text-slate-500">Investors: {round.investors.join(', ')}</p>
 </div>
 </div>
 ))
 ) : (
 <div className="p-3 bg-white rounded-lg">
 <p className="text-xs text-slate-500 italic">No funding history found.</p>
 </div>
 )}
 
 {intelligence?.financials && (
 <div className="mt-4 p-3 bg-slate-100 rounded-lg ">
 <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Financial Snapshot</h5>
 <div className="grid grid-cols-3 gap-2">
 <div>
 <p className="text-[9px] text-slate-500 uppercase">Revenue</p>
 <p className="text-xs font-bold">{intelligence.financials.revenue || 'N/A'}</p>
 </div>
 <div>
 <p className="text-[9px] text-slate-500 uppercase">Growth</p>
 <p className="text-xs font-bold text-emerald-500">{intelligence.financials.growth || 'N/A'}</p>
 </div>
 <div>
 <p className="text-[9px] text-slate-500 uppercase">Valuation</p>
 <p className="text-xs font-bold">{intelligence.financials.valuation || 'N/A'}</p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Hires Item */}
 <div className="relative flex items-start gap-4">
 <div className="relative size-10 flex flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow ring-8 ring-white z-10">
 <UserPlus className="w-5 h-5"/>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <p className="text-sm font-bold">Signal: Strategic Hire (Marcus Thorne)</p>
 <time className="text-[10px] font-bold text-slate-400 uppercase">1 week ago</time>
 </div>
 <p className="text-xs text-slate-500 mb-2">Source: LinkedIn • Confidence: 100%</p>
 <div className="bg-slate-50 p-3 rounded-lg space-y-2">
 <p className="text-xs text-slate-700"><span className="font-bold">Insight:</span> Former AWS Exec joining as CPO suggests shift towards AWS-native architecture.</p>
 <p className="text-xs text-purple-600 font-medium"><span className="font-bold">Action:</span> Highlight our AWS marketplace integration in next touchpoint.</p>
 </div>
 </div>
 </div>
 {/* Product Launch Item */}
 <div className="relative flex items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <div className="relative size-10 flex flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow ring-8 ring-white">
 <Rocket className="w-5 h-5"/>
 </div>
 <div>
 <p className="text-sm font-bold">Product Launch: {companyName} Shield v3</p>
 <p className="text-xs text-slate-500">New zero-trust security layer for distributed edge nodes.</p>
 </div>
 </div>
 <time className="text-[10px] font-bold text-slate-400 uppercase">2 weeks ago</time>
 </div>
 </div>
 </div>
 </section>
 </div>
 <div className="col-span-12 lg:col-span-4 space-y-6">
 {/* Quick Links & Resources */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <LinkIcon className="w-5 h-5 text-[#0071E3]"/>
 Quick Resources
 </h3>
 </div>
 <div className="p-4 space-y-2">
 {[
 { label: 'Company Website', icon: Globe, url: intelligence?.company?.website || '#' },
 { label: 'LinkedIn Page', icon: Linkedin, url: `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}` },
 { label: 'Latest News', icon: Newspaper, url: '#' },
 { label: 'Financial Reports', icon: DollarSign, url: '#' },
 { label: 'Tech Stack Details', icon: Activity, url: '#' }
 ].map((link, i) => (
 <a 
 key={i}
 href={link.url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover: transition-all group"
 >
 <div className="flex items-center gap-3">
 <div className="size-7 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#0071E3] transition-colors">
 <link.icon className="w-4 h-4"/>
 </div>
 <span className="text-xs font-semibold text-slate-700">{link.label}</span>
 </div>
 <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
 </a>
 ))}
 </div>
 </section>

 {/* Recent Signals Feed */}
 <section className="bg-white rounded-xl p-5 space-y-4 ">
 <h3 className="font-bold text-sm">Recent Activity Signals</h3>
 <div className="space-y-4">
 <div className="flex gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
 <div className="size-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
 <Eye className="w-4 h-4 text-orange-600"/>
 </div>
 <div className="text-xs flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <p className="font-bold text-orange-700">Signal: Website Visit</p>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-slate-500">Confidence: 98%</span>
 <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">High Intent</span>
 </div>
 </div>
 <p className="text-slate-600 leading-relaxed">
 <span className="font-semibold text-slate-900">Insight:</span> 2 stakeholders (including VP Cloud) viewed "Enterprise Pricing"for 4+ minutes.
 </p>
 <p className="text-emerald-600 leading-relaxed font-medium bg-emerald-50 p-1.5 rounded border border-emerald-500/10">
 <span className="font-bold">Implication:</span> Active budget evaluation cycle has started.
 </p>
 <div className="flex items-center justify-between pt-1 border-t border-orange-500/10">
 <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 15 mins ago</span>
 <button className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1">
 <Zap className="w-3 h-3"/> Draft Outreach
 </button>
 </div>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
 <Rss className="w-4 h-4 text-emerald-500"/>
 </div>
 <div className="text-xs flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <p className="font-bold text-emerald-700">Signal: Earnings Call</p>
 <span className="text-[9px] text-slate-500">Source: PR Newswire</span>
 </div>
 <p className="text-slate-600 leading-relaxed">
 <span className="font-semibold text-slate-900">Insight:</span> Q3 earnings beat by 12%. CFO highlighted "infrastructure modernization"as Q4 priority.
 </p>
 <p className="text-blue-600 leading-relaxed font-medium bg-blue-50 p-1.5 rounded border border-blue-500/10">
 <span className="font-bold">Action:</span> Reference Q4 priority in outreach to CTO.
 </p>
 <div className="flex items-center justify-between pt-1 border-t border-slate-100">
 <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 4 hours ago</span>
 <button className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
 <Zap className="w-3 h-3"/> Draft Outreach
 </button>
 </div>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
 <Share2 className="w-4 h-4 text-blue-500"/>
 </div>
 <div className="text-xs flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <p className="font-bold text-blue-700">Signal: Social Engagement</p>
 <span className="text-[9px] text-slate-500">Source: LinkedIn</span>
 </div>
 <p className="text-slate-600 leading-relaxed">
 <span className="font-semibold text-slate-900">Insight:</span> Sarah Jenkins liked a post on "Edge Computing Efficiency vs Cost".
 </p>
 <p className="text-purple-600 leading-relaxed font-medium bg-purple-50 p-1.5 rounded border border-purple-500/10">
 <span className="font-bold">Implication:</span> Cost-efficiency is top of mind for her edge strategy.
 </p>
 <div className="flex items-center justify-between pt-1 border-t border-slate-100">
 <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> 6 hours ago</span>
 <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
 <Zap className="w-3 h-3"/> Draft Outreach
 </button>
 </div>
 </div>
 </div>
 </div>
 <button className="w-full py-2 text-center text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
 View Full Activity Log
 </button>
 </section>

 {/* Similar Companies to Approach */}
 <section className="bg-white rounded-xl p-5 space-y-4 ">
 <div className="flex items-center justify-between">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Target className="w-5 h-5 text-[#0071E3]"/>
 Similar Companies to Approach
 </h3>
 <Sparkles className="w-4 h-4 text-[#0071E3] animate-pulse"/>
 </div>
 <p className="text-[10px] text-slate-500 font-medium">Based on {companyName}'s profile, these companies are high-probability targets for your company solutions.</p>
 <div className="space-y-3">
 {intelligence?.similarCompanies?.map((company: any, i: number) => (
 <div key={i} className="p-3 bg-slate-50 rounded-lg hover:border-[#0071E3]/30 transition-all group">
 <div className="flex justify-between items-start mb-2">
 <div>
 <p className="text-sm font-bold group-hover:text-[#0071E3] transition-colors">{company.name}</p>
 <p className="text-[10px] text-slate-500">{company.industry}</p>
 </div>
 <div className="flex gap-1">
 <button 
 onClick={() => addToLeads(company.name)}
 className={`p-1.5 rounded-md border transition-all ${leads.includes(company.name) ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-white hover:text-[#0071E3]'}`} 
 title="Add to Leads"
 >
 <UserPlus className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => addToQueue(company.name)}
 className={`p-1.5 rounded-md border transition-all ${queue.includes(company.name) ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-white hover:text-[#0071E3]'}`} 
 title="Add to Queue"
 >
 <Layers className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => {
 showNotification(`Deep research initiated for ${company.name}...`, 'info');
 // In a real app, this would navigate to the brief for this company
 }}
 className="p-1.5 rounded-md border bg-white hover:text-[#0071E3] transition-all"
 title="Deep Research"
 >
 <BrainCircuit className="w-3.5 h-3.5"/>
 </button>
 </div>
 </div>
 <p className="text-[10px] text-slate-600 leading-relaxed italic">
 <span className="font-bold text-[#0071E3] not-italic">Why:</span> {company.whyApproach}
 </p>
 </div>
 )) || (
 <div className="text-center py-6 space-y-2">
 <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
 <Search className="w-5 h-5 text-slate-400"/>
 </div>
 <p className="text-xs text-slate-500 italic">Analyzing market for similar targets...</p>
 </div>
 )}
 </div>
 <button 
 onClick={() => showNotification('Deep research initiated for all similar targets...', 'info')}
 className="w-full py-2 text-center text-xs font-bold bg-[#0071E3]/5 text-[#0071E3] border border-[#0071E3]/20 rounded-lg hover:bg-[#0071E3]/10 transition-colors"
 >
 Deep Research All Similar Targets
 </button>
 </section>

 {/* Integration Readiness */}
 <section className="bg-white rounded-xl p-5 space-y-4 ">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Network className="w-5 h-5 text-[#0071E3]"/>
 System Integrations
 </h3>
 <div className="grid grid-cols-2 gap-3">
 <button 
 onClick={() => showNotification('Outlook integration coming soon!', 'info')}
 className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-lg hover:border-[#0071E3]/50 transition-all"
 >
 <Mail className="w-4 h-4 text-blue-500"/>
 <span className="text-xs font-bold">Outlook</span>
 </button>
 <button 
 onClick={() => showNotification('Gmail integration coming soon!', 'info')}
 className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-lg hover:border-[#0071E3]/50 transition-all"
 >
 <Mail className="w-4 h-4 text-red-500"/>
 <span className="text-xs font-bold">Gmail</span>
 </button>
 </div>
 <p className="text-[10px] text-slate-500 text-center italic">Connect your email to send AI-generated drafts directly from Signalz.</p>
 </section>
 </div>
 </div>
 )}

 {activeTab === 'stakeholders' && (
 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12 lg:col-span-8 space-y-6">
 {/* Stakeholder Map with Insights */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Network className="w-5 h-5 text-[#0071E3]"/>
 Stakeholder Map
 </h3>
 <button className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest hover:underline">Manage</button>
 </div>
 <div className="p-5 space-y-6">
 {intelligence?.keyPeople && intelligence.keyPeople.length > 0 ? (
 intelligence.keyPeople.map((person: any, index: number) => (
 <div key={index} className="space-y-3">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
 {index === 0 ? 'Primary Contact' : 'Stakeholder'} 
 <span className="ml-2 px-1.5 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3] text-[8px]">Rank #{person.priorityRank || (index + 1)}</span>
 {person.influence === 'High' && (
 <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[8px]">High Influence</span>
 )}
 {person.influence === 'Medium' && (
 <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[8px]">Medium Influence</span>
 )}
 </h4>
 <div className="p-3 rounded-lg bg-slate-50 transition-all cursor-pointer hover:border-[#0071E3]/30 hover: group">
 <div className="flex items-center gap-3"onClick={() => toggleStakeholder(person.name)}>
 <div 
 className="size-10 rounded-full bg-slate-200 border-2 border-[#0071E3] overflow-hidden hover:scale-110 transition-transform cursor-help"
 onClick={(e) => {
 e.stopPropagation();
 showNotification(`Viewing detailed profile for ${person.name}...`, 'info');
 }}
 title="Click for deep profile insights"
 >
 <img src={`https://picsum.photos/seed/${person.name}/100/100`} alt={person.name} referrerPolicy="no-referrer"/>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-bold truncate">{person.name}</p>
 <p className="text-xs text-slate-500 truncate">{person.title}</p>
 </div>
 <div className="flex items-center gap-1">
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleGenerateEmailDraft(person, index);
 }}
 className="p-1.5 text-slate-400 hover:text-[#0071E3] hover:bg-[#0071E3]/10 rounded-md transition-colors"
 title="Draft Email"
 >
 <Mail className="w-4 h-4"/>
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); handleLinkedInConnect(person); }}
 className="p-1.5 text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 rounded-md transition-colors"
 title="LinkedIn Connect"
 >
 <Linkedin className="w-4 h-4"/>
 </button>
 </div>
 {person.influence === 'High' && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-1"/>}
 </div>
 <AnimatePresence>
 {expandedStakeholders.has(person.name) && (
 <motion.div 
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="mt-3 pt-3 border-t ">
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0071E3] uppercase">
 <Sparkles className="w-3 h-3"/>
 Conversation Hook
 </div>
 </div>
 <p className="text-xs text-slate-600 bg-white p-3 rounded-lg leading-relaxed border border-[#0071E3]/10 italic">
 "{person.hook || "No specific hook available. Focus on their strategic goals."}"
 </p>
 <div className="mt-3 grid grid-cols-2 gap-3">
 <div className="p-2 bg-slate-100 rounded ">
 <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Strategic Focus</p>
 <p className="text-[10px] font-medium">{person.focus}</p>
 </div>
 <div className="p-2 bg-slate-100 rounded ">
 <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Comm Style</p>
 <p className="text-[10px] font-medium">{person.style}</p>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-8 text-slate-500">
 {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> : "No stakeholders found."}
 </div>
 )}
 </div>
 </section>
 {/* Relationship Graph Engine */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Share2 className="w-5 h-5 text-[#0071E3]"/>
 Relationship Graph Engine
 </h3>
 </div>
 <div className="p-5 space-y-6">
 <div className="p-4 bg-slate-50 rounded-lg ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Best Path to Decision Maker</h4>
 <div className="flex items-center justify-between relative">
 <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
 <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
 <div className="size-10 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-bold ">You</div>
 </div>
 <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
 <div className="size-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-300">
 <img src="https://picsum.photos/seed/investor/100/100"alt="Investor"referrerPolicy="no-referrer"/>
 </div>
 <span className="text-[10px] font-bold">VC Partner</span>
 </div>
 <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
 <div className="size-10 rounded-full bg-slate-200 overflow-hidden border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
 <img src="https://picsum.photos/seed/sarah/100/100"alt="Sarah"referrerPolicy="no-referrer"/>
 </div>
 <span className="text-[10px] font-bold text-emerald-500">Sarah J.</span>
 </div>
 </div>
 <p className="text-xs text-slate-500 text-center mt-4">Warm intro path identified via mutual connection at Sequoia Capital.</p>
 <button className="mt-3 w-full py-1.5 border border-[#0071E3] text-[#0071E3] text-xs font-bold rounded hover:bg-[#0071E3]/5 transition-colors">Request Intro Draft</button>
 </div>
 </div>
 </section>

 {/* Social Signal Heatmap */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Flame className="w-5 h-5 text-orange-500"/>
 Social Signal Heatmap
 </h3>
 </div>
 <div className="p-5">
 <div className="space-y-4">
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="size-6 rounded-full overflow-hidden"><img src="https://picsum.photos/seed/sarah/100/100"alt="Sarah"referrerPolicy="no-referrer"/></div>
 <span className="font-bold">Sarah Jenkins</span>
 </div>
 <div className="flex gap-1">
 <div className="w-8 h-2 bg-orange-500 rounded-sm"title="Highly Active"></div>
 <div className="w-8 h-2 bg-emerald-500 rounded-sm"title="Highly Influential"></div>
 <div className="w-8 h-2 bg-blue-500 rounded-sm"title="Highly Reachable"></div>
 </div>
 </div>
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="size-6 rounded-full overflow-hidden"><img src="https://picsum.photos/seed/mark/100/100"alt="Mark"referrerPolicy="no-referrer"/></div>
 <span className="font-bold">Mark Chen</span>
 </div>
 <div className="flex gap-1">
 <div className="w-8 h-2 bg-orange-400 rounded-sm"></div>
 <div className="w-8 h-2 bg-emerald-300 rounded-sm"></div>
 <div className="w-8 h-2 bg-blue-400 rounded-sm"></div>
 </div>
 </div>
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="size-6 rounded-full overflow-hidden"><img src="https://picsum.photos/seed/david/100/100"alt="David"referrerPolicy="no-referrer"/></div>
 <span className="font-bold">David Vance</span>
 </div>
 <div className="flex gap-1">
 <div className="w-8 h-2 bg-orange-200 rounded-sm"></div>
 <div className="w-8 h-2 bg-emerald-400 rounded-sm"></div>
 <div className="w-8 h-2 bg-blue-200 rounded-sm"></div>
 </div>
 </div>
 <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
 <span>Activity</span>
 <span>Influence</span>
 <span>Reachability</span>
 </div>
 </div>
 </div>
 </section>

 {/* Multi-Threading Intelligence */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Users className="w-5 h-5 text-[#0071E3]"/>
 Multi-Threading Intelligence
 </h3>
 </div>
 <div className="p-5 space-y-4">
 <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
 <p className="text-sm font-bold text-orange-700 mb-1">Coverage Gap Detected</p>
 <p className="text-xs text-slate-600">You are only connected to 1/5 key decision-makers in the Cloud Infrastructure buying group.</p>
 </div>
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Connections</h4>
 <div className="flex items-center justify-between p-3 rounded-lg">
 <div className="flex items-center gap-3">
 <div className="size-8 rounded-full bg-slate-200 overflow-hidden">
 <img src="https://picsum.photos/seed/cto/100/100"alt="CTO"referrerPolicy="no-referrer"/>
 </div>
 <div>
 <p className="text-sm font-bold">Michael Chang</p>
 <p className="text-xs text-slate-500">Chief Technology Officer</p>
 </div>
 </div>
 <button className="text-xs font-bold text-[#0071E3] hover:underline">Connect</button>
 </div>
 </div>
 </div>
 </section>

 {/* Visual Org Chart Section */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Network className="w-5 h-5 text-[#0071E3]"/>
 Visual Organization Chart
 </h3>
 <div className="flex gap-2">
 <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"title="Zoom In"><Maximize className="w-4 h-4"/></button>
 </div>
 </div>
 <div className="p-5 overflow-x-auto no-scrollbar">
 <div className="min-w-[800px]">
 <OrgChart people={intelligence?.keyPeople || []} companyName={companyName} />
 </div>
 </div>
 <div className="p-4 bg-slate-50 border-t ">
 <p className="text-[10px] text-slate-500 italic text-center">Interactive org chart. Click nodes to expand/collapse and explore the hierarchy.</p>
 </div>
 </section>
 </div>
 <div className="col-span-12 lg:col-span-4 space-y-6">
 {/* LinkedIn Behavioral Intelligence */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <ActivitySquare className="w-5 h-5 text-[#0071E3]"/>
 Behavioral Intelligence
 </h3>
 </div>
 <div className="p-5 space-y-4">
 <div className="space-y-2">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Influence Clusters</h4>
 <div className="p-3 bg-slate-50 rounded-lg ">
 <p className="text-xs text-slate-600 leading-relaxed">
 <span className="font-bold text-slate-900">Sarah Jenkins (VP Cloud)</span> is heavily influenced by external advisors. She frequently engages with posts from Gartner analysts and AWS solution architects.
 </p>
 </div>
 </div>
 <div className="space-y-2">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engagement Patterns</h4>
 <div className="flex items-center gap-2 text-xs text-slate-600">
 <Clock className="w-4 h-4 text-slate-400"/>
 Most active on LinkedIn: Tuesdays & Thursdays, 8-10 AM EST.
 </div>
 </div>
 </div>
 </section>
 </div>
 </div>
 )}

 {activeTab === 'outreach' && (
 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12 lg:col-span-8 space-y-6">
 {/* AI-Crafted Personalized Emails (ground-truth, evidence-based) */}
 {Array.isArray(intelligence?.outreach?.emails) && intelligence.outreach.emails.length > 0 && (
 <section className="bg-white rounded-xl overflow-hidden">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Mail className="w-5 h-5 text-[#0071E3]"/>
 Personalized Outreach Drafts
 <span className="text-[10px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded uppercase">{intelligence.outreach.emails.length} drafts</span>
 </h3>
 <span className="text-xs text-slate-500">Each email grounded in a verified hook</span>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
 {intelligence.outreach.emails.map((em: any, i: number) => (
 <div key={i} className="p-5 space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-bold text-slate-900">{em.recipientName}</p>
 <p className="text-[11px] text-slate-500">{em.recipientTitle}</p>
 </div>
 {em.recipientEmailGuess && (
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
 em.emailConfidence === 'verified' ? 'bg-emerald-100 text-emerald-700' :
 em.emailConfidence === 'high' ? 'bg-blue-100 text-blue-700' :
 em.emailConfidence === 'medium' ? 'bg-amber-100 text-amber-700' :
 'bg-slate-100 text-slate-500'
 }`}>{em.emailConfidence}</span>
 )}
 </div>
 {em.recipientEmailGuess && (
 <p className="text-[11px] font-mono text-slate-600 truncate">{em.recipientEmailGuess}</p>
 )}
 <div className="pt-3 border-t border-slate-100">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
 <p className="text-sm font-bold text-slate-900 mt-1">{em.subject}</p>
 {Array.isArray(em.subjectAlternates) && em.subjectAlternates.length > 0 && (
 <details className="mt-2">
 <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-700">{em.subjectAlternates.length} alternate subjects</summary>
 <ul className="mt-1 space-y-1 text-[11px] text-slate-600 list-disc list-inside">
 {em.subjectAlternates.map((s: string, j: number) => (<li key={j}>{s}</li>))}
 </ul>
 </details>
 )}
 </div>
 <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded-lg max-h-60 overflow-y-auto">
 {em.body}
 </div>
 {Array.isArray(em.hooks) && em.hooks.length > 0 && (
 <div className="flex flex-wrap gap-1">
 {em.hooks.map((h: string, j: number) => (
 <span key={j} className="text-[9px] px-2 py-0.5 bg-[#0071E3]/10 text-[#0071E3] rounded-full font-bold uppercase tracking-widest">{h}</span>
 ))}
 </div>
 )}
 {em.callToAction && (
 <div className="flex items-start gap-2 text-[11px] text-slate-600">
 <Target className="w-3 h-3 text-[#0071E3] mt-0.5 shrink-0"/>
 <span><span className="font-bold">Ask: </span>{em.callToAction}</span>
 </div>
 )}
 <div className="flex gap-2 pt-2">
 <button
 onClick={() => {
 navigator.clipboard.writeText(`Subject: ${em.subject}\n\n${em.body}`);
 showNotification('Email copied to clipboard', 'success');
 }}
 className="flex-1 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center justify-center gap-1"
 >
 <Copy className="w-3 h-3"/> Copy
 </button>
 {em.recipientEmailGuess && (
 <a
 href={`mailto:${em.recipientEmailGuess}?subject=${encodeURIComponent(em.subject)}&body=${encodeURIComponent(em.body)}`}
 className="flex-1 py-1.5 text-[11px] font-bold bg-[#0071E3] text-white hover:bg-[#0071E3]/90 rounded transition-colors flex items-center justify-center gap-1"
 >
 <Mail className="w-3 h-3"/> Send
 </a>
 )}
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Outreach Settings & Controls */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Settings className="w-5 h-5 text-[#0071E3]"/>
 Outreach Settings
 </h3>
 </div>
 <div className="p-5 grid grid-cols-3 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tone</label>
 <select className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-[#0071E3]">
 <option>Professional</option>
 <option>Conversational</option>
 <option>Direct</option>
 <option>Thought Leader</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary CTA</label>
 <select className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-[#0071E3]">
 <option>Discovery Call</option>
 <option>Resource Share</option>
 <option>Intro Request</option>
 <option>Opinion/Feedback</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Length</label>
 <select className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-[#0071E3]">
 <option>Concise</option>
 <option>Standard</option>
 <option>Detailed</option>
 </select>
 </div>
 </div>
 </section>

 {/* Email Templates Section */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <FileEdit className="w-5 h-5 text-[#0071E3]"/>
 AI Email Templates
 </h3>
 <button 
 onClick={fetchTemplates}
 disabled={isGeneratingTemplates}
 className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] rounded-full hover:bg-[#0071E3]/20 transition-colors disabled:opacity-50"
 >
 {isGeneratingTemplates ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
 Regenerate
 </button>
 </div>
 <div className="p-5">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 {emailTemplates.map((template) => (
 <button
 key={template.id}
 onClick={() => setSelectedTemplateId(template.id)}
 className={`p-3 text-left rounded-lg border transition-all ${
 selectedTemplateId === template.id 
 ? 'border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3]' 
 : ' hover:border-[#0071E3]/50'
 }`}
 >
 <p className="text-xs font-bold truncate">{template.name}</p>
 <p className="text-[10px] text-slate-500 mt-1 truncate">{template.subject}</p>
 </button>
 ))}
 {emailTemplates.length === 0 && !isGeneratingTemplates && (
 <div className="col-span-3 text-center py-4 text-slate-500 text-xs">
 No templates generated yet. Click regenerate to start.
 </div>
 )}
 {isGeneratingTemplates && (
 <div className="col-span-3 text-center py-4 text-slate-500 text-xs flex items-center justify-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin"/>
 Generating elite templates...
 </div>
 )}
 </div>

 {selectedTemplateId && (
 <div className="space-y-4">
 <div className="p-4 bg-slate-50 rounded-lg ">
 <div className="flex items-center justify-between mb-3 pb-3 border-b ">
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
 <p className="text-sm font-bold text-slate-900">
 {emailTemplates.find(t => t.id === selectedTemplateId)?.subject}
 </p>
 </div>
 <button 
 onClick={() => {
 const t = emailTemplates.find(t => t.id === selectedTemplateId);
 if (t) {
 navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`);
 showNotification('Template copied to clipboard!');
 }
 }}
 className="p-2 text-slate-400 hover:text-[#0071E3] hover:bg-[#0071E3]/10 rounded-md transition-colors"
 title="Copy to Clipboard"
 >
 <Copy className="w-4 h-4"/>
 </button>
 </div>
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body</p>
 <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
 {emailTemplates.find(t => t.id === selectedTemplateId)?.body}
 </div>
 </div>
 </div>
 <div className="flex justify-end gap-3">
 <button 
 onClick={() => {
 const t = emailTemplates.find(t => t.id === selectedTemplateId);
 if (t) {
 setEmailDraft(t.body);
 setEmailSubject(t.subject);
 showNotification('Template applied to editor.');
 }
 }}
 className="px-4 py-2 bg-[#0071E3] text-white text-xs font-bold rounded-lg hover:bg-[#0071E3]/90 transition-colors"
 >
 Apply to Editor
 </button>
 </div>
 </div>
 )}
 </div>
 </section>

 {/* Email Editor Area */}
 <section className="bg-white rounded-xl shadow-xl overflow-hidden">
 <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
 <div className="flex items-center gap-2">
 <Layers className="w-5 h-5 text-slate-400"/>
 <h3 className="font-bold text-sm">Sequence Builder: {companyName}</h3>
 </div>
 <div className="flex items-center gap-2">
 <button className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded transition-colors">Save Sequence</button>
 <button className="px-3 py-1 text-xs font-semibold bg-[#0071E3] text-white rounded hover:bg-[#0071E3]/90 transition-colors">Launch Campaign</button>
 </div>
 </div>
 <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 h-[600px]">
 {/* Recipient Sidebar */}
 <div className="w-full md:w-1/5 p-4 space-y-3 overflow-y-auto no-scrollbar bg-slate-50/30">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recipients</h4>
 {intelligence?.keyPeople?.map((person: any, idx: number) => (
 <div 
 key={idx} 
 onClick={() => {
 setSelectedRecipientIndex(idx);
 setSelectedStepIndex(0);
 const firstStep = sequences[idx]?.[0];
 if (firstStep) {
 setEmailDraft(firstStep.content);
 setEmailSubject(firstStep.subject || '');
 }
 }}
 className={`p-3 rounded cursor-pointer transition-all border ${selectedRecipientIndex === idx ? 'bg-white border-[#0071E3] ' : 'bg-transparent border-transparent hover:bg-slate-100'}`}
 >
 <p className="text-xs font-bold truncate">{person.name}</p>
 <p className="text-[9px] text-slate-500 truncate">{person.title}</p>
 </div>
 ))}
 </div>

 {/* Sequence Steps Sidebar */}
 <div className="w-full md:w-1/4 p-4 space-y-3 overflow-y-auto no-scrollbar">
 <div className="flex items-center justify-between mb-2">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sequence Steps</h4>
 <button 
 onClick={addSequenceStep}
 className="p-1 text-[#0071E3] hover:bg-[#0071E3]/10 rounded transition-colors"
 title="Add Step"
 >
 <Plus className="w-4 h-4"/>
 </button>
 </div>
 {sequences[selectedRecipientIndex]?.map((step, idx) => (
 <div 
 key={step.id}
 onClick={() => {
 setSelectedStepIndex(idx);
 setEmailDraft(step.content);
 setEmailSubject(step.subject || '');
 }}
 className={`p-3 rounded cursor-pointer transition-all border ${selectedStepIndex === idx ? 'bg-[#0071E3]/5 border-[#0071E3]' : 'bg-slate-50 border-transparent hover:'}`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {step.type === 'email' ? <Mail className="w-3 h-3 text-blue-500"/> : <Linkedin className="w-3 h-3 text-[#0A66C2]"/>}
 <span className="text-[10px] font-bold uppercase">Step {idx + 1}</span>
 </div>
 <div className="flex items-center gap-1">
 <Calendar className="w-3 h-3 text-slate-400"/>
 <span className="text-[9px] text-slate-400">Day {step.day}</span>
 </div>
 </div>
 <p className="text-xs font-medium truncate mt-1">{step.type === 'email' ? (step.subject || 'No Subject') : 'LinkedIn Message'}</p>
 <div className="flex items-center justify-between mt-2">
 <span className={`text-[8px] px-1 rounded uppercase font-bold ${step.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
 {step.status}
 </span>
 <button 
 onClick={(e) => { e.stopPropagation(); removeSequenceStep(idx); }}
 className="text-slate-400 hover:text-red-500 transition-colors"
 >
 <Trash2 className="w-3 h-3"/>
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Editor Area */}
 <div className="flex-1 flex flex-col">
 <div className="p-4 space-y-4 border-b ">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Type:</span>
 <select 
 value={sequences[selectedRecipientIndex]?.[selectedStepIndex]?.type || 'email'}
 onChange={(e) => updateSequenceStep(selectedStepIndex, { type: e.target.value as any })}
 className="text-xs bg-slate-100 border-none rounded px-2 py-1 outline-none"
 >
 <option value="email">Email</option>
 <option value="linkedin">LinkedIn</option>
 </select>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Day:</span>
 <input 
 type="number"
 value={sequences[selectedRecipientIndex]?.[selectedStepIndex]?.day || 1}
 onChange={(e) => updateSequenceStep(selectedStepIndex, { day: parseInt(e.target.value) })}
 className="w-12 text-xs bg-slate-100 border-none rounded px-2 py-1 outline-none"
 />
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">To:</span>
 <span className="text-xs font-bold text-[#0071E3]">
 {intelligence?.keyPeople?.[selectedRecipientIndex]?.name}
 </span>
 </div>
 </div>
 
 {sequences[selectedRecipientIndex]?.[selectedStepIndex]?.type === 'email' && (
 <div className="flex items-center gap-2 text-sm">
 <span className="text-slate-400 min-w-[60px]">Subject:</span>
 <input 
 className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium outline-none"
 type="text"
 value={emailSubject}
 onChange={(e) => {
 setEmailSubject(e.target.value);
 updateSequenceStep(selectedStepIndex, { subject: e.target.value });
 }}
 placeholder="Enter subject line..."
 />
 </div>
 )}
 </div>
 <div className="flex-1 p-0 text-sm text-slate-600 overflow-hidden flex flex-col">
 {isLoading || isGeneratingStep ? (
 <div className="flex items-center justify-center h-full">
 <div className="text-center">
 <Loader2 className="w-8 h-8 animate-spin text-[#0071E3] mx-auto mb-2"/>
 <p className="text-xs text-slate-500 animate-pulse">AI is crafting the perfect message...</p>
 </div>
 </div>
 ) : (
 <textarea
 value={emailDraft}
 onChange={(e) => {
 setEmailDraft(e.target.value);
 updateSequenceStep(selectedStepIndex, { content: e.target.value });
 }}
 className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 outline-none resize-none leading-relaxed no-scrollbar"
 placeholder={sequences[selectedRecipientIndex]?.[selectedStepIndex]?.type === 'email' ? "Draft your email here...": "Draft your LinkedIn message here..."}
 />
 )}
 </div>
 <div className="p-4 bg-slate-50 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button className="text-slate-400 hover:text-[#0071E3] transition-colors"title="Bold"><Bold className="w-4 h-4"/></button>
 <button className="text-slate-400 hover:text-[#0071E3] transition-colors"title="Italic"><Italic className="w-4 h-4"/></button>
 <button className="text-slate-400 hover:text-[#0071E3] transition-colors"title="Insert Link"><LinkIcon className="w-4 h-4"/></button>
 </div>
 <button 
 onClick={() => generateStepContent(selectedStepIndex)}
 disabled={isGeneratingStep}
 className="flex items-center gap-2 px-4 py-2 bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold rounded-lg hover:bg-[#0071E3]/20 transition-all disabled:opacity-50"
 >
 {isGeneratingStep ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
 {isGeneratingStep ? 'Generating...' : 'AI Personalize Step'}
 </button>
 </div>
 </div>
 </div>
 </section>
 </div>
 <div className="col-span-12 lg:col-span-4 space-y-6">
 {/* LinkedIn Conversation Intelligence */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <MessageCircle className="w-5 h-5 text-[#0A66C2]"/>
 LinkedIn Conversation Intelligence
 </h3>
 </div>
 <div className="p-5 space-y-4">
 <div className="p-3 bg-slate-50 rounded-lg ">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thread Analysis</span>
 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">High Interest</span>
 </div>
 <p className="text-xs text-slate-600 mb-2">
 "{intelligence?.keyPeople?.[selectedRecipientIndex]?.name.split(' ')[0] || 'The stakeholder'}'s recent activity suggests a strong focus on {intelligence?.keyPeople?.[selectedRecipientIndex]?.focus || 'market growth'}, with specific interest in {intelligence?.techStack?.[0] || 'modern infrastructure'}."
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="text-[10px] px-2 py-1 bg-white rounded text-slate-500">Sentiment: {intelligence?.sentiment || 'Positive'}</span>
 <span className="text-[10px] px-2 py-1 bg-white rounded text-slate-500">Focus: {intelligence?.keyPeople?.[selectedRecipientIndex]?.focus || 'Strategic'}</span>
 </div>
 </div>
 </div>
 </section>

 {/* Executive Voice Modeling */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Mic className="w-5 h-5 text-purple-500"/>
 Executive Voice Modeling
 </h3>
 </div>
 <div className="p-5 space-y-4">
 <div className="flex items-center gap-3 mb-2">
 <div className="size-8 rounded-full overflow-hidden bg-slate-200">
 <img src={`https://picsum.photos/seed/${intelligence?.keyPeople?.[selectedRecipientIndex]?.name || 'stakeholder'}/100/100`} alt="Stakeholder"referrerPolicy="no-referrer"/>
 </div>
 <div>
 <p className="text-sm font-bold">{intelligence?.keyPeople?.[selectedRecipientIndex]?.name || 'Stakeholder'}'s Style</p>
 <p className="text-xs text-slate-500">{intelligence?.keyPeople?.[selectedRecipientIndex]?.style || 'Professional, data-driven'}</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div className="p-2 bg-red-500/5 border border-red-500/20 rounded text-center">
 <p className="text-[10px] font-bold text-red-500 uppercase">Avoid</p>
 <p className="text-xs text-slate-600 mt-1">Generic greetings, long paragraphs</p>
 </div>
 <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded text-center">
 <p className="text-[10px] font-bold text-emerald-500 uppercase">Use</p>
 <p className="text-xs text-slate-600 mt-1">Direct ROI, bullet points, "{intelligence?.keyPeople?.[selectedRecipientIndex]?.name.split(' ')[0] || 'Hi'}"</p>
 </div>
 </div>
 </div>
 </section>

 {/* Engagement Timing Optimization */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <CalendarClock className="w-5 h-5 text-blue-500"/>
 Engagement Timing
 </h3>
 </div>
 <div className="p-5">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold text-slate-500">Best time to message {intelligence?.keyPeople?.[selectedRecipientIndex]?.name.split(' ')[0] || 'them'}:</span>
 <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Tue 9:00 AM</span>
 </div>
 <div className="h-16 flex items-end gap-1">
 {[20, 40, 30, 80, 90, 40, 20, 10, 50, 70, 60, 30].map((h, i) => (
 <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm relative group">
 <div className={`absolute bottom-0 w-full rounded-t-sm transition-all ${i === 4 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{height: `${h}%`}}></div>
 </div>
 ))}
 </div>
 <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
 <span>6AM</span>
 <span>12PM</span>
 <span>6PM</span>
 </div>
 </div>
 </section>


 {/* Top Hooks Section */}
 <section className="space-y-4">
 <h3 className="font-bold text-lg flex items-center gap-2">
 <Zap className="w-5 h-5 text-yellow-500"/>
 Top Hooks & Angles
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {isLoading ? (
 [1, 2, 3].map(i => (
 <div key={i} className="p-5 bg-white rounded-xl animate-pulse h-32"></div>
 ))
 ) : intelligence?.outreach_angles ? (
 intelligence.outreach_angles.map((angle: any, i: number) => (
 <div key={i} className="p-5 bg-white rounded-xl hover:border-[#0071E3] transition-colors cursor-pointer group ">
 <div className="flex justify-between items-start mb-3">
 <span className="bg-[#0071E3]/10 text-[#0071E3] text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">AI Angle</span>
 <span className="text-xs text-slate-500">Confidence: {Math.floor(Math.random() * 15) + 80}%</span>
 </div>
 <h4 className="font-bold mb-2 group-hover:text-[#0071E3] transition-colors line-clamp-1">{angle.strategy || angle}</h4>
 <p className="text-xs text-slate-500 line-clamp-3">{angle.draft || angle}</p>
 </div>
 ))
 ) : (
 <p className="text-slate-500 text-sm col-span-3 text-center py-10">No outreach angles generated.</p>
 )}
 </div>
 </section>
 
 {/* Engagement Timeline Engine */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Clock className="w-5 h-5 text-[#0071E3]"/>
 Engagement Timeline
 </h3>
 </div>
 <div className="p-5">
 <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
 <div className="relative flex items-start gap-4">
 <div className="size-10 rounded-full bg-[#0071E3] text-white flex items-center justify-center flex-shrink-0 z-10 ">
 1
 </div>
 <div className="pt-2">
 <p className="text-sm font-bold">Connect with Sarah Jenkins</p>
 <p className="text-xs text-slate-500 mt-1">Use the AI-generated "EMEA Expansion"hook via LinkedIn.</p>
 <p className="text-[10px] font-bold text-[#0071E3] uppercase mt-2">Today</p>
 </div>
 </div>
 <div className="relative flex items-start gap-4">
 <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 z-10 ">
 2
 </div>
 <div className="pt-2">
 <p className="text-sm font-bold text-slate-600">Email Mark Chen</p>
 <p className="text-xs text-slate-500 mt-1">Reference Sarah's initiative and offer the technical latency report.</p>
 <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Day 3</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* System Integrations */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Share2 className="w-5 h-5 text-[#0071E3]"/>
 System Integrations
 </h3>
 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Ready</span>
 </div>
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <button 
 onClick={() => showNotification('Connecting to Outlook...', 'info')}
 className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl hover:bg-blue-500/10 transition-all group"
 >
 <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
 <Mail className="w-4 h-4"/>
 </div>
 <div className="text-left">
 <p className="text-xs font-bold">Outlook</p>
 <p className="text-[9px] text-slate-500">Connect Mail</p>
 </div>
 </button>
 <button 
 onClick={() => showNotification('Connecting to Gmail...', 'info')}
 className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-all group"
 >
 <div className="size-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
 <Mail className="w-4 h-4"/>
 </div>
 <div className="text-left">
 <p className="text-xs font-bold">Gmail</p>
 <p className="text-[9px] text-slate-500">Connect Mail</p>
 </div>
 </button>
 </div>
 
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl ">
 <div className="flex items-center gap-3">
 <div className="size-8 rounded-lg bg-slate-200 flex items-center justify-center">
 <Calendar className="w-4 h-4 text-slate-500"/>
 </div>
 <div>
 <p className="text-xs font-bold">Calendar Sync</p>
 <p className="text-[9px] text-slate-500">Auto-book discovery calls</p>
 </div>
 </div>
 <button 
 onClick={() => showNotification('Calendar sync enabled!', 'success')}
 className="text-[10px] font-bold text-[#0071E3] hover:underline"
 >
 Enable
 </button>
 </div>
 
 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl ">
 <div className="flex items-center gap-3">
 <div className="size-8 rounded-lg bg-slate-200 flex items-center justify-center">
 <Bot className="w-4 h-4 text-slate-500"/>
 </div>
 <div>
 <p className="text-xs font-bold">AI Auto-Pilot</p>
 <p className="text-[9px] text-slate-500">Autonomous follow-ups</p>
 </div>
 </div>
 <div className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox"className="sr-only peer"/>
 <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0071E3]"></div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* CRM Export & Analytics */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Database className="w-5 h-5 text-[#0071E3]"/>
 CRM Export & Analytics
 </h3>
 </div>
 <div className="p-6 space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <button 
 onClick={() => showNotification('Exporting to HubSpot...', 'info')}
 className="flex items-center justify-center gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all group"
 >
 <div className="size-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xs">H</div>
 <div className="text-left">
 <p className="text-xs font-bold">Export to HubSpot</p>
 <p className="text-[10px] text-slate-500">Sync contacts & sequences</p>
 </div>
 </button>
 <button 
 onClick={() => showNotification('Exporting to Salesforce...', 'info')}
 className="flex items-center justify-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all group"
 >
 <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-xs">S</div>
 <div className="text-left">
 <p className="text-xs font-bold">Export to Salesforce</p>
 <p className="text-[10px] text-slate-500">Push to target accounts</p>
 </div>
 </button>
 </div>
 
 <div className="p-4 bg-slate-50 rounded-xl ">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Sequence Analytics</h4>
 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Live Tracking</span>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center">
 <p className="text-2xl font-black">42%</p>
 <p className="text-[10px] text-slate-500 uppercase font-bold">Open Rate</p>
 </div>
 <div className="text-center">
 <p className="text-2xl font-black">18%</p>
 <p className="text-[10px] text-slate-500 uppercase font-bold">Reply Rate</p>
 </div>
 <div className="text-center">
 <p className="text-2xl font-black">4</p>
 <p className="text-[10px] text-slate-500 uppercase font-bold">Meetings</p>
 </div>
 </div>
 </div>

 <button 
 onClick={() => showNotification('Downloading CSV...', 'info')}
 className="w-full py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
 >
 <Copy className="w-4 h-4"/>
 Download Full Account Data (CSV)
 </button>
 </div>
 </section>
 </div>
 </div>
 )}

 {activeTab === 'strategy' && (
 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12 lg:col-span-6 space-y-6">
 {/* AI Deal Strategy Engine */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Compass className="w-5 h-5 text-[#0071E3]"/>
 AI Deal Strategy Engine
 </h3>
 </div>
 <div className="p-5 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 bg-slate-50 rounded-lg ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Entry Point</h4>
 <p className="text-xs text-slate-600">Lead with the Edge Node Latency Report targeting Sarah Jenkins. Offer a free 14-day POV.</p>
 </div>
 <div className="p-4 bg-slate-50 rounded-lg ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Maximize className="w-3 h-3"/> Expansion Strategy</h4>
 <p className="text-xs text-slate-600">Once edge nodes are secured, leverage Mark Chen to pitch the full Zero-Trust suite for internal networks.</p>
 </div>
 <div className="p-4 bg-slate-50 rounded-lg ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500"/> Risk Factors</h4>
 <p className="text-xs text-slate-600">David Vance (Procurement) is actively looking to consolidate vendors. We must prove ROI quickly.</p>
 </div>
 <div className="p-4 bg-slate-50 rounded-lg ">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-orange-500"/> Likely Objections</h4>
 <p className="text-xs text-slate-600">"Implementation takes too long."(Counter with our 2-week deployment guarantee).</p>
 </div>
 </div>
 </div>
 </section>

 {/* Conversation Simulation (Elite Feature) */}
 <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl border border-slate-700 overflow-hidden shadow-xl relative">
 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
 <Bot className="w-32 h-32"/>
 </div>
 <div className="p-5 border-b border-slate-700/50 flex justify-between items-center relative z-10">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Gamepad2 className="w-5 h-5 text-purple-400"/>
 Conversation Simulation <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-widest border border-purple-500/30">Elite</span>
 </h3>
 </div>
 <div className="p-6 space-y-4 relative z-10">
 <p className="text-sm font-bold text-purple-300 mb-2">Simulate: "What will the CFO say?"</p>
 <div className="space-y-3">
 <div className="flex gap-3">
 <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-600">
 <User className="w-4 h-4 text-slate-300"/>
 </div>
 <div className="bg-slate-700/50 p-3 rounded-lg rounded-tl-none border border-slate-600/50 text-xs text-slate-200">
 "I see the technical value, but how does this impact our bottom line this quarter? We're trying to cut costs, not add new tools."
 </div>
 </div>
 <div className="flex gap-3 flex-row-reverse">
 <div className="size-8 rounded-full bg-[#0071E3] flex items-center justify-center flex-shrink-0 shadow-[#0071E3]/20">
 <Sparkles className="w-4 h-4 text-white"/>
 </div>
 <div className="bg-[#0071E3]/20 p-3 rounded-lg rounded-tr-none border border-[#0071E3]/30 text-xs text-white">
 "Great question. By reducing latency by 120ms, our data shows a 4% increase in conversion rates for your e-commerce nodes. This tool pays for itself in 45 days, effectively acting as a cost-reduction measure."
 </div>
 </div>
 </div>
 <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
 <button className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2">
 <Play className="w-3 h-3"/> Start Pitch Rehearsal
 </button>
 <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2">
 <ShieldAlert className="w-3 h-3"/> Practice Objections
 </button>
 </div>
 </div>
 </section>

 {/* Value Mapping Engine */}
 <section className="bg-white rounded-xl overflow-hidden h-full">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Target className="w-5 h-5 text-[#0071E3]"/>
 Value Mapping Engine
 </h3>
 </div>
 <div className="p-5 space-y-6">
 <div className="space-y-4">
 {intelligence?.valueMapping?.map((item: any, i: number) => (
 <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg ">
 <div className="flex-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Their Priority</p>
 <p className="text-sm font-bold">{item.priority}</p>
 </div>
 <div className="flex items-center justify-center pt-4">
 <ArrowLeft className="w-5 h-5 text-slate-300 rotate-180"/>
 </div>
 <div className="flex-1">
 <p className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest mb-1">Our Value</p>
 <p className="text-sm font-bold text-[#0071E3]">{item.value}</p>
 </div>
 </div>
 ))}
 {!intelligence?.valueMapping && (
 <div className="text-center py-4 text-slate-500 text-xs italic">
 No value mapping data available.
 </div>
 )}
 </div>
 <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
 <p className="text-xs font-bold text-blue-600 mb-2">Messaging Alignment</p>
 <p className="text-xs text-slate-600 leading-relaxed">
 Focus on {intelligence?.valueMapping?.[0]?.value || 'strategic alignment'} and {intelligence?.valueMapping?.[1]?.value || 'operational excellence'}.
 </p>
 </div>
 </div>
 </section>
 </div>
 <div className="col-span-12 lg:col-span-6 space-y-6">
 {/* Competitive Intelligence Layer */}
 <section className="bg-white rounded-xl overflow-hidden ">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <Swords className="w-5 h-5 text-[#0071E3]"/>
 Competitive Intelligence
 </h3>
 </div>
 <div className="p-5 space-y-6">
 {intelligence?.competitiveIntelligence?.recentMove && (
 <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
 <div>
 <p className="text-sm font-bold text-red-700 mb-1">Competitor Move Detected</p>
 <p className="text-xs text-slate-600 leading-relaxed">
 {intelligence.competitiveIntelligence.recentMove}
 </p>
 </div>
 </div>
 )}

 {/* Competitor Strengths */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-[#0071E3]"/>
 Competitor Strengths
 </h4>
 <ul className="space-y-2">
 <li className="flex items-start gap-2 text-sm text-slate-600">
 <span className="text-[#0071E3] mt-1">•</span>
 Established market presence and deep enterprise relationships.
 </li>
 <li className="flex items-start gap-2 text-sm text-slate-600">
 <span className="text-[#0071E3] mt-1">•</span>
 Comprehensive suite of legacy security integrations.
 </li>
 </ul>
 </div>

 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Positioning</h4>
 <ul className="space-y-2">
 {intelligence?.competitiveIntelligence?.positioning?.map((pos: string, i: number) => (
 <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
 <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5"/>
 {pos}
 </li>
 ))}
 {!intelligence?.competitiveIntelligence?.positioning && (
 <li className="text-xs text-slate-500 italic">No positioning suggestions available.</li>
 )}
 </ul>
 </div>

 {/* Competitor Weaknesses */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-[#0071E3]"/>
 Competitor Weaknesses
 </h4>
 <ul className="space-y-2">
 <li className="flex items-start gap-2 text-sm text-slate-600">
 <span className="text-[#0071E3] mt-1">•</span>
 Slow adoption of modern edge-native security standards.
 </li>
 <li className="flex items-start gap-2 text-sm text-slate-600">
 <span className="text-[#0071E3] mt-1">•</span>
 High operational complexity and maintenance overhead for proprietary middleware.
 </li>
 </ul>
 </div>

 {/* Competitor Tech Stack */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Competitor Tech Stack</h4>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded ">Legacy Security Standards</span>
 <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded ">Proprietary Middleware</span>
 <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded ">Monolithic Architecture</span>
 </div>
 </div>
 </div>
 </section>

 {/* Competitor Analysis Section */}
 <section className="bg-white rounded-xl overflow-hidden h-full">
 <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
 <h3 className="font-bold text-sm flex items-center gap-2">
 <ShieldAlert className="w-5 h-5 text-[#0071E3]"/>
 Competitor Analysis (vs. Signalz)
 </h3>
 </div>
 <div className="p-5 space-y-6">
 {intelligence?.competitors?.map((competitor: any, i: number) => (
 <div key={i} className="space-y-4 p-4 bg-slate-50 rounded-lg ">
 <div className="flex justify-between items-center">
 <h4 className="font-bold text-sm text-[#0071E3]">{competitor.name}</h4>
 <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded uppercase tracking-tighter">
 {competitor.marketShare} Market Share
 </span>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Strengths</p>
 <ul className="space-y-1">
 {competitor.strengths?.map((strength: string, sIdx: number) => (
 <li key={sIdx} className="text-[11px] text-slate-600 flex items-start gap-1">
 <span className="text-emerald-500 mt-0.5">•</span>
 {strength}
 </li>
 ))}
 {!competitor.strengths && <li className="text-[11px] text-slate-500 italic">No data</li>}
 </ul>
 </div>
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Weaknesses</p>
 <ul className="space-y-1">
 {competitor.weaknesses?.map((weakness: string, wIdx: number) => (
 <li key={wIdx} className="text-[11px] text-slate-600 flex items-start gap-1">
 <span className="text-red-500 mt-0.5">•</span>
 {weakness}
 </li>
 ))}
 {!competitor.weaknesses && <li className="text-[11px] text-slate-500 italic">No data</li>}
 </ul>
 </div>
 </div>
 
 <div className="pt-2 border-t ">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Our Advantage</p>
 <p className="text-xs text-slate-600 italic">"{competitor.advantage}"</p>
 </div>
 </div>
 ))}
 {!intelligence?.competitors && (
 <div className="text-center py-8 text-slate-500 text-xs italic">
 No competitor analysis data available.
 </div>
 )}
 </div>
 </section>
 </div>
 </div>
 )}
 {activeTab === 'org-chart' && (
 <div className="space-y-8">
 {/* Org Chart */}
 <div className="bg-white rounded-2xl overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-black text-[#1D1D1F]">Organizational Chart</h3>
 <p className="text-xs text-slate-400 font-medium mt-0.5">Leadership hierarchy at {companyName}</p>
 </div>
 <span className="text-xs font-black uppercase tracking-widest text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full">
 {intelligence?.keyPeople?.length || 0} Leaders
 </span>
 </div>
 <div className="p-4 overflow-x-auto">
 <OrgChart people={intelligence?.keyPeople || []} companyName={companyName} />
 </div>
 </div>

 {/* Relationship Chart */}
 <div className="bg-white rounded-2xl overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-black text-[#1D1D1F]">Relationship Map</h3>
 <p className="text-xs text-slate-400 font-medium mt-0.5">Key people and competitive landscape</p>
 </div>
 <span className="text-xs font-black uppercase tracking-widest text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full">
 Live Intelligence
 </span>
 </div>
 <div className="p-4">
 <RelationshipChart
 people={intelligence?.keyPeople || []}
 competitors={intelligence?.competitors || []}
 companyName={companyName}
 />
 </div>
 </div>

 {/* Key People Detail Cards */}
 <div className="bg-white rounded-2xl overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-100">
 <h3 className="text-lg font-black text-[#1D1D1F]">Decision Makers</h3>
 <p className="text-xs text-slate-400 font-medium mt-0.5">Who to approach and how</p>
 </div>
 <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {(intelligence?.keyPeople || []).map((person: any, i: number) => (
 <div key={i} className="p-4 rounded-xl bg-[#f6f6f8] hover:bg-[#0071E3]/5 transition-colors">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
 {person.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-black text-sm text-[#1D1D1F] truncate">{person.name}</h4>
 <p className="text-xs text-[#0071E3] font-bold truncate">{person.title}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${person.influence === 'High' ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-slate-200 text-slate-500'}`}>
 {person.influence}
 </span>
 <span className="text-[9px] text-slate-400 font-bold">Rank #{person.priorityRank}</span>
 </div>
 </div>
 </div>
 {person.hook && (
 <p className="mt-3 text-xs text-slate-500 leading-relaxed italic">"{person.hook}"</p>
 )}
 {person.linkedin && person.linkedin !== 'N/A' && (
 <a href={person.linkedin} target="_blank"rel="noopener noreferrer"
 className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#0071E3] hover:underline">
 <svg className="w-3 h-3"fill="currentColor"viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
 View Profile
 </a>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </main>
 
 {/* Footer Navigation */}
 <footer className="bg-white border-t py-6 px-8">
 <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-2 text-slate-400">
 <SignalHigh className="w-4 h-4"/>
 <span className="text-xs font-bold uppercase tracking-widest">Signalz Intelligence</span>
 </div>
 <nav className="flex items-center gap-6">
 <a href="#"className="text-xs font-bold text-slate-500 hover:text-[#0071E3] transition-colors">Privacy Policy</a>
 <a href="#"className="text-xs font-bold text-slate-500 hover:text-[#0071E3] transition-colors">Terms of Service</a>
 <a href="#"className="text-xs font-bold text-slate-500 hover:text-[#0071E3] transition-colors">Help Center</a>
 <a href="#"className="text-xs font-bold text-slate-500 hover:text-[#0071E3] transition-colors">API Documentation</a>
 </nav>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Lycoris Labs</p>
 </div>
 </footer>

 {/* LinkedIn Connection Modal */}
 <AnimatePresence>
 {isLinkedInModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
 >
 <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white">
 <Linkedin className="w-6 h-6"/>
 </div>
 <div>
 <h3 className="font-bold text-lg">Connect with {selectedStakeholder?.name}</h3>
 <p className="text-xs text-slate-500">{selectedStakeholder?.role} at {companyName}</p>
 </div>
 </div>
 <button 
 onClick={() => setIsLinkedInModalOpen(false)}
 className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-all"
 >
 <X className="w-5 h-5"/>
 </button>
 </div>
 
 <div className="p-6 space-y-6">
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
 AI Generated Connection Message
 {isGeneratingMessage && <Loader2 className="w-3 h-3 animate-spin text-[#0071E3]"/>}
 </label>
 <div className="relative group">
 <textarea 
 value={generatedMessage}
 onChange={(e) => setGeneratedMessage(e.target.value)}
 className="w-full h-40 p-4 bg-slate-50 rounded-xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#0071E3] transition-all resize-none"
 placeholder="Generating personalized message..."
 />
 <button 
 onClick={copyToClipboard}
 className="absolute bottom-3 right-3 p-2 bg-white rounded-lg hover: transition-all flex items-center gap-2 text-xs font-bold"
 >
 {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4 text-slate-400"/>}
 {isCopied ? 'Copied!' : 'Copy Message'}
 </button>
 </div>
 <p className="text-[10px] text-slate-500">
 Tip: LinkedIn connection requests have a 300 character limit.
 </p>
 </div>

 <div className="flex flex-col gap-3">
 <a 
 href={selectedStakeholder?.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[#0A66C2]/20 transition-all"
 >
 Open LinkedIn Profile
 <ExternalLink className="w-4 h-4"/>
 </a>
 <p className="text-center text-[11px] text-slate-500">
 Copy the message above, then click the button to open the profile and paste it into the connection request.
 </p>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Notifications */}
 <AnimatePresence>
 {notification && (
 <motion.div
 initial={{ opacity: 0, y: 50, x: '-50%' }}
 animate={{ opacity: 1, y: 0, x: '-50%' }}
 exit={{ opacity: 0, y: 50, x: '-50%' }}
 className="fixed bottom-8 left-1/2 z-50 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 min-w-[300px]"
 >
 {notification.type === 'success' ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400"/>
 ) : (
 <Info className="w-5 h-5 text-blue-400"/>
 )}
 <p className="text-sm font-bold">{notification.message}</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};
