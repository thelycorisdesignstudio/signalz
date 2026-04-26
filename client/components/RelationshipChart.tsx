import React from 'react';
import { User, Building2 } from 'lucide-react';

interface Person {
  name: string;
  title: string;
  linkedin?: string;
  influence?: string;
}

interface Competitor {
  name: string;
  marketShare?: string;
  advantage?: string;
}

interface RelationshipChartProps {
  people: Person[];
  competitors: Competitor[];
  companyName: string;
}

export const RelationshipChart: React.FC<RelationshipChartProps> = ({ people, competitors, companyName }) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Build nodes: company center, people around top, competitors around bottom
  const centerX = 50;
  const centerY = 45;

  const peopleNodes = (people || []).slice(0, 5).map((p, i) => {
    const total = Math.min(people.length, 5);
    const angle = (i / total) * Math.PI - Math.PI / 2; // spread across top
    const radius = 32;
    return {
      id: `person-${i}`,
      label: p.name,
      subLabel: p.title,
      type: 'person' as const,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle) - 10,
    };
  });

  const compNodes = (competitors || []).slice(0, 3).map((c, i) => {
    const total = Math.min(competitors.length, 3);
    const angle = (i / (total - 0.5)) * Math.PI + Math.PI / 6;
    const radius = 30;
    return {
      id: `comp-${i}`,
      label: c.name,
      subLabel: c.marketShare || 'Competitor',
      type: 'company' as const,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle) + 5,
    };
  });

  const allNodes = [...peopleNodes, ...compNodes];

  return (
    <div className="bg-[#f6f6f8] rounded-2xl p-4 overflow-hidden" style={{ height: 480 }}>
      <div className="text-center mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{companyName} — Relationship Map</span>
      </div>
      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="20" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#CBD5E1" />
            </marker>
          </defs>
          {/* Lines from center company to all nodes */}
          {allNodes.map((node) => (
            <line
              key={node.id}
              x1={`${centerX}%`} y1={`${centerY}%`}
              x2={`${node.x}%`} y2={`${node.y}%`}
              stroke={hoveredId === node.id ? '#0071E3' : '#E2E8F0'}
              strokeWidth={hoveredId === node.id ? 2 : 1.5}
              strokeDasharray={node.type === 'company' ? '6,4' : 'none'}
              markerEnd="url(#arrow)"
            />
          ))}
        </svg>

        {/* Center company node */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          style={{ left: `${centerX}%`, top: `${centerY}%` }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0071E3] flex items-center justify-center shadow-lg shadow-[#0071E3]/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="mt-2 bg-white px-3 py-1 rounded-xl shadow-sm text-center">
            <p className="text-xs font-black text-[#1D1D1F] whitespace-nowrap">{companyName}</p>
            <p className="text-[9px] text-[#0071E3] font-bold">Target Account</p>
          </div>
        </div>

        {/* Person and company nodes */}
        {allNodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 ${
              node.type === 'person'
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-white border-2 border-slate-200 text-slate-500'
            }`}>
              {node.type === 'person'
                ? <span className="text-xs font-black">{node.label.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</span>
                : <Building2 className="w-5 h-5" />
              }
            </div>
            <div className="mt-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-center max-w-[100px]">
              <p className="text-[10px] font-black text-[#1D1D1F] leading-tight truncate">{node.label}</p>
              <p className="text-[9px] text-slate-400 leading-tight truncate">{node.subLabel}</p>
            </div>
            {node.type === 'company' && (
              <span className="text-[8px] font-black uppercase tracking-widest text-red-400 mt-0.5">Competitor</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
