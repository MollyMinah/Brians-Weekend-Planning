
import React, { useState, useEffect } from 'react';
import { RSVPGroup, RSVPStatus, GuestCategory, GuestMember } from '../types';
import GuestMemberItem from './GuestMemberItem';

interface Props {
  onSubmit: (group: RSVPGroup) => void;
  initialData?: RSVPGroup | null;
  onCancel?: () => void;
}

const RSVPForm: React.FC<Props> = ({ onSubmit, initialData, onCancel }) => {
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RSVPStatus>(RSVPStatus.YES);
  const [likelihood, setLikelihood] = useState(50);
  const [prefersQuiet, setPrefersQuiet] = useState(false);
  const [prefersNoPaws, setPrefersNoPaws] = useState(false);
  const [notes, setNotes] = useState('');
  const [members, setMembers] = useState<GuestMember[]>([
    { id: '1', name: '', category: GuestCategory.ADULT }
  ]);

  useEffect(() => {
    if (initialData) {
      setContactName(initialData.contactName);
      setEmail(initialData.email);
      setStatus(initialData.status);
      setLikelihood(initialData.likelihood || 50);
      setPrefersQuiet(initialData.prefersQuiet);
      setPrefersNoPaws(initialData.prefersNoPaws);
      setNotes(initialData.notes);
      setMembers(initialData.members);
    }
  }, [initialData]);

  const addMember = () => {
    setMembers([...members, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: '', 
      category: GuestCategory.ADULT 
    }]);
  };

  const updateMember = (id: string, updates: Partial<GuestMember>) => {
    setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !email) return;
    
    onSubmit({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      contactName,
      email,
      status,
      likelihood: status === RSVPStatus.YES ? 100 : (status === RSVPStatus.NO ? 0 : likelihood),
      members,
      prefersQuiet,
      prefersNoPaws,
      notes,
      submittedAt: initialData?.submittedAt || Date.now()
    });
    
    if (!initialData) {
      setContactName('');
      setEmail('');
      setMembers([{ id: '1', name: '', category: GuestCategory.ADULT }]);
      setNotes('');
      setLikelihood(50);
      setStatus(RSVPStatus.YES);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLikelihoodLabel = (val: number) => {
    if (val < 20) return "Just a tiny hope! 🌱";
    if (val < 50) return "Still checking the calendar... 📅";
    if (val < 70) return "Leaning towards yes! 👍";
    if (val < 90) return "More than likely! ✨";
    return "Basically a yes! 🎉";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-2xl mx-auto my-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center pb-6 border-b border-slate-50">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {initialData ? 'Update Your RSVP ✏️' : 'Count Me In! 🏠'}
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          {initialData ? 'Tweak your details below' : 'Let Brian and the crew know if you\'re coming!'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Your Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all shadow-sm"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Who are we looking for?"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="For the details"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Can you make it?</label>
          <div className="flex gap-2">
            {Object.values(RSVPStatus).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-4 px-4 rounded-2xl font-black transition-all ${
                  status === s 
                  ? 'bg-amber-400 text-amber-950 shadow-lg scale-[1.02] shadow-amber-200' 
                  : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                {s === RSVPStatus.YES ? 'Yes! 🎉' : s === RSVPStatus.NO ? 'Sad no 😢' : 'Maybe? 🤔'}
              </button>
            ))}
          </div>
        </div>

        {status === RSVPStatus.MAYBE && (
          <div className="bg-amber-50/30 p-8 rounded-[2.5rem] space-y-4 border border-amber-100/50 animate-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center">
              <label className="text-sm font-black text-amber-900 uppercase tracking-widest">Likelihood</label>
              <div className="flex flex-col items-end">
                <span className="text-4xl font-black text-amber-600 leading-none">{likelihood}%</span>
                <span className="text-[10px] font-bold text-amber-700/50 mt-1">&gt;70% secures a bed spot!</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={likelihood}
              onChange={(e) => setLikelihood(parseInt(e.target.value))}
              className="w-full h-3 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-sm font-bold text-amber-800 text-center bg-white/50 py-2 rounded-xl">
              {getLikelihoodLabel(likelihood)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">The Crew</label>
          <button
            type="button"
            onClick={addMember}
            className="text-xs text-indigo-600 font-black hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full"
          >
            + Add Another
          </button>
        </div>
        <div className="space-y-3">
          {members.map((m) => (
            <GuestMemberItem
              key={m.id}
              member={m}
              onUpdate={updateMember}
              onRemove={removeMember}
              canRemove={members.length > 1}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-900/5 p-8 rounded-[2.5rem] space-y-4 border border-slate-200/50">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">The Vibe Check</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-amber-200 transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-amber-500 focus:ring-amber-400"
              checked={prefersQuiet}
              onChange={(e) => setPrefersQuiet(e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800">Quiet Zone</span>
              <span className="text-[10px] font-medium text-slate-400">Away from early birds</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-amber-200 transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-amber-500 focus:ring-amber-400"
              checked={prefersNoPaws}
              onChange={(e) => setPrefersNoPaws(e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800">No Paws</span>
              <span className="text-[10px] font-medium text-slate-400">Pet-free bedroom</span>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Special Requests?</label>
        <textarea
          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all shadow-sm"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dietary stuff, arrival time, or just 'can't wait!'"
        />
      </div>

      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-[2] py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] hover:-translate-y-1"
        >
          {initialData ? 'Update RSVP' : 'Save RSVP'}
        </button>
      </div>
    </form>
  );
};

export default RSVPForm;
