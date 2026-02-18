
import React from 'react';
import { GuestMember, GuestCategory } from '../types';

interface Props {
  member: GuestMember;
  onUpdate: (id: string, updates: Partial<GuestMember>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const GuestMemberItem: React.FC<Props> = ({ member, onUpdate, onRemove, canRemove }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex-1">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Name</label>
        <input
          type="text"
          value={member.name}
          onChange={(e) => onUpdate(member.id, { name: e.target.value })}
          placeholder="Guest Name"
          className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-sm font-medium"
        />
      </div>
      <div className="w-full sm:w-48">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category</label>
        <select
          value={member.category}
          onChange={(e) => onUpdate(member.id, { category: e.target.value as GuestCategory })}
          className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-sm font-medium appearance-none"
        >
          {Object.values(GuestCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {canRemove && (
        <button
          onClick={() => onRemove(member.id)}
          className="self-end sm:self-center p-2 text-rose-300 hover:text-rose-500 transition-colors"
          title="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </div>
  );
};

export default GuestMemberItem;
