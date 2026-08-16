import { CheckSquare } from 'lucide-react';
import { formatINR } from '../utils/format';

const SPLIT_MODES = [
  { id: 'equal', label: 'Equal' },
  { id: 'custom', label: 'Custom ₹' },
  { id: 'percentage', label: 'Percentage' },
];

export default function SplitSelector({
  members,
  sharedBy,
  onSharedByChange,
  splitMode,
  onSplitModeChange,
  splits,
  onSplitsChange,
  totalAmount,
}) {
  const amount = Number(totalAmount) || 0;

  const toggleMember = (mid) => {
    const next = sharedBy.includes(mid)
      ? sharedBy.filter((x) => x !== mid)
      : [...sharedBy, mid];
    onSharedByChange(next);
    // Reset splits for newly selected members
    if (splitMode !== 'equal') {
      const map = Object.fromEntries(splits.map((s) => [s.memberId, s.amount]));
      onSplitsChange(
        next.map((id) => ({
          memberId: id,
          amount: map[id] ?? (splitMode === 'percentage' ? roundPct(next.length) : roundAmt(amount / next.length)),
        }))
      );
    }
  };

  const selectAll = () => {
    const ids = members.map((m) => m._id);
    onSharedByChange(ids);
    if (splitMode === 'percentage') {
      onSplitsChange(ids.map((id, i) => ({
        memberId: id,
        amount: i === ids.length - 1
          ? roundPct(100 - roundPct(100 / ids.length) * (ids.length - 1))
          : roundPct(100 / ids.length),
      })));
    } else if (splitMode === 'custom') {
      onSplitsChange(ids.map((id, i) => ({
        memberId: id,
        amount: i === ids.length - 1
          ? roundAmt(amount - roundAmt(amount / ids.length) * (ids.length - 1))
          : roundAmt(amount / ids.length),
      })));
    }
  };

  const clearAll = () => {
    onSharedByChange([]);
    onSplitsChange([]);
  };

  const updateSplit = (memberId, value) => {
    onSplitsChange(
      splits.map((s) =>
        s.memberId === memberId ? { ...s, amount: Number(value) || 0 } : s
      )
    );
  };

  const splitSum = splits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const target = splitMode === 'percentage' ? 100 : amount;
  const diff = roundAmt(splitSum - target);
  const isValid = sharedBy.length > 0 && Math.abs(diff) <= 0.02;

  const perPersonPreview = splitMode === 'equal' && sharedBy.length > 0 && amount > 0
    ? roundAmt(amount / sharedBy.length)
    : null;

  return (
    <div className="space-y-4">
      {/* Split mode toggle */}
      <div>
        <label className="label">Split Mode</label>
        <div className="flex flex-wrap gap-2">
          {SPLIT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSplitModeChange(m.id);
                if (m.id === 'equal') {
                  onSplitsChange([]);
                } else if (m.id === 'percentage' && sharedBy.length) {
                  onSplitsChange(sharedBy.map((id, i) => ({
                    memberId: id,
                    amount: i === sharedBy.length - 1
                      ? roundPct(100 - roundPct(100 / sharedBy.length) * (sharedBy.length - 1))
                      : roundPct(100 / sharedBy.length),
                  })));
                } else if (m.id === 'custom' && sharedBy.length && amount) {
                  onSplitsChange(sharedBy.map((id, i) => ({
                    memberId: id,
                    amount: i === sharedBy.length - 1
                      ? roundAmt(amount - roundAmt(amount / sharedBy.length) * (sharedBy.length - 1))
                      : roundAmt(amount / sharedBy.length),
                  })));
                }
              }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                splitMode === m.id
                  ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Shared By *</label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-teal-400 text-xs hover:text-teal-300 flex items-center gap-1">
              <CheckSquare size={12} /> All
            </button>
            <span className="text-slate-600">·</span>
            <button type="button" onClick={clearAll} className="text-slate-500 text-xs hover:text-slate-400">None</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => toggleMember(m._id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                sharedBy.includes(m._id)
                  ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {sharedBy.includes(m._id) && <CheckSquare size={13} />}
              <span>{m.emoji}</span> {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom / percentage inputs */}
      {splitMode !== 'equal' && sharedBy.length > 0 && (
        <div className="space-y-2">
          <label className="label">
            {splitMode === 'percentage' ? 'Percentage per member (must sum to 100%)' : 'Amount per member (must sum to total)'}
          </label>
          {sharedBy.map((mid) => {
            const member = members.find((m) => m._id === mid);
            const entry = splits.find((s) => s.memberId === mid);
            return (
              <div key={mid} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-28 truncate shrink-0">
                  {member?.emoji} {member?.name}
                </span>
                <div className="relative flex-1">
                  {splitMode === 'custom' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 text-sm">₹</span>
                  )}
                  <input
                    type="number"
                    min="0.01"
                    step={splitMode === 'percentage' ? '1' : '0.01'}
                    className={`input ${splitMode === 'custom' ? 'pl-7' : ''}`}
                    value={entry?.amount ?? ''}
                    onChange={(e) => updateSplit(mid, e.target.value)}
                  />
                  {splitMode === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                  )}
                </div>
                {splitMode === 'percentage' && amount > 0 && entry?.amount && (
                  <span className="text-xs text-slate-500 w-20 text-right shrink-0">
                    = {formatINR(amount * entry.amount / 100)}
                  </span>
                )}
              </div>
            );
          })}
          <p className={`text-xs ${isValid ? 'text-teal-400' : 'text-red-400'}`}>
            Sum: {splitMode === 'percentage' ? `${roundPct(splitSum)}%` : formatINR(splitSum)}
            {!isValid && ` (need ${splitMode === 'percentage' ? '100%' : formatINR(amount)})`}
          </p>
        </div>
      )}

      {/* Equal split preview */}
      {perPersonPreview && (
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
          <p className="text-teal-400 text-sm font-medium">
            Split Preview: {formatINR(perPersonPreview)} per person among {sharedBy.length} member{sharedBy.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function roundAmt(n) {
  return Math.round(Number(n) * 100) / 100;
}

function roundPct(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function initSplits(members, mode = 'equal', amount = 0) {
  const ids = members.map((m) => m._id);
  if (mode === 'percentage') {
    return ids.map((id, i) => ({
      memberId: id,
      amount: i === ids.length - 1
        ? roundPct(100 - roundPct(100 / ids.length) * (ids.length - 1))
        : roundPct(100 / ids.length),
    }));
  }
  if (mode === 'custom' && amount > 0) {
    return ids.map((id, i) => ({
      memberId: id,
      amount: i === ids.length - 1
        ? roundAmt(amount - roundAmt(amount / ids.length) * (ids.length - 1))
        : roundAmt(amount / ids.length),
    }));
  }
  return [];
}

export function validateSplitForm(splitMode, sharedBy, splits, amount) {
  if (sharedBy.length === 0) return 'Select at least one member to share';
  if (splitMode === 'equal') return null;
  const target = splitMode === 'percentage' ? 100 : Number(amount);
  const sum = splits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  if (Math.abs(sum - target) > 0.02) {
    return splitMode === 'percentage'
      ? 'Percentages must sum to 100'
      : 'Custom amounts must sum to the expense total';
  }
  return null;
}
