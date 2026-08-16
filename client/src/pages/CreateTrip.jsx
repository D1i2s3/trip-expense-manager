import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X, ArrowLeft, CalendarDays, Users, MapPin, FileText, Compass, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TripIcon, { EMOJI_TO_NAME } from '../components/TripIcon';
import { motion, AnimatePresence } from 'motion/react';

const EMOJIS = ['✈️','🏖️','🏔️','🌴','🎒','🗺️','🚢','🏕️','🌍','🎡'];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', 
    date: new Date().toISOString().split('T')[0],
    description: '', 
    coverEmoji: '✈️'
  });
  const [members, setMembers] = useState(['']);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addMember = () => setMembers(p => [...p, '']);
  const removeMember = (i) => setMembers(p => p.filter((_, idx) => idx !== i));
  const updateMember = (i, v) => setMembers(p => p.map((m, idx) => idx === i ? v : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validMembers = members.map(m => m.trim()).filter(Boolean);
    if (!form.name.trim()) return toast.error('Trip name is required');
    if (validMembers.length === 0) return toast.error('Add at least one member');
    setLoading(true);
    try {
      const r = await api.post('/trips', {
        ...form,
        members: validMembers.map(name => ({ name }))
      });
      toast.success('Trip created successfully!');
      navigate(`/trip/${r.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 py-12 px-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors font-medium border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        {/* Header Block */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3054ff] to-[#2040e0] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TripIcon name="plane" size={24} className="mx-auto text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Create Shared Ledger</h1>
            <p className="text-slate-400 text-xs mt-1 font-semibold">Establish expenses and companion records for your upcoming journey</p>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Setup Form Panel (7 Columns) */}
          <div className="lg:col-span-7 card-premium p-6 md:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Theme Picker */}
              <div className="space-y-2">
                <label className="label-premium text-[10px]">Trip Icon & Theme</label>
                <div className="flex flex-wrap gap-2.5">
                  {EMOJIS.map(e => (
                    <button
                      key={e} type="button"
                      onClick={() => set('coverEmoji', e)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        form.coverEmoji === e
                          ? 'bg-[#3054ff]/20 border-2 border-[#3054ff] scale-110 shadow-md shadow-blue-500/20'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <TripIcon name={EMOJI_TO_NAME[e]} size={28} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Destination */}
              <div className="space-y-1">
                <label className="label-premium text-[10px]">Trip Name / Destination *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text" required
                    className="input-premium text-xs py-2.5"
                    style={{ paddingLeft: '2.75rem' }}
                    value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Goa Vacation, Europe Backpacking"
                  />
                </div>
              </div>

              {/* Date & Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="label-premium text-[10px]">Start Date *</label>
                  <div className="relative">
                    <CalendarDays size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="date" required
                      className="input-premium text-xs py-2.5"
                      style={{ paddingLeft: '2.75rem' }}
                      value={form.date} onChange={e => set('date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Description Notes */}
                <div className="space-y-1">
                  <label className="label-premium text-[10px]">Trip Notes (Optional)</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      className="input-premium text-xs py-2.5"
                      style={{ paddingLeft: '2.75rem' }}
                      value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Budget targets, travel plans"
                    />
                  </div>
                </div>
              </div>

              {/* Group Members List */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-extrabold text-white">Companions / Members</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Define participants splitting the bills</p>
                  </div>
                  <span className="text-[9px] text-blue-400 font-black uppercase tracking-wider bg-[#3054ff]/10 px-2.5 py-0.5 rounded-full border border-[#3054ff]/15 flex items-center gap-1.5">
                    <Users size={10} /> {members.filter(Boolean).length} Joined
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {members.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex gap-2.5 items-center"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                          {i + 1}
                        </div>
                        <input
                          type="text" required
                          className="input-premium text-xs py-2"
                          value={m} onChange={e => updateMember(i, e.target.value)}
                          placeholder={`Enter name (e.g. Rahul, Priya)`}
                        />
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            className="btn-danger p-2.5 shrink-0 rounded-xl cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={addMember}
                  className="btn-secondary w-full py-2.5 justify-center border-dashed border-[#3054ff]/30 text-blue-400 hover:text-white hover:border-[#3054ff] transition-all text-xs font-bold mt-2"
                >
                  + Add Companion Name
                </button>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs font-bold justify-center mt-6 shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                {loading ? 'Populating Dashboard...' : <><PlusCircle size={15} /> Create Trip Dashboard</>}
              </button>
            </form>
          </div>

          {/* Interactive Dynamic Preview (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="card-premium p-6 relative overflow-hidden space-y-4">
              {/* Premium Card Glow */}
              <div className="absolute top-[-30%] right-[-10%] w-[180px] h-[180px] bg-[#3054ff]/20 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-400" /> Card Live Preview
                </h3>
                <span className="text-[9px] bg-white/5 border border-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">Draft</span>
              </div>

              {/* Rendered Live Card Widget */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden space-y-5">
                <div className="flex items-center gap-4">
                  {/* Selected Icon Display */}
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner shrink-0">
                    <TripIcon name={EMOJI_TO_NAME[form.coverEmoji]} size={36} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h2 className="text-lg font-black text-white truncate placeholder-preview">
                      {form.name.trim() || 'My Dream Trip'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1 mt-0.5">
                      <CalendarDays size={10} className="text-blue-400" /> Start: {form.date || 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Optional Notes Preview */}
                <div className="text-xs text-slate-400 leading-relaxed font-medium min-h-[36px]">
                  {form.description.trim() ? (
                    <p className="italic">"{form.description}"</p>
                  ) : (
                    <p className="text-slate-500 italic">No notes added. Add notes to display target budgets or trip milestones.</p>
                  )}
                </div>

                {/* Companions Avatars Preview list */}
                <div className="space-y-2.5 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Travel companions ({members.filter(Boolean).length})</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {members.filter(Boolean).length > 0 ? (
                      members.filter(Boolean).map((m, idx) => (
                        <div
                          key={idx}
                          className="text-[9px] font-black bg-[#3054ff]/10 text-blue-400 border border-[#3054ff]/25 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-scale-up"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-[#3054ff] text-white flex items-center justify-center font-bold text-[8px]">
                            {m[0]?.toUpperCase() || 'P'}
                          </div>
                          <span>{m}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 font-semibold italic">Add companion names to view the travel list...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tech Spec Info */}
              <div className="bg-[#3054ff]/5 border border-[#3054ff]/20 rounded-2xl p-4 flex gap-3">
                <Compass className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-extrabold text-white">Group Ledger Setup</h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                    This creates an isolated mathematical ledger utilizing split ratio matrix resolution for simplified multi-traveler settlements.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
