/**
 * Quick sanity tests for settlement & split logic.
 * Run: node utils/calculations.test.js
 */
const {
  round2,
  computeSettlement,
  computeMemberStats,
  normalizeExpenseSplits,
  getExpenseShares,
} = require('./calculations');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL:', msg); }
}

// 5-friend example: total 25000, equal shares 5000 each
const members = [
  { _id: 'a', name: 'A' },
  { _id: 'b', name: 'B' },
  { _id: 'c', name: 'C' },
  { _id: 'd', name: 'D' },
  { _id: 'e', name: 'E' },
];

const expenses = [
  { amount: 10000, paidBy: { _id: 'a' }, sharedBy: members, splitMode: 'equal' },
  { amount: 5000, paidBy: { _id: 'b' }, sharedBy: members, splitMode: 'equal' },
  { amount: 4000, paidBy: { _id: 'c' }, sharedBy: members, splitMode: 'equal' },
  { amount: 3000, paidBy: { _id: 'd' }, sharedBy: members, splitMode: 'equal' },
  { amount: 3000, paidBy: { _id: 'e' }, sharedBy: members, splitMode: 'equal' },
];

const { stats, balances } = computeMemberStats(members, expenses);
assert(round2(balances.a) === 5000, 'A should receive 5000');
assert(round2(balances.b) === 0, 'B should be balanced');
assert(round2(balances.c) === -1000, 'C owes 1000');
assert(round2(balances.d) === -2000, 'D owes 2000');
assert(round2(balances.e) === -2000, 'E owes 2000');

const txs = computeSettlement(balances);
assert(txs.length === 3, 'Should need 3 transactions');
const totalTx = txs.reduce((s, t) => s + t.amount, 0);
assert(round2(totalTx) === 5000, 'Total transferred should be 5000');

// Custom split
const customExp = {
  amount: 2000,
  paidBy: { _id: 'a' },
  sharedBy: [{ _id: 'a' }, { _id: 'b' }],
  splitMode: 'custom',
  splits: [{ memberId: 'a', amount: 500 }, { memberId: 'b', amount: 1500 }],
};
const shares = getExpenseShares(customExp);
assert(shares.a === 500 && shares.b === 1500, 'Custom split amounts');

// Percentage split
const pctExp = {
  amount: 1000,
  paidBy: { _id: 'a' },
  sharedBy: [{ _id: 'a' }, { _id: 'b' }],
  splitMode: 'percentage',
  splits: [{ memberId: 'a', amount: 25 }, { memberId: 'b', amount: 75 }],
};
const pctShares = getExpenseShares(pctExp);
assert(pctShares.a === 250 && pctShares.b === 750, 'Percentage split');

// Validation
try {
  normalizeExpenseSplits({ amount: 100, sharedBy: ['a'], splitMode: 'custom', splits: [{ memberId: 'a', amount: 50 }] });
  assert(false, 'Should reject invalid custom sum');
} catch {
  assert(true, 'Rejects invalid custom sum');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
