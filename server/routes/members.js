const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Expense = require('../models/Expense');

// GET /api/trips/:id/members
router.get('/:id/members', async (req, res, next) => {
  try {
    const members = await Member.find({ tripId: req.params.id });
    res.json(members);
  } catch (err) { next(err); }
});

// POST /api/trips/:id/members
router.post('/:id/members', async (req, res, next) => {
  try {
    const { name, color, emoji, upi } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const member = await Member.create({ tripId: req.params.id, name, color, emoji, upi });
    res.status(201).json(member);
  } catch (err) { next(err); }
});

// PUT /api/trips/:id/members/:mid
router.put('/:id/members/:mid', async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.mid, tripId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) { next(err); }
});

// DELETE /api/trips/:id/members/:mid
router.delete('/:id/members/:mid', async (req, res, next) => {
  try {
    const member = await Member.findOneAndDelete({
      _id: req.params.mid,
      tripId: req.params.id
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Check if member has any expenses
    const hasPaid = await Expense.countDocuments({ paidBy: req.params.mid });
    const hasShared = await Expense.countDocuments({ sharedBy: req.params.mid });
    if (hasPaid + hasShared > 0) {
      // Re-create — cannot delete member with expenses
      await Member.create({
        _id: member._id,
        tripId: member.tripId,
        name: member.name,
        color: member.color,
        emoji: member.emoji
      });
      return res.status(400).json({
        error: 'Cannot remove member who has expenses. Remove their expenses first.'
      });
    }
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
});

module.exports = router;
