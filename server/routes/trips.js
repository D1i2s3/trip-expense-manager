const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Member = require('../models/Member');
const Expense = require('../models/Expense');
const authMiddleware = require('../utils/authMiddleware');

// GET /api/trips — list all trips with member count + total
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    // Show trips created by current user, or trips with no creator (legacy/demo)
    const trips = await Trip.find({
      $or: [
        { creator: req.user._id },
        { creator: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      trips.map(async (trip) => {
        const memberCount = await Member.countDocuments({ tripId: trip._id });
        const expenses = await Expense.find({ tripId: trip._id });
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        return { ...trip.toObject(), memberCount, total };
      })
    );
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/trips — create trip
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, date, description, coverEmoji, members } = req.body;
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }
    const trip = await Trip.create({
      name,
      date,
      description,
      coverEmoji,
      creator: req.user._id
    });

    // Create initial members if provided
    if (Array.isArray(members) && members.length > 0) {
      await Member.insertMany(
        members.map((m) => ({ tripId: trip._id, name: m.name || m }))
      );
    }
    const memberCount = await Member.countDocuments({ tripId: trip._id });
    res.status(201).json({ ...trip.toObject(), memberCount, total: 0 });
  } catch (err) { next(err); }
});

// GET /api/trips/:id — single trip detail
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const members = await Member.find({ tripId: trip._id });
    const expenses = await Expense.find({ tripId: trip._id })
      .populate('paidBy', 'name color emoji')
      .populate('sharedBy', 'name color emoji')
      .sort({ date: -1 });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    res.json({ ...trip.toObject(), members, expenses, total });
  } catch (err) { next(err); }
});

// PUT /api/trips/:id — update trip
router.put('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) { next(err); }
});

// DELETE /api/trips/:id — delete trip + all data
router.delete('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    await Member.deleteMany({ tripId: req.params.id });
    await Expense.deleteMany({ tripId: req.params.id });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
