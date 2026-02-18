
import React, { useState, useEffect } from 'react';
import { RSVPGroup, RSVPStatus, RoomAssignment } from './types';
import { HOUSE_UNITS } from './constants';
import RSVPForm from './components/RSVPForm';
import Dashboard from './components/Dashboard';
import RoomVisualizer from './components/RoomVisualizer';
import { getSmartAssignments } from './services/geminiService';

const LIKELIHOOD_THRESHOLD = 70;

const App: React.FC = () => {
  const [view, setView] = useState<'rsvp' | 'host'>('rsvp');
  const [groups, setGroups] = useState<RSVPGroup[]>(() => {
    const saved = localStorage.getItem('stay_rsvp_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [assignments, setAssignments] = useState<RoomAssignment[]>(() => {
    const saved = localStorage.getItem('stay_rsvp_assignments');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{ reasoning: string; conflicts: string[] } | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('stay_rsvp_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('stay_rsvp_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const handleRSVPSubmit = async (group: RSVPGroup) => {
    let newGroups;
    if (editingGroupId) {
      newGroups = groups.map(g => g.id === editingGroupId ? group : g);
      setEditingGroupId(null);
    } else {
      newGroups = [...groups, group];
    }
    setGroups(newGroups);
    
    // Auto-recalculate if it's a significant RSVP
    if (group.status === RSVPStatus.YES || (group.likelihood || 0) >= LIKELIHOOD_THRESHOLD) {
      await runSmartAssignments(newGroups);
    }
  };

  const runSmartAssignments = async (currentGroups: RSVPGroup[]) => {
    setIsAiLoading(true);
    const candidates = currentGroups.filter(g => 
      g.status === RSVPStatus.YES || 
      (g.status === RSVPStatus.MAYBE && (g.likelihood || 0) >= LIKELIHOOD_THRESHOLD)
    );
    
    const result = await getSmartAssignments(candidates, HOUSE_UNITS);
    if (result) {
      setAssignments(result.assignments);
      setAiReport({ reasoning: result.reasoning, conflicts: result.conflicts });
    }
    setIsAiLoading(false);
  };

  const handleManualAssign = (groupId: string, roomId: string) => {
    let newAssignments = [...assignments].filter(a => a.groupId !== groupId);
    if (roomId !== "none") {
      newAssignments.push({ groupId, roomId });
    }
    setAssignments(newAssignments);
  };

  const clearData = () => {
    if (confirm("Reset everything? All RSVPs will be lost!")) {
      setGroups([]);
      setAssignments([]);
      setAiReport(null);
    }
  };

  const roomGuests = groups.filter(g => 
    g.status === RSVPStatus.YES || 
    (g.status === RSVPStatus.MAYBE && (g.likelihood || 0) >= LIKELIHOOD_THRESHOLD)
  );

  const unassignedGuests = roomGuests.filter(g => !assignments.some(a => a.groupId === g.id));
  const editingGroup = groups.find(g => g.id === editingGroupId);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-amber-200">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <span className="text-2xl">🌲</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">Brian's Weekend</h1>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Gunstock Acres Hangout</p>
            </div>
          </div>
          <nav className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            <button 
              onClick={() => { setView('rsvp'); setEditingGroupId(null); }}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${view === 'rsvp' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              RSVP HERE
            </button>
            <button 
              onClick={() => setView('host')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${view === 'host' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              COMMAND CENTER
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10">
        {view === 'rsvp' ? (
          <div className="space-y-12">
            <RSVPForm 
              onSubmit={handleRSVPSubmit} 
              initialData={editingGroup} 
              onCancel={editingGroupId ? () => setEditingGroupId(null) : undefined} 
            />
            
            {!editingGroupId && groups.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Your Submissions</h3>
                <div className="space-y-4">
                  {groups.map(g => (
                    <div key={g.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${g.status === RSVPStatus.YES ? 'bg-green-50 text-green-600' : g.status === RSVPStatus.NO ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                          {g.status === RSVPStatus.YES ? '✅' : g.status === RSVPStatus.NO ? '❌' : '🤔'}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{g.contactName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{g.members.length} People</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setEditingGroupId(g.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Dashboard groups={groups} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Host Dashboard</h2>
                <p className="text-slate-500 font-medium">Sorting out the Gunstock details.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => runSmartAssignments(groups)}
                  disabled={isAiLoading || roomGuests.length === 0}
                  className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-black flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAiLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Thinking...
                    </span>
                  ) : (
                    <>✨ Sort the Beds</>
                  )}
                </button>
                <button 
                  onClick={clearData}
                  className="px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-2xl font-black hover:text-rose-600 hover:border-rose-200 transition-all text-xs"
                >
                  Reset
                </button>
              </div>
            </div>

            {aiReport && (
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border-l-8 border-indigo-500 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="font-black text-indigo-900 uppercase tracking-widest text-xs">The Matchmaker's Plan</h3>
                </div>
                <p className="text-xl font-medium text-slate-700 leading-relaxed italic">"{aiReport.reasoning}"</p>
                <div className="mt-2 text-xs font-bold text-slate-400 italic">
                  * Note: This plan includes "Maybe" guests with &gt;70% likelihood.
                </div>
                {aiReport.conflicts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="font-black text-rose-500 mb-2 uppercase tracking-widest text-[10px]">Things to watch out for:</p>
                    <ul className="space-y-1">
                      {aiReport.conflicts.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <RoomVisualizer 
              rooms={HOUSE_UNITS} 
              groups={roomGuests} 
              assignments={assignments}
              isHostView={view === 'host'}
              onManualAssign={handleManualAssign}
              unassignedGroups={unassignedGuests}
            />

            <div className="mt-16 bg-slate-200/30 p-10 rounded-[3rem]">
              <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">The "Maybe" Queue 🤔</h3>
              {groups.filter(g => g.status === RSVPStatus.MAYBE).length === 0 ? (
                <div className="p-12 bg-white/50 border-4 border-dashed border-white rounded-[2rem] text-center text-slate-400 font-bold italic">
                  Everyone has picked a side!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.filter(g => g.status === RSVPStatus.MAYBE).map(g => (
                    <div key={g.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-slate-800 text-lg">{g.contactName}</h4>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full uppercase">Thinking</span>
                          <span className="text-sm font-black text-amber-600 mt-1">{g.likelihood}% Likelihood</span>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {g.members.map((m, i) => (
                          <div key={i} className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            <span className="text-slate-300">•</span> {m.name || m.category}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center border-t pt-4">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          RSVP'D: {new Date(g.submittedAt).toLocaleDateString()}
                        </div>
                        {(g.likelihood || 0) >= LIKELIHOOD_THRESHOLD && (
                          <span className="text-[8px] bg-indigo-100 text-indigo-600 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Roomed (Likely)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-24 text-center py-12 border-t border-slate-100">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
          Brian's Gunstock Acres Weekend Hangouts
        </p>
      </footer>
    </div>
  );
};

export default App;
