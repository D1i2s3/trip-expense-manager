import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Trash2, Edit2, X, Sparkles, Trophy } from 'lucide-react';
import api from '../utils/api';
import { formatINR } from '../utils/format';
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

export default function Members() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Add companion states
  const [newName, setNewName] = useState('');
  const [newUpi, setNewUpi] = useState('');
  const [adding, setAdding] = useState(false);
  
  // Edit companion states
  const [editMember, setEditMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUpi, setEditUpi] = useState('');

  const load = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.get(`/trips/${id}/members`),
        api.get(`/trips/${id}/summary`)
      ]);
      setMembers(mRes.data);
      setSummary(sRes.data);
    } catch (e) { toast.error(e.message); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const r = await api.post(`/trips/${id}/members`, { 
        name: newName.trim(), 
        upi: newUpi.trim() 
      });
      setMembers(p => [...p, r.data]);
      setNewName('');
      setNewUpi('');
      toast.success(`${r.data.name} added`);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setAdding(false); }
  };

  const handleDelete = async (mid, name) => {
    if (!confirm(`Remove ${name}? This will fail if they have expenses.`)) return;
    try {
      await api.delete(`/trips/${id}/members/${mid}`);
      setMembers(p => p.filter(m => m._id !== mid));
      toast.success('Member removed');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;
    try {
      const r = await api.put(`/trips/${id}/members/${editMember._id}`, { 
        name: editName.trim(),
        upi: editUpi.trim()
      });
      setMembers(p => p.map(m => m._id === r.data._id ? r.data : m));
      setEditMember(null);
      toast.success('Member updated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const getStats = (mid) => {
    return summary?.memberStats?.find(s => s.member._id === mid);
  };

  // Find the top contributor (Trophy winner!)
  const topContributor = summary?.memberStats?.reduce((top, current) => {
    if (!top || current.paid > top.paid) return current;
    return top;
  }, null);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Travel Companions</h1>
          <p className="text-slate-400 text-xs mt-1">Manage travelers, UPI addresses, and individual balance splits</p>
        </div>
        <span className="text-[10px] bg-[#3054ff]/15 border border-[#3054ff]/20 text-blue-400 px-3 py-1 rounded-full font-bold">
          {members.length} Total
        </span>
      </div>

      {/* Add companion board */}
      <div className="card-premium p-5">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Add Companion</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input 
            className="input-premium flex-1 text-xs" 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Traveler name (e.g. Neha, Rohit)..." 
          />
          <input 
            className="input-premium flex-1 text-xs font-mono" 
            value={newUpi}
            onChange={e => setNewUpi(e.target.value)}
            placeholder="UPI ID (Optional, e.g. name@paytm)..." 
          />
          <button type="submit" disabled={adding || !newName.trim()} className="btn-primary shrink-0 py-3 px-6 text-xs font-bold">
            <UserPlus size={14} /> {adding ? 'Adding...' : 'Add Traveler'}
          </button>
        </form>
      </div>

      {/* Companions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m, idx) => {
          const stats = getStats(m._id);
          const balance = stats?.balance ?? 0;
          const isTop = topContributor && topContributor.member._id === m._id && stats.paid > 0;

          return (
            <div key={m._id} className="card-premium p-6 flex flex-col justify-between relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms` }}>
              {isTop && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent p-3 text-amber-400 flex items-center gap-1 text-[10px] font-bold">
                  <Trophy size={12} /> Top Payer
                </div>
              )}
              
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <TripIcon name={getMemberAvatar(m.emoji)} size={48} className="rounded-2xl shadow-md border border-white/5 shrink-0" />
                    <div className="overflow-hidden min-w-0">
                      <p className="font-extrabold text-white text-sm leading-tight truncate">{m.name}</p>
                      {m.upi ? (
                        <p className="text-[10px] text-blue-400 mt-1 font-mono font-bold truncate" title={m.upi}>
                          {m.upi}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">No UPI ID</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditMember(m); setEditName(m.name); setEditUpi(m.upi || ''); }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(m._id, m.name)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Total Paid</span>
                    <span className="text-white font-extrabold">{formatINR(stats?.paid ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Fair Share</span>
                    <span className="text-white font-extrabold">{formatINR(stats?.fairShare ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs">
                    <span className="text-slate-400 font-extrabold">Net Balance</span>
                    <span className={balance > 0.01 ? 'badge-p' : balance < -0.01 ? 'badge-n' : 'badge-neut'}>
                      {balance > 0 ? '+' : ''}{formatINR(balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar visual metric */}
              {stats && stats.fairShare > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (stats.paid / Math.max(stats.fairShare, 0.01)) * 100)}%`,
                        background: balance >= 0 ? '#3b82f6' : '#ef4444'
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-1.5 uppercase font-mono">
                    <span>Ledger level</span>
                    <span>{Math.round((stats.paid / Math.max(stats.fairShare, 0.01)) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card-premium p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-white text-lg">Edit Companion</h2>
              <button onClick={() => setEditMember(null)} className="text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-premium text-[10px]">Companion Name</label>
                <input className="input-premium font-bold text-xs" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="label-premium text-[10px]">UPI ID (Optional)</label>
                <input className="input-premium font-mono text-xs" placeholder="e.g. name@upi" value={editUpi} onChange={e => setEditUpi(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditMember(null)} className="btn-secondary flex-1 justify-center py-3.5 text-xs font-bold cursor-pointer">Cancel</button>
                <button onClick={handleEdit} className="btn-primary flex-1 justify-center py-3.5 text-xs font-bold cursor-pointer">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
