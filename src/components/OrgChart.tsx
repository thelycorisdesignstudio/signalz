import React from 'react';
import { Mail, Linkedin, ChevronDown, ChevronUp } from 'lucide-react';

interface Person {
  name: string;
  title: string;
  linkedin?: string;
  hook?: string;
  influence?: string;
  priorityRank?: number;
}

interface OrgChartProps {
  people: Person[];
  companyName: string;
}

const COLORS = ['#0071E3', '#1D1D1F', '#0071E3'];

const OrgNode: React.FC<{ person: Person; isRoot?: boolean; children?: Person[] }> = ({ person, isRoot, children }) => {
  const [expanded, setExpanded] = React.useState(true);
  const initials = person.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex flex-col items-center p-5 bg-white rounded-2xl w-52 cursor-default transition-all hover:shadow-lg ${isRoot ? 'shadow-md ring-2 ring-[#0071E3]' : 'shadow-sm border border-slate-100'}`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 text-lg font-black text-white ${isRoot ? 'bg-[#0071E3]' : 'bg-[#1D1D1F]'}`}>
          {initials}
        </div>
        <h4 className="font-black text-sm text-center text-[#1D1D1F] leading-tight">{person.name}</h4>
        <p className="text-xs text-[#0071E3] font-bold text-center mt-1 leading-tight">{person.title}</p>
        {person.influence && (
          <span className={`mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${person.influence === 'High' ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-slate-100 text-slate-500'}`}>
            {person.influence} influence
          </span>
        )}
        <div className="flex gap-2 mt-3">
          {person.linkedin && person.linkedin !== 'N/A' && (
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
              className="p-1.5 bg-slate-50 hover:bg-[#0071E3]/10 rounded-lg text-slate-400 hover:text-[#0071E3] transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
          <button className="p-1.5 bg-slate-50 hover:bg-[#0071E3]/10 rounded-lg text-slate-400 hover:text-[#0071E3] transition-colors">
            <Mail className="w-3.5 h-3.5" />
          </button>
        </div>

        {children && children.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#0071E3] hover:border-[#0071E3] transition-colors z-20 shadow-sm"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {expanded && children && children.length > 0 && (
        <div className="relative pt-8 flex justify-center">
          <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
          <div className="flex gap-6 relative">
            {children.map((child, idx) => (
              <div key={idx} className="relative pt-8 flex flex-col items-center">
                {children.length > 1 && (
                  <div className={`absolute top-0 h-px bg-slate-200 ${idx === 0 ? 'left-1/2 right-0' : idx === children.length - 1 ? 'left-0 right-1/2' : 'left-0 right-0'}`} />
                )}
                <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                <OrgNode person={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ people, companyName }) => {
  if (!people || people.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 font-medium">
        No org data available
      </div>
    );
  }

  // Sort by priority rank — highest priority (lowest number) is root
  const sorted = [...people].sort((a, b) => (a.priorityRank || 99) - (b.priorityRank || 99));
  const root = sorted[0];
  const tier2 = sorted.slice(1, 4);
  const tier3 = sorted.slice(4);

  return (
    <div className="p-8 overflow-x-auto bg-[#f6f6f8] rounded-2xl flex justify-center min-h-[400px]">
      <div className="min-w-max pb-12">
        <div className="text-center mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">{companyName} — Leadership</span>
        </div>
        <OrgNode person={root} isRoot={true} children={tier2} />
        {tier3.length > 0 && (
          <div className="mt-8 flex gap-6 justify-center">
            {tier3.map((p, i) => <OrgNode key={i} person={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};
