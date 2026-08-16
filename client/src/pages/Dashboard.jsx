import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { PlusCircle, ArrowRight, Calendar, Users } from 'lucide-react';
import api from '../utils/api';
import { formatINR, formatDate } from '../utils/format';
import TripIcon, { EMOJI_TO_NAME } from '../components/TripIcon';

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

function PremiumStatCard({ iconName, label, value, sub, color = 'teal' }) {
  const colors = {
    teal: 'from-teal-500/10 to-teal-900/5 border-teal-500/20 text-teal-400',
    amber: 'from-amber-500/10 to-amber-900/5 border-amber-500/20 text-amber-400',
    green: 'from-emerald-500/10 to-emerald-900/5 border-emerald-500/20 text-emerald-400',
    red: 'from-rose-500/10 to-rose-900/5 border-rose-500/20 text-rose-400',
  };
  return (
    <div className={`card-premium p-6 bg-gradient-to-br ${colors[color]} relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full translate-x-8 -translate-y-8 blur-lg group-hover:scale-110 transition-transform" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">{label}</span>
        <TripIcon name={iconName} size={36} className="shadow-md" />
      </div>
      <p className="text-3xl font-black text-white tracking-tight relative z-10">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1.5 font-bold relative z-10">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/trips/${id}/summary`)
      .then(r => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-16 bg-white/5 rounded-3xl w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-60 bg-white/5 rounded-3xl" />
        <div className="h-60 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );

  const debtors = summary?.memberStats?.filter(s => s.balance < -0.01) || [];
  const creditors = summary?.memberStats?.filter(s => s.balance > 0.01) || [];

  const userStat = summary?.memberStats?.[0] || { paid: 0, balance: 0, fairShare: 0 };
  const balanceIsCreditor = userStat.balance > 0.01;
  const balanceColor = userStat.balance > 0.01 ? 'green' : userStat.balance < -0.01 ? 'red' : 'teal';

  const baseScore = 100;
  const transactionCount = summary?.settlements?.length || 0;
  const healthScore = Math.max(0, baseScore - (transactionCount * 12));
  const healthLevel = healthScore > 85 ? '🟢 Everything is balanced' : healthScore > 40 ? '🟡 A few payments remaining' : '🔴 Several balances need attention';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-slide-up">
      
      {/* Trip Header with Cover Photo Backdrop element */}
      <div className="relative p-6 md:p-8 rounded-3xl overflow-hidden glass border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3054ff]/10 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <TripIcon name={EMOJI_TO_NAME[trip?.coverEmoji] || 'palmTree'} size={44} className="mb-2" />
          <h1 className="text-2xl md:text-3xl font-black text-white mt-2 flex items-center gap-2">
            {trip?.name || 'Trip Destination'}
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1.5 font-semibold">
            <Calendar size={14} className="text-slate-500" />
            <span>{formatDate(trip?.date)}</span>
            <span className="mx-2 text-slate-700">·</span>
            <Users size={14} className="text-slate-500" />
            <span>{summary?.memberCount || 0} travelers</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/trip/${id}/add`)} className="btn-primary">
            <PlusCircle size={18} /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumStatCard
          iconName="creditCard"
          label="Total Spent"
          value={formatINR(summary?.totalExpense)}
          sub={`${summary?.expenseCount || 0} recorded items`}
          color="teal"
        />
        <PremiumStatCard
          iconName="backpack"
          label="Per Person Share"
          value={formatINR(summary?.totalExpense / Math.max(1, summary?.memberCount || 1))}
          sub="Equal share target"
          color="amber"
        />
        <PremiumStatCard
          iconName="shopping"
          label="Your Contribution"
          value={formatINR(userStat.paid)}
          sub={`Your Share: ${formatINR(userStat.fairShare)}`}
          color="green"
        />
        <PremiumStatCard
          iconName={balanceIsCreditor ? 'shakingHands' : 'creditCard'}
          label="Your Net Balance"
          value={(userStat.balance > 0 ? '+' : '') + formatINR(userStat.balance)}
          sub={userStat.balance > 0.01 ? 'You are owed' : userStat.balance < -0.01 ? 'You owe money' : 'You are balanced'}
          color={balanceColor}
        />
      </div>

      {/* Main Grid: Balances + Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Travelers List (7 Columns) */}
        <div className="lg:col-span-7 card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-lg text-white">Travelers</h2>
                <p className="text-slate-500 text-xs mt-0.5 font-bold">Individual ledger standings</p>
              </div>
              <button onClick={() => navigate(`/trip/${id}/members`)} className="text-blue-400 text-xs font-bold hover:text-blue-300 flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-4">
              {summary?.memberStats?.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/2 rounded-xl transition-all px-2">
                  <div className="flex items-center gap-3.5">
                    <TripIcon name={getMemberAvatar(s.member.emoji)} size={40} className="rounded-2xl" />
                    <div>
                      <p className="text-white text-sm font-extrabold">{s.member.name}</p>
                      <p className="text-slate-500 text-[10px] font-bold">Contributed {formatINR(s.paid)}</p>
                    </div>
                  </div>
                  <span className={s.balance > 0.01 ? 'badge-p' : s.balance < -0.01 ? 'badge-n' : 'badge-neut'}>
                    {s.balance > 0 ? '+' : ''}{formatINR(s.balance)}
                  </span>
                </div>
              ))}
              {(!summary?.memberStats || summary.memberStats.length === 0) && (
                <p className="text-slate-500 text-sm text-center py-6">No travelers added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Settlement Preview & Trip Health score (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trip Health Score widget with glowing stroke circle */}
          <div className="card-premium p-6 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#3054ff]/5 rounded-full blur-md" />
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center shadow-lg rounded-full">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                <circle cx="40" cy="40" r="32" stroke={healthScore > 85 ? '#10B981' : '#F59E0B'} strokeWidth="6" fill="transparent"
                  strokeDasharray="200" strokeDashoffset={200 - (200 * healthScore) / 100} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-sm font-black text-white">{healthScore}%</span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Trip Health Score</h3>
              <p className="text-slate-400 text-xs mt-1 font-bold">{healthLevel}</p>
            </div>
          </div>

          {/* Quick Settlements list */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">Settlement Plan</h2>
              <button onClick={() => navigate(`/trip/${id}/settlement`)} className="text-blue-400 text-xs font-bold hover:text-blue-300 flex items-center gap-1">
                View Flow <ArrowRight size={12} />
              </button>
            </div>
            {!summary?.settlements?.length ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-white font-bold text-sm">Balanced & settled!</p>
                <p className="text-slate-500 text-xs mt-1">No payment transactions needed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.settlements.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white/3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 max-w-[65%] truncate">
                      <TripIcon name={getMemberAvatar(s.from.emoji)} size={20} className="rounded-md" />
                      <span className="text-white text-xs font-bold truncate">{s.from.name}</span>
                      <ArrowRight size={12} className="text-slate-500 flex-shrink-0" />
                      <TripIcon name={getMemberAvatar(s.to.emoji)} size={20} className="rounded-md" />
                      <span className="text-white text-xs font-bold truncate">{s.to.name}</span>
                    </div>
                    <span className="text-amber-400 font-extrabold text-xs shrink-0">{formatINR(s.amount)}</span>
                  </div>
                ))}
                {summary.settlements.length > 4 && (
                  <p className="text-slate-500 text-[10px] text-center font-bold font-mono">+{summary.settlements.length - 4} MORE PENDING SETTLEMENTS</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Expenses */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-extrabold text-lg text-white">Recent Expenses</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-bold">Lately recorded trip spends</p>
          </div>
          <button onClick={() => navigate(`/trip/${id}/expenses`)} className="text-teal-400 text-xs font-bold hover:text-teal-300 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>
        {!trip?.expenses?.length ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-300 font-bold text-sm">No expenses recorded</p>
            <button onClick={() => navigate(`/trip/${id}/add`)} className="btn-primary mt-4 text-xs py-2 px-4">
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.expenses.slice(0, 3).map((exp, idx) => (
              <div key={idx} className="p-4 bg-[#121826] border border-white/5 rounded-2xl flex items-center gap-3.5 hover:border-teal-500/20 hover:bg-[#151c2d] transition-all">
                <TripIcon name={getCategoryIcon(exp.category)} size={36} className="shrink-0 animate-scale-up" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{exp.description || exp.category}</p>
                  <p className="text-slate-500 text-[10px] font-bold mt-0.5">{exp.paidBy?.name} paid · {formatDate(exp.date)}</p>
                </div>
                <span className="text-white font-extrabold text-sm shrink-0">{formatINR(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
