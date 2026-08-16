const mongoose = require('mongoose');

const CATEGORIES = [
  'Food', 'Hotel', 'Transport', 'Activities',
  'Shopping', 'Entertainment', 'Medical', 'Other',
];

const splitEntrySchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Payer is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description too long'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
    },
    splitMode: {
      type: String,
      enum: ['equal', 'custom', 'percentage'],
      default: 'equal',
    },
    sharedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    }],
    splits: [splitEntrySchema],
  },
  { timestamps: true }
);

expenseSchema.pre('save', function (next) {
  if (!this.sharedBy || this.sharedBy.length === 0) {
    return next(new Error('At least one member must share the expense'));
  }
  this.amount = Math.round(this.amount * 100) / 100;
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
