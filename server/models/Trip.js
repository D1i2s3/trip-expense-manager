const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      maxlength: [100, 'Name too long']
    },
    date: {
      type: Date,
      required: [true, 'Trip date is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description too long'],
      default: ''
    },
    coverEmoji: {
      type: String,
      default: '✈️'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Fallback for legacy trips
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
