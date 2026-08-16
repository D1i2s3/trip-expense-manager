const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Expense = require('../models/Expense');
const { round2, computeSettlement, computeMemberStats } = require('../utils/calculations');

// GET /api/trips/:id/summary
router.get('/:id/summary', async (req, res, next) => {
  try {
    const members = await Member.find({ tripId: req.params.id });
    const expenses = await Expense.find({ tripId: req.params.id })
      .populate('paidBy', 'name color emoji')
      .populate('sharedBy', 'name color emoji');

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const { stats, balances } = computeMemberStats(members, expenses);

    const rawTransactions = computeSettlement(balances);
    const memberMap = {};
    members.forEach((m) => { memberMap[m._id.toString()] = m; });

    const settlements = rawTransactions.map((t) => ({
      from: memberMap[t.from],
      to: memberMap[t.to],
      amount: t.amount,
    }));

    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    // Per-member spending (amount they paid)
    const paidByMember = {};
    Object.values(stats).forEach((s) => {
      paidByMember[s.member.name] = s.paid;
    });

    res.json({
      totalExpense: round2(totalExpense),
      memberCount: members.length,
      expenseCount: expenses.length,
      memberStats: Object.values(stats),
      settlements,
      categoryTotals,
      paidByMember,
    });
  } catch (err) { next(err); }
});

module.exports = router;
