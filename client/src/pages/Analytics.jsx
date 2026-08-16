import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import api from '../utils/api';
import { formatINR, CATEGORY_COLORS } from '../utils/format';
import toast from 'react-hot-toast';
import TripIcon from '../components/TripIcon';

const getTripIconName = (name) => {
  switch (name) {
    case 'totalSpent': return 'creditCard';
    case 'howItWorks': return 'activities';
    case 'createTrip': return 'backpack';
    case 'addExpense': return 'shakingHands';
    default: return 'backpack';
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-light border border-white/10 rounded-2xl p-3 shadow-2xl glass">
      {label && <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">{label}</p>}
      {payload.map((p, idx) => (
        <p key={idx} className="text-xs font-bold flex items-center gap-1.5" style={{ color: p.color || p.fill }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          {p.name}: {typeof p.value === 'number' ? formatINR(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/trips/${id}/summary`),
      api.get(`/trips/${id}/expenses`)
    ]).then(([sRes, eRes]) => {
      setSummary(sRes.data);
      setExpenses(eRes.data);
    }).catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse max-w-6xl mx-auto">
      {[1,2,3,4].map(i => <div key={i} className="h-72 bg-white/5 rounded-3xl" />)}
    </div>
  );

  // Chart 1: Member contribution vs Fair Share
  const memberData = summary?.memberStats?.map(s => ({
    name: s.member.name,
    Paid: s.paid,
    'Fair Share': s.fairShare,
  })) || [];

  // Chart 2: Category spending donut
  const categoryData = Object.entries(summary?.categoryTotals || {}).map(([cat, val]) => ({
    name: cat, value: val, color: CATEGORY_COLORS[cat] || '#64748B'
  }));

  // Chart 3: Daily expenses line
  const dailyMap = {};
  expenses.forEach(e => {
    const d = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    dailyMap[d] = (dailyMap[d] || 0) + e.amount;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, amount]) => ({ date, amount }));

  // Chart 4: Balance Radar
  const radarData = summary?.memberStats?.map(s => ({
    name: s.member.name,
    Balance: Math.abs(s.balance),
    Paid: s.paid,
  })) || [];

  // Find max spending day and max expense item
  const maxExpense = expenses.reduce((max, current) => {
    if (!max || current.amount > max.amount) return current;
    return max;
  }, null);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Visual Analytics</h1>
        <p className="text-slate-400 text-xs mt-1">Spending trends and financial insights</p>
      </div>

      {/* KPI strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: formatINR(summary?.totalExpense), iconName: 'totalSpent' },
          { label: 'Expenses Items', value: summary?.expenseCount || 0, iconName: 'howItWorks' },
          { label: 'Travelers', value: summary?.memberCount || 0, iconName: 'createTrip' },
          { label: 'Settlements', value: summary?.settlements?.length || 0, iconName: 'addExpense' },
        ].map((k, i) => (
          <div key={i} className="card-premium p-5 flex flex-col items-center justify-center text-center">
            <TripIcon name={getTripIconName(k.iconName)} size={36} className="shadow-md mb-2" />
            <p className="text-white font-extrabold text-xl tracking-tight mt-1">{k.value}</p>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contributions */}
        <div className="card-premium p-6">
          <h2 className="font-extrabold text-white text-base mb-4">Paid vs Fair Share</h2>
          {memberData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs">No data recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={memberData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold' }} />
                <Bar dataKey="Paid" fill="#3054ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fair Share" fill="#b4c0ff" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Categories */}
        <div className="card-premium p-6">
          <h2 className="font-extrabold text-white text-base mb-4">Spending by Category</h2>
          {categoryData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs">No data recorded</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={240} className="sm:w-[50%]">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1 w-full">
                {categoryData.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-white/2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="text-slate-300 text-xs font-semibold">{CATEGORY_ICONS[c.name]} {c.name}</span>
                    </div>
                    <span className="text-white text-xs font-bold">{formatINR(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Area Chart */}
        <div className="card-premium p-6">
          <h2 className="font-extrabold text-white text-base mb-4">Daily Spending</h2>
          {dailyData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs">No data recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#3054ff" strokeWidth={3}
                  dot={{ r: 4, fill: '#3054ff', strokeWidth: 1.5, stroke: '#000000' }}
                  activeDot={{ r: 6, fill: '#3054ff' }} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar Map */}
        <div className="card-premium p-6">
          <h2 className="font-extrabold text-white text-base mb-4">Balance Radar</h2>
          {radarData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-500 text-xs">No data recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.03)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} />
                <Radar name="Amount Paid" dataKey="Paid" stroke="#3054ff" fill="#3054ff" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Net Balance" dataKey="Balance" stroke="#b4c0ff" fill="#b4c0ff" fillOpacity={0.1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary highlight highlights */}
      {maxExpense && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-premium p-5 flex items-center gap-4 bg-[#3054ff]/5">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Largest Expense item</p>
              <p className="text-white font-extrabold text-base mt-0.5">{maxExpense.description || maxExpense.category}</p>
              <p className="text-blue-400 text-sm font-bold mt-0.5">{formatINR(maxExpense.amount)} paid by {maxExpense.paidBy?.name}</p>
            </div>
          </div>
          <div className="card-premium p-5 flex items-center gap-4 bg-amber-500/5">
            <span className="text-3xl">🗓️</span>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Peak Expense Category</p>
              <p className="text-white font-extrabold text-base mt-0.5">
                {Object.entries(summary?.categoryTotals || {}).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </p>
              <p className="text-amber-400 text-sm font-bold mt-0.5">
                Total spent: {formatINR(Object.entries(summary?.categoryTotals || {}).sort((a,b) => b[1] - a[1])[0]?.[1] || 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
