const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Minimum-transaction settlement (greedy match largest debtor ↔ creditor).
 */
function computeSettlement(balances) {
  const creditors = [];
  const debtors = [];

  for (const [id, balance] of Object.entries(balances)) {
    const b = round2(balance);
    if (b > 0.005) creditors.push({ id, amount: b });
    else if (b < -0.005) debtors.push({ id, amount: -b });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.amount, d.amount);
    const rounded = round2(amount);

    if (rounded > 0) {
      transactions.push({ from: d.id, to: c.id, amount: rounded });
    }

    c.amount = round2(c.amount - amount);
    d.amount = round2(d.amount - amount);

    if (c.amount <= 0.005) ci++;
    if (d.amount <= 0.005) di++;
  }

  return transactions;
}

/** Resolve each member's fair share for one expense. */
function getExpenseShares(exp) {
  const total = round2(exp.amount);
  const mode = exp.splitMode || 'equal';
  const memberIds = (exp.sharedBy || []).map((m) =>
    (m._id || m).toString()
  );

  if (memberIds.length === 0) return {};

  const shares = {};

  if (mode === 'equal') {
    const each = round2(total / memberIds.length);
    let assigned = 0;
    memberIds.forEach((id, i) => {
      if (i === memberIds.length - 1) {
        shares[id] = round2(total - assigned);
      } else {
        shares[id] = each;
        assigned += each;
      }
    });
    return shares;
  }

  if (mode === 'custom' && Array.isArray(exp.splits) && exp.splits.length) {
    exp.splits.forEach((s) => {
      const id = (s.memberId?._id || s.memberId).toString();
      if (memberIds.includes(id)) {
        shares[id] = round2(s.amount);
      }
    });
    return shares;
  }

  if (mode === 'percentage' && Array.isArray(exp.splits) && exp.splits.length) {
    let assigned = 0;
    const entries = exp.splits.filter((s) => {
      const id = (s.memberId?._id || s.memberId).toString();
      return memberIds.includes(id);
    });

    entries.forEach((s, i) => {
      const id = (s.memberId?._id || s.memberId).toString();
      if (i === entries.length - 1) {
        shares[id] = round2(total - assigned);
      } else {
        const amt = round2(total * (Number(s.amount) / 100));
        shares[id] = amt;
        assigned += amt;
      }
    });
    return shares;
  }

  // Fallback: equal split
  const each = round2(total / memberIds.length);
  memberIds.forEach((id) => { shares[id] = each; });
  return shares;
}

function computeMemberStats(members, expenses) {
  const stats = {};
  members.forEach((m) => {
    stats[m._id.toString()] = {
      member: m,
      paid: 0,
      fairShare: 0,
      balance: 0,
    };
  });

  expenses.forEach((exp) => {
    const payerId = (exp.paidBy._id || exp.paidBy).toString();
    if (stats[payerId]) stats[payerId].paid += exp.amount;

    const shares = getExpenseShares(exp);
    Object.entries(shares).forEach(([sid, share]) => {
      if (stats[sid]) stats[sid].fairShare += share;
    });
  });

  const balances = {};
  Object.entries(stats).forEach(([id, s]) => {
    s.paid = round2(s.paid);
    s.fairShare = round2(s.fairShare);
    s.balance = round2(s.paid - s.fairShare);
    balances[id] = s.balance;
  });

  return { stats, balances };
}

/**
 * Validate and normalize split payload from API request.
 */
function normalizeExpenseSplits({ amount, sharedBy, splitMode = 'equal', splits = [] }) {
  const total = round2(amount);
  if (total <= 0) throw new Error('Amount must be positive');

  if (!Array.isArray(sharedBy) || sharedBy.length === 0) {
    throw new Error('At least one member must share the expense');
  }

  const mode = splitMode || 'equal';

  if (mode === 'equal') {
    return { splitMode: 'equal', splits: [], sharedBy };
  }

  if (!Array.isArray(splits) || splits.length === 0) {
    throw new Error('Split details are required for custom or percentage mode');
  }

  const sharedSet = new Set(sharedBy.map(String));
  const normalized = splits
    .filter((s) => sharedSet.has(String(s.memberId)))
    .map((s) => ({
      memberId: s.memberId,
      amount: round2(s.amount),
    }));

  if (normalized.length !== sharedBy.length) {
    throw new Error('Every shared member must have a split entry');
  }

  if (mode === 'custom') {
    const sum = round2(normalized.reduce((s, x) => s + x.amount, 0));
    if (Math.abs(sum - total) > 0.02) {
      throw new Error(`Custom splits must sum to ${total} (got ${sum})`);
    }
    normalized.forEach((s) => {
      if (s.amount <= 0) throw new Error('Each custom split must be positive');
    });
  }

  if (mode === 'percentage') {
    const sum = round2(normalized.reduce((s, x) => s + x.amount, 0));
    if (Math.abs(sum - 100) > 0.02) {
      throw new Error(`Percentages must sum to 100 (got ${sum})`);
    }
    normalized.forEach((s) => {
      if (s.amount <= 0) throw new Error('Each percentage must be positive');
    });
  }

  return { splitMode: mode, splits: normalized, sharedBy };
}

module.exports = {
  round2,
  computeSettlement,
  getExpenseShares,
  computeMemberStats,
  normalizeExpenseSplits,
};
