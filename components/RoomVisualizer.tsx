
import React from 'react';
import { SleepingUnit, RSVPGroup, RoomAssignment, RSVPStatus } from '../types';

interface Props {
  rooms: SleepingUnit[];
  groups: RSVPGroup[];
  assignments: RoomAssignment[];
  isHostView?: boolean;
  onManualAssign?: (groupId: string, roomId: string) => void;
  unassignedGroups?: RSVPGroup[];
}

const RoomVisualizer: React.FC<Props> = ({ 
  rooms, 
  groups, 
  assignments, 
  isHostView = false, 
  onManualAssign,
  unassignedGroups = []
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-800">The Bed Situation 🛌</h3>
          <p className="text-slate-500 text-sm font-medium">Where everyone is crashing for the weekend.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const roomAssignments = assignments.filter((a) => a.roomId === room.id);
          const assignedGroups = roomAssignments.map((a) => groups.find((g) => g.id === a.groupId)).filter(Boolean) as RSVPGroup[];
          const currentOccupancy = assignedGroups.reduce((acc, g) => acc + g.members.length, 0);
          const isOverCapacity = currentOccupancy > room.capacity;

          return (
            <div 
              key={room.id} 
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col ${
                room.isHostRoom 
                  ? 'bg-slate-50 border-slate-200 opacity-90' 
                  : assignedGroups.length > 0 
                    ? (isOverCapacity ? 'bg-rose-50 border-rose-200' : 'bg-indigo-50 border-indigo-200')
                    : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-slate-800 leading-tight">{room.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {room.beds.join(' + ')}
                  </p>
                </div>
                {room.isHostRoom && (
                  <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full">BRIAN & ME</span>
                )}
              </div>

              {room.isHostRoom ? (
                <div className="text-slate-400 text-sm italic py-4 flex items-center gap-2">
                  <span>🏠</span> The hosts are here!
                </div>
              ) : (
                <div className="space-y-3 flex-grow">
                  {assignedGroups.length === 0 ? (
                    <div className="text-slate-300 text-sm py-4 italic">Empty for now!</div>
                  ) : (
                    assignedGroups.map((group) => (
                      <div key={group.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-in zoom-in-95 duration-300 relative">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800">{group.contactName}</span>
                            {group.status === RSVPStatus.MAYBE && (
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter italic">Tentative ({group.likelihood}%)</span>
                            )}
                          </div>
                          <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{group.members.length} Total</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {group.members.map((m, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100" title={m.category}>
                              {m.name || m.category}
                            </span>
                          ))}
                        </div>
                        {isHostView && onManualAssign && (
                          <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                            <select
                              className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border-none focus:ring-1 focus:ring-indigo-400 outline-none cursor-pointer"
                              onChange={(e) => onManualAssign(group.id, e.target.value)}
                              value={room.id}
                            >
                              <option value="">Move to...</option>
                              {rooms.filter(r => !r.isHostRoom).map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                              <option value="none">Unassign</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {isHostView && !room.isHostRoom && onManualAssign && unassignedGroups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <select
                    className="w-full text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border-none focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) onManualAssign(e.target.value, room.id);
                      e.target.value = "";
                    }}
                  >
                    <option value="">+ Manually Assign Guest</option>
                    {unassignedGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.contactName} ({g.members.length})</option>
                    ))}
                  </select>
                </div>
              )}

              {!room.isHostRoom && assignedGroups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center">
                  <span className={`text-[11px] font-black ${isOverCapacity ? 'text-rose-600' : 'text-slate-400'}`}>
                    BEDS: {currentOccupancy} / {room.capacity}
                  </span>
                  {isOverCapacity && (
                    <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-black">A BIT COZY!</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomVisualizer;
