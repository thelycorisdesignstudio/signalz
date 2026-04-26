import React, { useState, useEffect } from 'react';
import { Activity, Brain, Users, Mail, Star, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  company?: string;
  created_at: number;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  research: { icon: <Brain className="w-3.5 h-3.5" />, color: 'text-[#0071E3]', bg: 'bg-[#0071E3]/10' },
  lead: { icon: <Users className="w-3.5 h-3.5" />, color: 'text-green-600', bg: 'bg-green-50' },
  email: { icon: <Mail className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  watchlist: { icon: <Star className="w-3.5 h-3.5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export const ActivityFeed: React.FC = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/activity?limit=12');
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="bg-white rounded-3xl p-6 animate-pulse space-y-4">
      <div className="h-5 bg-slate-100 rounded w-32" />
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0071E3]" />
          <h3 className="text-sm font-black text-[#1D1D1F]">Activity Feed</h3>
        </div>
        <button onClick={load} className="p-1.5 text-slate-400 hover:text-[#0071E3] transition-colors rounded-lg hover:bg-[#0071E3]/5">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <Activity className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">No activity yet</p>
          <p className="text-xs text-slate-300 mt-1">Search a company to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          <AnimatePresence>
            {items.map((item, i) => {
              const cfg = typeConfig[item.type] || typeConfig.research;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-6 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-7 h-7 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#1D1D1F] truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-[10px] text-slate-400 font-medium truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-300 font-bold flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(item.created_at)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
