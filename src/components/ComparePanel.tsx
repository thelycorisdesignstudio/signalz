import React, { useState } from 'react';
import { X, Search, Loader2, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAccountIntelligence } from '../services/ai';

interface ComparePanelProps {
  baseCompany: any; // already-loaded intelligence result
  baseQuery: string;
  onClose: () => void;
}

const CompareRow: React.FC<{ label: string; a: any; b: any; highlight?: boolean }> = ({ label, a, b, highlight }) => (
  <div className={`grid grid-cols-3 gap-4 py-3 ${highlight ? 'bg-[#0071E3]/5 rounded-xl px-3' : ''}`}
    style={highlight ? {} : { borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
    <div className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">{label}</div>
    <div className="text-sm font-bold text-[#1D1D1F]">{a ?? <span className="text-slate-300">—</span>}</div>
    <div className="text-sm font-bold text-[#1D1D1F]">{b ?? <span className="text-slate-300">—</span>}</div>
  </div>
);

const ScoreBar: React.FC<{ label: string; scoreA: number; scoreB: number }> = ({ label, scoreA, scoreB }) => {
  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        {winner !== 'tie' && (
          <span className="text-[9px] font-black uppercase tracking-widest text-[#0071E3]">
            {winner === 'A' ? '← Wins' : 'Wins →'}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-500">Co. A</span>
            <span className="font-black text-[#1D1D1F]">{scoreA}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <motion.div initial={{ width: 0 }} animate={{ width: `${scoreA}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-2 rounded-full" style={{ backgroundColor: winner === 'A' ? '#22c55e' : winner === 'B' ? '#ef4444' : '#94a3b8' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-500">Co. B</span>
            <span className="font-black text-[#1D1D1F]">{scoreB}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <motion.div initial={{ width: 0 }} animate={{ width: `${scoreB}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="h-2 rounded-full" style={{ backgroundColor: winner === 'B' ? '#22c55e' : winner === 'A' ? '#ef4444' : '#94a3b8' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComparePanel: React.FC<ComparePanelProps> = ({ baseCompany, baseQuery, onClose }) => {
  const [compareQuery, setCompareQuery] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareQuery.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await getAccountIntelligence(compareQuery);
      setCompareResult(result);
    } catch {
      setError('Could not load company data. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const a = baseCompany;
  const b = compareResult;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div>
          <h3 className="text-lg font-black text-[#1D1D1F]">Compare Companies</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Side-by-side intelligence analysis</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-[#1D1D1F] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8">
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div />
          <div className="bg-[#0071E3]/5 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-black text-sm">
              {a?.company?.name?.charAt(0) || 'A'}
            </div>
            <h4 className="text-sm font-black text-[#1D1D1F]">{a?.company?.name || baseQuery}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a?.company?.industry || 'Current'}</p>
          </div>
          <div className={`rounded-2xl p-4 text-center ${b ? 'bg-[#f6f6f8]' : 'bg-slate-50'}`}>
            {b ? (
              <>
                <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-black text-sm">
                  {b?.company?.name?.charAt(0) || 'B'}
                </div>
                <h4 className="text-sm font-black text-[#1D1D1F]">{b?.company?.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{b?.company?.industry}</p>
              </>
            ) : (
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input value={compareQuery} onChange={e => setCompareQuery(e.target.value)}
                    placeholder="Search company..."
                    className="w-full pl-8 pr-3 py-2 bg-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20" />
                </div>
                <button type="submit" disabled={isLoading || !compareQuery.trim()}
                  className="w-full py-2 bg-[#0071E3] text-white rounded-xl text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1">
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Search className="w-3 h-3" /> Compare</>}
                </button>
                {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {!b && !isLoading && (
          <div className="text-center py-8 text-slate-400">
            <ArrowRight className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Search a second company to compare</p>
          </div>
        )}

        {b && (
          <div className="space-y-6">
            {/* Score comparison */}
            <div className="space-y-4">
              <ScoreBar label="Health Score" scoreA={a?.company?.healthScore || 0} scoreB={b?.company?.healthScore || 0} />
              <ScoreBar label="Intent Score" scoreA={a?.company?.intentScore?.score || 0} scoreB={b?.company?.intentScore?.score || 0} />
            </div>

            {/* Key metrics */}
            <div className="space-y-0">
              <CompareRow label="Industry" a={a?.company?.industry} b={b?.company?.industry} />
              <CompareRow label="Size" a={a?.company?.size} b={b?.company?.size} />
              <CompareRow label="HQ" a={a?.company?.headquarters} b={b?.company?.headquarters} />
              <CompareRow label="Revenue" a={a?.financials?.revenue} b={b?.financials?.revenue} highlight />
              <CompareRow label="Growth" a={a?.financials?.growth} b={b?.financials?.growth} />
              <CompareRow label="Sentiment" a={a?.company?.sentiment} b={b?.company?.sentiment} />
              <CompareRow label="Risk Level" a={a?.company?.riskLevel} b={b?.company?.riskLevel} />
            </div>

            {/* Tech Stack comparison */}
            {(a?.techStack?.length > 0 || b?.techStack?.length > 0) && (
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tech Stack</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-wrap gap-1">
                    {(a?.techStack || []).map((t: string, i: number) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(b?.techStack || []).includes(t) ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-[#f6f6f8] text-slate-500'}`}>{t}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(b?.techStack || []).map((t: string, i: number) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(a?.techStack || []).includes(t) ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-[#f6f6f8] text-slate-500'}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-2">Blue = shared technologies</p>
              </div>
            )}

            {/* Key people */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Key People</div>
                {(a?.keyPeople || []).slice(0, 3).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] text-[8px] font-black flex-shrink-0">
                      {p.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1D1D1F] leading-tight">{p.name}</p>
                      <p className="text-[9px] text-slate-400">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Key People</div>
                {(b?.keyPeople || []).slice(0, 3).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#1D1D1F]/10 flex items-center justify-center text-[#1D1D1F] text-[8px] font-black flex-shrink-0">
                      {p.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1D1D1F] leading-tight">{p.name}</p>
                      <p className="text-[9px] text-slate-400">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-[#f6f6f8] rounded-2xl p-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">AI Verdict</div>
              {(() => {
                const aScore = (a?.company?.healthScore || 0) + (a?.company?.intentScore?.score || 0);
                const bScore = (b?.company?.healthScore || 0) + (b?.company?.intentScore?.score || 0);
                const winner = aScore > bScore ? a?.company?.name : b?.company?.name;
                const diff = Math.abs(aScore - bScore);
                return (
                  <p className="text-sm font-bold text-[#1D1D1F]">
                    <span className="text-[#0071E3]">{winner}</span> scores higher overall by {diff} points.
                    {diff < 20 ? ' Both are strong targets — prioritize by deal size.' : ' Focus your outreach here first.'}
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
