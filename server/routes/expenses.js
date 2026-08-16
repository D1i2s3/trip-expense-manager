const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { round2, normalizeExpenseSplits } = require('../utils/calculations');

const populateOpts = [
  { path: 'paidBy', select: 'name color emoji' },
  { path: 'sharedBy', select: 'name color emoji' },
];

// GET /api/trips/:id/expenses — with optional filters
router.get('/:id/expenses', async (req, res, next) => {
  try {
    const { paidBy, category, startDate, endDate } = req.query;
    const filter = { tripId: req.params.id };
    if (paidBy) filter.paidBy = paidBy;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    const expenses = await Expense.find(filter)
      .populate(populateOpts)
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) { next(err); }
});

function buildExpenseBody(body) {
  const {
    paidBy, amount, category, description, date,
    sharedBy, splitMode, splits,
  } = body;

  if (!paidBy || amount == null || !date) {
    const err = new Error('paidBy, amount and date are required');
    err.status = 400;
    throw err;
  }

  const normalized = normalizeExpenseSplits({
    amount: Number(amount),
    sharedBy,
    splitMode,
    splits,
  });

  return {
    paidBy,
    amount: round2(Number(amount)),
    category: category || 'Other',
    description: description || '',
    date,
    ...normalized,
  };
}

// POST /api/trips/:id/expenses
router.post('/:id/expenses', async (req, res, next) => {
  try {
    const data = buildExpenseBody(req.body);
    const expense = await Expense.create({ tripId: req.params.id, ...data });
    const populated = await expense.populate(populateOpts);
    res.status(201).json(populated);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// PUT /api/trips/:id/expenses/:eid
router.put('/:id/expenses/:eid', async (req, res, next) => {
  try {
    const existing = await Expense.findOne({
      _id: req.params.eid,
      tripId: req.params.id,
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const merged = {
      paidBy: req.body.paidBy ?? existing.paidBy,
      amount: req.body.amount ?? existing.amount,
      category: req.body.category ?? existing.category,
      description: req.body.description ?? existing.description,
      date: req.body.date ?? existing.date,
      sharedBy: req.body.sharedBy ?? existing.sharedBy.map(String),
      splitMode: req.body.splitMode ?? existing.splitMode,
      splits: req.body.splits ?? existing.splits,
    };

    const data = buildExpenseBody(merged);
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.eid, tripId: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    ).populate(populateOpts);

    res.json(expense);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// DELETE /api/trips/:id/expenses/:eid
router.delete('/:id/expenses/:eid', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.eid,
      tripId: req.params.id,
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
