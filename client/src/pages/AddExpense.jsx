import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { PlusCircle, ArrowLeft, CheckSquare, Coins, Users, Calendar, FileText } from 'lucide-react';
import api from '../utils/api';
import { CATEGORIES } from '../utils/format';
import toast from 'react-hot-toast';
import TripIcon from '../components/TripIcon';

const getMemberAvatar = (emoji) => {
  const map = {
    '🏄': 'surfer',
    '💻': 'programmer',
    '👩‍🍳': 'chef',
    '📷': 'photographer',
    '🥾': 'hiker',
  };
  return map[emoji] || 'traveler';
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food': return 'food';
    case 'Hotel': return 'hotel';
    case 'Transport': return 'carRental';
    case 'Activities': return 'activities';
    case 'Shopping': return 'shopping';
    case 'Entertainment': return 'activities';
    case 'Medical': return 'activities';
    default: return 'backpack';
  }
};

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip } = useOutletContext();
  const members = trip?.members || [];

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    paidBy: '', amount: '', category: 'Food',
    description: '', date: today,
  });
  const [sharedBy, setSharedBy] = useState([]);
  const [splitType, setSplitType] = useState('equal'); // equal, custom, percentage
  const [loading, setLoading] = useState(false);

  // Pre-select all members on load
  useEffect(() => {
    if (members.length > 0 && sharedBy.length === 0) {
      setSharedBy(members.map(m => m._id));
      if (!form.paidBy) setForm(p => ({ ...p, paidBy: members[0]._id }));
    }
  }, [members]);

  const toggleMember = (mid) => {
    setSharedBy(prev =>
      prev.includes(mid) ? prev.filter(x => x !== mid) : [...prev, mid]
    );
  };

  const selectAll = () => setSharedBy(members.map(m => m._id));
  const clearAll = () => setSharedBy([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paidBy) return toast.error('Select who paid');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (sharedBy.length === 0) return toast.error('Select at least one traveler to split with');
    setLoading(true);
    try {
      await api.post(`/trips/${id}/expenses`, {
        ...form, amount: Number(form.amount), sharedBy
      });
      toast.success('Expense recorded successfully');
      navigate(`/trip/${id}/expenses`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const perPerson = sharedBy.length > 0 && form.amount
    ? (Number(form.amount) / sharedBy.length).toFixed(2) : null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(`/trip/${id}`)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card-premium p-6 md:p-8 animate-slide-up">
        <h1 className="text-xl font-black text-white mb-8 flex items-center gap-2.5">
          <Coins size={22} className="text-blue-400" /> Record Trip Expense
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount input */}
          <div>
            <label className="label-premium">Amount Spent *</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-400">₹</span>
              <input
                type="number" min="0.01" step="0.01" required
                className="input-premium text-3xl font-black tracking-tight"
                style={{ paddingLeft: '3rem' }}
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Paid By selection list */}
          <div>
            <label className="label-premium">Who Paid? *</label>
            <div className="flex flex-wrap gap-2.5">
              {members.map(m => (
                <button
                  key={m._id} type="button"
                  onClick={() => setForm(p => ({ ...p, paidBy: m._id }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    form.paidBy === m._id
                      ? 'border-[#3054ff] bg-[#3054ff]/10 text-blue-300 shadow-md shadow-blue-500/5'
                      : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <TripIcon name={getMemberAvatar(m.emoji)} size={18} className="rounded-md" /> {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label className="label-premium">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat} type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat }))}
                  className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    form.category === cat
                      ? 'border-[#3054ff] bg-[#3054ff]/10 text-blue-300 shadow-md shadow-blue-500/5'
                      : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <TripIcon name={getCategoryIcon(cat)} size={18} className="rounded-md" /> {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label-premium"><FileText size={13} className="inline mr-1" />Description</label>
              <input className="input-premium" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Hotel booking, dinner, taxi ride..." />
            </div>
            <div>
              <label className="label-premium"><Calendar size={13} className="inline mr-1" />Date *</label>
              <input type="date" required className="input-premium" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>

          {/* Split Type Selector */}
          <div>
            <label className="label-premium">Split Method</label>
            <div className="flex gap-2 bg-white/3 p-1 rounded-2xl border border-white/5 max-w-xs">
              {['equal', 'custom', 'percentage'].map(type => (
                <button
                  key={type} type="button"
                  onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                    splitType === type
                      ? 'bg-[#3054ff] text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Shared by traveler list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-premium mb-0">Splitting With *</label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-blue-400 text-xs font-bold hover:text-blue-300 flex items-center gap-1">
                  <CheckSquare size={12} /> Select All
                </button>
                <span className="text-slate-700">·</span>
                <button type="button" onClick={clearAll} className="text-slate-500 text-xs font-bold hover:text-slate-400">Clear</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {members.map(m => (
                <button
                  key={m._id} type="button"
                  onClick={() => toggleMember(m._id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    sharedBy.includes(m._id)
                      ? 'border-[#3054ff] bg-[#3054ff]/10 text-blue-300 shadow-md shadow-blue-500/5'
                      : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    sharedBy.includes(m._id) ? 'border-[#3054ff] bg-[#3054ff]' : 'border-white/20'
                  }`}>
                    {sharedBy.includes(m._id) && <span className="text-[10px] text-white">✓</span>}
                  </div>
                  <TripIcon name={getMemberAvatar(m.emoji)} size={18} className="rounded-md" /> {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Splitting preview box */}
          {perPerson && sharedBy.length > 0 && (
            <div className="bg-[#3054ff]/10 border border-[#3054ff]/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3054ff]/15 flex items-center justify-center text-blue-400">
                <Users size={18} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold">Equal Split Calculation</p>
                <p className="text-blue-400 text-sm font-extrabold mt-0.5">
                  ₹{Number(perPerson).toLocaleString('en-IN')} each among {sharedBy.length} member{sharedBy.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(`/trip/${id}`)} className="btn-secondary flex-1 justify-center py-3.5 text-sm font-bold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5 text-sm font-bold shadow-lg">
              {loading ? 'Recording...' : 'Record Expense →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
