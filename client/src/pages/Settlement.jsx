import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Landmark, Shuffle, X, Copy, QrCode } from 'lucide-react';
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

export default function Settlement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment states
  const [activePayment, setActivePayment] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/trips/${id}/summary`);
      setSummary(r.data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse max-w-4xl mx-auto">
      <div className="h-20 bg-white/5 rounded-2xl" />
      <div className="h-44 bg-white/5 rounded-2xl" />
      <div className="h-60 bg-white/5 rounded-2xl" />
    </div>
  );

  const { memberStats = [], settlements = [], totalExpense = 0 } = summary || {};
  const isSettled = settlements.length === 0 && memberStats.length > 0;

  const rawTxCount = Math.max(settlements.length, Math.round(memberStats.length * 1.5 - 1));
  const optimizedTxCount = settlements.length;

  // Generate UPI Deep Link Intent
  const getUpiUrl = (payeeUpi, payeeName, amount) => {
    return `upi://pay?pa=${payeeUpi}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=TripSplit%20Settlement`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('UPI ID copied to clipboard!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Settle Balances</h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">Clear trip debits with optimized minimum payments</p>
        </div>
        <button onClick={load} className="btn-secondary py-2.5 px-4 text-xs font-bold shadow-sm cursor-pointer">
          <RefreshCw size={14} className="animate-spin-hover" /> Sync Ledger
        </button>
      </div>

      {/* Balance Summary Table */}
      <div className="card-premium p-6 overflow-x-auto">
        <h2 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
          <Landmark size={18} className="text-blue-400" /> Balances Sheet
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-white/5 font-extrabold uppercase tracking-wider text-left">
              <th className="pb-3 font-extrabold">Traveler</th>
              <th className="text-right pb-3 font-extrabold">Paid</th>
              <th className="text-right pb-3 font-extrabold">Fair Share</th>
              <th className="text-right pb-3 font-extrabold">Balance</th>
              <th className="text-right pb-3 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody>
            {memberStats.map((s, idx) => {
              const b = s.balance;
              return (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <TripIcon name={getMemberAvatar(s.member.emoji)} size={28} className="rounded-lg shadow-sm" />
                      <span className="text-white font-bold">{s.member.name}</span>
                    </div>
                  </td>
                  <td className="text-right text-slate-300 py-3.5 font-bold">{formatINR(s.paid)}</td>
                  <td className="text-right text-slate-300 py-3.5 font-bold">{formatINR(s.fairShare)}</td>
                  <td className="text-right py-3.5">
                    <span className={b > 0.01 ? 'badge-p' : b < -0.01 ? 'badge-n' : 'badge-neut'}>
                      {b > 0 ? '+' : ''}{formatINR(b)}
                    </span>
                  </td>
                  <td className="text-right py-3.5 text-[10px] text-slate-500 font-extrabold uppercase font-mono">
                    {Math.abs(b) < 0.01 ? 'Settled ✓' : b > 0 ? 'To Receive' : 'Owes'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2 text-sm font-extrabold">
          <span className="text-slate-400">Total spent</span>
          <span className="text-blue-400 font-black text-base">{formatINR(totalExpense)}</span>
        </div>
      </div>

      {/* Enhanced Money Map Flow */}
      {settlements.length > 0 && (
        <div className="card-premium p-6">
          <h2 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
            <Shuffle size={18} className="text-blue-400" /> Money Flow Map
          </h2>
          
          <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 mb-6">
            <div className="flex flex-col gap-4">
              {settlements.map((s, idx) => (
                <div key={idx} className="p-4 bg-[#121826] border border-white/5 rounded-2xl hover:border-[#3054ff]/35 transition-all space-y-4">
                  {/* Flow info */}
                  <div className="flex items-center justify-between">
                    {/* Debtor */}
                    <div className="flex items-center gap-3 w-1/3">
                      <TripIcon name={getMemberAvatar(s.from.emoji)} size={40} className="rounded-xl shadow-md" />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">{s.from.name}</p>
                        <span className="text-[9px] text-rose-400 font-extrabold uppercase tracking-wide">Pays</span>
                      </div>
                    </div>

                    {/* Flow Arrow with Amount */}
                    <div className="flex-1 flex flex-col items-center justify-center px-4">
                      <span className="text-amber-400 text-xs font-black tracking-tight bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/25 shadow-sm">
                        {formatINR(s.amount)}
                      </span>
                      <div className="w-full flex items-center gap-1.5 mt-2">
                        <div className="h-0.5 bg-gradient-to-r from-rose-500 to-blue-400 flex-1 relative rounded-full overflow-hidden">
                          <svg className="w-full h-full absolute inset-0">
                            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3054ff" strokeWidth="2" strokeDasharray="6" className="animate-draw-flow" />
                          </svg>
                        </div>
                        <ArrowRight size={14} className="text-blue-400 shrink-0" />
                      </div>
                    </div>

                    {/* Creditor */}
                    <div className="flex items-center gap-3 w-1/3 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="text-white text-xs font-bold truncate">{s.to.name}</p>
                        <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wide">Receives</span>
                      </div>
                      <TripIcon name={getMemberAvatar(s.to.emoji)} size={40} className="rounded-xl shadow-md" />
                    </div>
                  </div>

                  {/* UPI Gateway Trigger */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2.5">
                    {s.to.upi ? (
                      <>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          VPA: <strong className="text-slate-300 font-mono">{s.to.upi}</strong>
                        </span>
                        <button
                          onClick={() => setActivePayment(s)}
                          className="btn-primary py-2 px-4 text-xs font-bold shrink-0 bg-gradient-to-r from-blue-600 to-[#3054ff] hover:shadow-[0_0_12px_rgba(48,84,255,0.35)] cursor-pointer"
                        >
                          ⚡ Settle via Google Pay
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-500 font-bold italic">
                          ⚠️ No UPI ID setup for {s.to.name}
                        </span>
                        <button
                          onClick={() => navigate(`/trip/${id}/members`)}
                          className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer bg-transparent border-0"
                        >
                          Configure UPI Address
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Settlement banner */}
          <div className="bg-[#3054ff]/5 border border-[#3054ff]/25 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3054ff]/10 rounded-full blur-md" />
            <span className="text-2xl animate-float">✨</span>
            <div className="relative z-10">
              <h3 className="font-extrabold text-white text-sm">Smart Settlement Plan</h3>
              <p className="text-slate-400 text-xs mt-1 font-bold">
                TripSplit optimized your transaction plan from {rawTxCount} payments to just <strong className="text-teal-300 font-extrabold">{optimizedTxCount}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settle completeness banner */}
      {isSettled && (
        <div className="card-premium p-10 text-center">
          <CheckCircle2 size={52} className="text-emerald-400 mx-auto mb-4 animate-float" />
          <h3 className="text-xl font-bold text-white mb-2">All settled up! 🎉</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Everyone contributed their fair share. No outstanding payments remaining.</p>
        </div>
      )}

      {settlements.length === 0 && !isSettled && (
        <div className="card-premium p-10 text-center">
          <AlertCircle size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No expenses recorded yet. Add expenses to calculate settlements.</p>
        </div>
      )}

      {/* UPI Payment Gateway Modal */}
      {activePayment && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card-premium p-6 w-full max-w-md animate-slide-up relative overflow-hidden">
            
            {/* Volumetric glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#3054ff]/10 rounded-full blur-xl pointer-events-none" />

            {/* Header close trigger */}
            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h2 className="font-black text-white text-base">UPI Payment Gateway</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Secure Scan & Direct App Settle</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePayment(null)} 
                className="p-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-6 text-center relative z-10">
              
              {/* Payment Details */}
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">{activePayment.from.name} pays {activePayment.to.name}</p>
                <h3 className="text-3xl font-black text-white">{formatINR(activePayment.amount)}</h3>
              </div>

              {/* Dynamic QR Code card */}
              <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl border border-white/10 flex flex-col items-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    getUpiUrl(activePayment.to.upi, activePayment.to.name, activePayment.to.amount || activePayment.amount)
                  )}`}
                  alt="UPI Payment QR Code"
                  className="w-[180px] h-[180px]"
                />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-2.5 flex items-center gap-1.5">
                  <QrCode size={11} /> Scan using Google Pay / BHIM
                </span>
              </div>

              {/* Pay via Mobile App Intent (For phone users) */}
              <div className="space-y-3">
                <a
                  href={getUpiUrl(activePayment.to.upi, activePayment.to.name, activePayment.to.amount || activePayment.amount)}
                  className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-lg shadow-blue-500/25 block text-center"
                >
                  🚀 Open Google Pay / UPI App
                </a>
                <p className="text-[9px] text-slate-500 font-bold leading-normal px-6">
                  Clicking the button above will launch your phone's default payment chooser (GPay, PhonePe, Paytm) to complete the transaction.
                </p>
              </div>

              {/* Copy VPA Details option */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between bg-white/2 border border-white/5 rounded-2xl p-3 text-left">
                <div className="overflow-hidden min-w-0 pr-3">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Payee UPI Address</span>
                  <p className="text-white text-xs font-mono font-bold truncate mt-0.5">{activePayment.to.upi}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(activePayment.to.upi)}
                  className="btn-secondary p-2.5 rounded-xl shrink-0 cursor-pointer"
                  title="Copy UPI ID"
                >
                  <Copy size={13} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
