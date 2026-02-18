
import React from 'react';
import { RSVPGroup, RSVPStatus, GuestCategory } from '../types';
import { TOTAL_CAPACITY } from '../constants';

interface Props {
  groups: RSVPGroup[];
}

const Dashboard: React.FC<Props> = ({ groups }) => {
  const confirmedGroups = groups.filter(g => g.status === RSVPStatus.YES);
  const maybeGroups = groups.filter(g => g.status === RSVPStatus.MAYBE);
  
  const totalConfirmedGuests = confirmedGroups.reduce((acc, g) => acc + g.members.length, 0);
  
  // Calculate expected headcount based on weighted likelihood
  const expectedHeadcount = groups.reduce((acc, g) => {
    const probability = (g.likelihood || (g.status === RSVPStatus.YES ? 100 : 0)) / 100;
    return acc + (g.members.length * probability);
  }, 0);

  const stats = {
    adults: confirmedGroups.reduce((acc, g) => acc + g.members.filter(m => m.category === GuestCategory.ADULT).length, 0),
    teens: confirmedGroups.reduce((acc, g) => acc + g.members.filter(m => m.category === GuestCategory.TEEN_TWEEN).length, 0),
    kids: confirmedGroups.reduce((acc, g) => acc + g.members.filter(m => m.category === GuestCategory.CHILD).length, 0),
    babies: confirmedGroups.reduce((acc, g) => acc + g.members.filter(m => m.category === GuestCategory.BABY).length, 0),
    dogs: confirmedGroups.reduce((acc, g) => acc + g.members.filter(m => m.category === GuestCategory.DOG).length, 0),
  };

  const occupancyPercent = Math.min(Math.round((totalConfirmedGuests / TOTAL_CAPACITY) * 100), 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* House Fullness */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Confirmed Guests</h3>
          <p className="text-4xl font-black text-slate-800">{totalConfirmedGuests} <span className="text-lg text-slate-300 font-medium">/ {TOTAL_CAPACITY}</span></p>
          <p className="text-slate-400 text-[10px] mt-1 italic">Definite "Yes" RSVPs only.</p>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${occupancyPercent > 85 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
              style={{ width: `${occupancyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expected Attendance */}
      <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-between text-white">
        <div>
          <h3 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-2">Projected Crowd</h3>
          <p className="text-4xl font-black">~{Math.round(expectedHeadcount)}</p>
          <p className="text-indigo-200/60 text-[10px] mt-1 italic font-medium">Statistically likely headcount.</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-tight">Updating Live</span>
        </div>
      </div>

      {/* The Crew */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Confirmed Breakdown</h3>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 border border-slate-100">👤 {stats.adults}</div>
          <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 border border-slate-100">🎧 {stats.teens}</div>
          <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 border border-slate-100">⚽ {stats.kids}</div>
          <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 border border-slate-100">🍼 {stats.babies}</div>
          <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 border border-slate-100">🐕 {stats.dogs}</div>
        </div>
      </div>

      {/* Maybe Queue Banner */}
      {maybeGroups.length > 0 && (
        <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-100 col-span-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤔</span>
            <div>
              <h3 className="text-amber-800 text-sm font-black uppercase tracking-widest leading-none">The Maybe Queue</h3>
              <p className="text-amber-700/60 text-xs mt-1">{maybeGroups.length} groups are weighing their options.</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {maybeGroups.slice(0, 3).map((g, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center text-white text-xs font-black shadow-sm" title={`${g.contactName} (${g.likelihood}%)`}>
                {g.contactName.charAt(0)}
              </div>
            ))}
            {maybeGroups.length > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-slate-400 text-[10px] font-black">
                +{maybeGroups.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
