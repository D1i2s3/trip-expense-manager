import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Filter, Trash2, Edit2, PlusCircle, X, CheckSquare, Calendar, Tag, User } from 'lucide-react';
import api from '../utils/api';
import { formatINR, formatDate, CATEGORIES, CATEGORY_COLORS } from '../utils/format';
import toast from 'react-hot-toast';
import TripIcon from '../components/TripIcon';

// Helper to resolve 3D category icon names
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

export default function Expenses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip } = useOutletContext();
  const members = trip?.members || [];

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editExp, setEditExp] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMember) params.paidBy = filterMember;
      if (filterCategory) params.category = filterCategory;
      const r = await api.get(`/trips/${id}/expenses`, { params });
      setExpenses(r.data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [id, filterMember, filterCategory]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (eid) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/trips/${id}/expenses/${eid}`);
      setExpenses(p => p.filter(e => e._id !== eid));
      toast.success('Expense deleted');
    } catch (e) { toast.error(e.message); }
  };

  const filtered = expenses.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (e.description || '').toLowerCase().includes(s)
      || e.paidBy?.name?.toLowerCase().includes(s)
      || e.category?.toLowerCase().includes(s);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-white">Expense Ledger</h1>
          <p className="text-slate-400 text-xs mt-1">Detailed history of all trip expenses</p>
        </div>
        <button onClick={() => navigate(`/trip/${id}/add`)} className="btn-primary text-sm py-2.5 px-5">
          <PlusCircle size={16} /> Record Expense
        </button>
      </div>

      {/* Modern Filter Board */}
      <div className="card-premium p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              className="input-premium text-xs" 
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search description, payer..."
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select 
              className="input-premium text-xs appearance-none bg-[#0a0f19] border border-white/5" 
              style={{ paddingLeft: '2.75rem' }}
              value={filterMember} 
              onChange={e => setFilterMember(e.target.value)}
            >
              <option value="">All Payers</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <Tag size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select 
              className="input-premium text-xs appearance-none bg-[#0a0f19] border border-white/5" 
              style={{ paddingLeft: '2.75rem' }}
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {(filterMember || filterCategory || search) && (
          <button onClick={() => { setFilterMember(''); setFilterCategory(''); setSearch(''); }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-bold mt-4 self-start">
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Ledger Stats Row */}
      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
        <span>{filtered.length} matching item{filtered.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span className="text-teal-400">
          Total sum: {formatINR(filtered.reduce((s, e) => s + e.amount, 0))}
        </span>
      </div>

      {/* Timeline view */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium p-16 text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">📂</div>
          <h4 className="text-white font-bold mb-1">No expenses found</h4>
          <p className="text-slate-500 text-xs">Try searching for other items or clear filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exp, idx) => (
            <div key={exp._id} className="card-premium p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="flex items-start gap-4">
                <TripIcon name={getCategoryIcon(exp.category)} size={38} className="shrink-0" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-extrabold text-sm leading-none">{exp.description || exp.category}</p>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md"
                      style={{ background: (CATEGORY_COLORS[exp.category] || '#64748B') + '15', color: CATEGORY_COLORS[exp.category] || '#94A3B8' }}>
                      {exp.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <TripIcon name={getMemberAvatar(exp.paidBy?.emoji)} size={16} className="rounded-md inline-block align-middle" />
                      <strong className="text-slate-300 font-semibold">{exp.paidBy?.name}</strong> paid
                    </span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(exp.date)}</span>
                  </div>

                  {/* Shared group members */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {exp.sharedBy?.map(m => (
                      <span key={m._id} className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400 font-bold">
                        <TripIcon name={getMemberAvatar(m.emoji)} size={12} className="rounded-sm" /> {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
                <span className="text-white font-black text-lg">{formatINR(exp.amount)}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditExp(exp)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(exp._id)} className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editExp && (
        <EditModal
          expense={editExp} members={members} tripId={id}
          onClose={() => setEditExp(null)}
          onSaved={(updated) => {
            setExpenses(p => p.map(e => e._id === updated._id ? updated : e));
            setEditExp(null);
            toast.success('Expense updated');
          }}
        />
      )}
    </div>
  );
}

function EditModal({ expense, members, tripId, onClose, onSaved }) {
  const [form, setForm] = useState({
    paidBy: expense.paidBy?._id || '',
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
    date: new Date(expense.date).toISOString().split('T')[0],
  });
  const [sharedBy, setSharedBy] = useState(expense.sharedBy?.map(m => m._id) || []);
  const [loading, setLoading] = useState(false);

  const toggleMember = (mid) =>
    setSharedBy(p => p.includes(mid) ? p.filter(x => x !== mid) : [...p, mid]);

  const handleSave = async () => {
    if (sharedBy.length === 0) return toast.error('Select at least one member');
    setLoading(true);
    try {
      const r = await api.put(`/trips/${tripId}/expenses/${expense._id}`, { ...form, sharedBy });
      onSaved(r.data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card-premium p-6 md:p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-white text-lg">Edit Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label-premium">Amount (₹)</label>
            <input type="number" min="0.01" step="0.01" className="input-premium"
              value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div>
            <label className="label-premium">Paid By</label>
            <select className="input-premium bg-navy" value={form.paidBy} onChange={e => setForm(p => ({ ...p, paidBy: e.target.value }))}>
              {members.map(m => <option key={m._id} value={m._id}>{m.emoji} {m.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-premium">Category</label>
              <select className="input-premium bg-navy" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-premium">Date</label>
              <input type="date" className="input-premium" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label-premium">Description</label>
            <input className="input-premium" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label-premium">Shared By</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button key={m._id} type="button" onClick={() => toggleMember(m._id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    sharedBy.includes(m._id)
                      ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                      : 'border-white/5 bg-white/5 text-slate-400'
                  }`}>
                  {sharedBy.includes(m._id) && <span>✓</span>}
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3.5 text-sm font-bold">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center py-3.5 text-sm font-bold">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
