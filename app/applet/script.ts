import fs from 'fs';

const content = fs.readFileSync('/src/components/AccountBriefPage.tsx', 'utf-8');

const startStr = `          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Intelligence, Hooks & Activity Feed */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Intelligence Summary */}`;

const endStr = `                </button>
              </section>
            </div>
          </div>`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find start or end string');
  process.exit(1);
}

const originalBlock = content.substring(startIndex, endIndex);

// Extract sections
const extractSection = (startMarker, endMarker) => {
  const sIdx = originalBlock.indexOf(startMarker);
  const eIdx = originalBlock.indexOf(endMarker, sIdx);
  if (sIdx === -1 || eIdx === -1) return '';
  return originalBlock.substring(sIdx, eIdx);
};

const intelligenceSummary = extractSection('{/* Intelligence Summary */}', '{/* Internal Notes Section */}');
const internalNotes = extractSection('{/* Internal Notes Section */}', '{/* Company Activity Feed */}');
const companyActivityFeed = extractSection('{/* Company Activity Feed */}', '{/* Top Hooks Section */}');
const topHooks = extractSection('{/* Top Hooks Section */}', '{/* Email Editor Area */}');
const emailEditor = extractSection('{/* Email Editor Area */}', '{/* Right: Stakeholder Map & Signals */}');
const stakeholderMap = extractSection('{/* Stakeholder Map with Insights */}', '{/* Recent Signals Feed */}');
const recentSignalsFeed = extractSection('{/* Recent Signals Feed */}', '            </div>\\n          </div>');

const newContent = `          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'stakeholders', label: 'Stakeholders' },
              { id: 'outreach', label: 'Outreach' },
              { id: 'strategy', label: 'Strategy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`pb-3 text-sm font-bold border-b-2 transition-colors \${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }\`}
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
                  \${intelligenceSummary.trim()}
                  \${internalNotes.trim()}
                  \${companyActivityFeed.trim()}
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  \${recentSignalsFeed.trim()}
                </div>
              </div>
            )}

            {activeTab === 'stakeholders' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  \${stakeholderMap.trim()}
                  
                  {/* Multi-Threading Intelligence */}
                  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Multi-Threading Intelligence
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-1">Coverage Gap Detected</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">You are only connected to 1/5 key decision-makers in the Cloud Infrastructure buying group.</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Connections</h4>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <img src="https://picsum.photos/seed/cto/100/100" alt="CTO" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">Michael Chang</p>
                              <p className="text-xs text-slate-500">Chief Technology Officer</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-primary hover:underline">Connect</button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* LinkedIn Behavioral Intelligence */}
                  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <ActivitySquare className="w-5 h-5 text-primary" />
                        Behavioral Intelligence
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Influence Clusters</h4>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <span className="font-bold text-slate-900 dark:text-slate-100">Sarah Jenkins (VP Cloud)</span> is heavily influenced by external advisors. She frequently engages with posts from Gartner analysts and AWS solution architects.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engagement Patterns</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Clock className="w-4 h-4 text-slate-400" />
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
                  \${emailEditor.trim()}
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  \${topHooks.trim()}
                  
                  {/* Engagement Timeline Engine */}
                  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Engagement Timeline
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        <div className="relative flex items-start gap-4">
                          <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                            1
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-bold">Connect with Sarah Jenkins</p>
                            <p className="text-xs text-slate-500 mt-1">Use the AI-generated "EMEA Expansion" hook via LinkedIn.</p>
                            <p className="text-[10px] font-bold text-primary uppercase mt-2">Today</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 z-10 shadow-sm border border-slate-200 dark:border-slate-700">
                            2
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Email Mark Chen</p>
                            <p className="text-xs text-slate-500 mt-1">Reference Sarah's initiative and offer the technical latency report.</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Day 3</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6 space-y-6">
                  {/* Value Mapping Engine */}
                  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Value Mapping Engine
                      </h3>
                    </div>
                    <div className="p-5 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Their Priority</p>
                            <p className="text-sm font-bold">EMEA Market Expansion</p>
                          </div>
                          <div className="flex items-center justify-center pt-4">
                            <ArrowLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 rotate-180" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Our Value</p>
                            <p className="text-sm font-bold text-primary">Localized Edge Nodes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Their Priority</p>
                            <p className="text-sm font-bold">Vendor Consolidation</p>
                          </div>
                          <div className="flex items-center justify-center pt-4">
                            <ArrowLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 rotate-180" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Our Value</p>
                            <p className="text-sm font-bold text-primary">All-in-one Infrastructure Platform</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">Messaging Alignment</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Use terms like "latency reduction", "zero-trust", and "OpEx optimization". Avoid "digital transformation" as it's not present in their recent communications.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="col-span-12 lg:col-span-6 space-y-6">
                  {/* Competitive Intelligence Layer */}
                  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Swords className="w-5 h-5 text-primary" />
                        Competitive Intelligence
                      </h3>
                    </div>
                    <div className="p-5 space-y-6">
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Competitor Move Detected</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Their main competitor, TechCorp, just adopted a new edge security standard. Use this as an urgency angle in your outreach.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Positioning</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            Highlight our faster deployment time (2 weeks vs competitor's 6 weeks).
                          </li>
                          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                            Emphasize native integration with their existing AWS stack.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>`;

const finalContent = content.substring(0, startIndex) + newContent + content.substring(endIndex);
fs.writeFileSync('/src/components/AccountBriefPage.tsx', finalContent);
console.log('File updated successfully');
