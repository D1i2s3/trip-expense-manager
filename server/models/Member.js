const mongoose = require('mongoose');

const COLORS = [
  '#14B8A6','#F59E0B','#EF4444','#8B5CF6',
  '#EC4899','#06B6D4','#84CC16','#F97316'
];

const EMOJIS = ['😊','😎','🤩','🥳','🏄','🎒','✈️','🌴','🎯','🔥'];

const memberSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [50, 'Name too long']
    },
    color: {
      type: String,
      default: function () {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    },
    emoji: {
      type: String,
      default: function () {
        return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      }
    },
    upi: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
