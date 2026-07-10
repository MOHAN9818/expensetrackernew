const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  dueDate: {
    type: Number,
    required: [true, 'Please specify a due day of the month (1-31)'],
    min: [1, 'Day must be at least 1'],
    max: [31, 'Day must be at most 31']
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  lastPaidMonth: {
    type: String, // format "YYYY-MM" (e.g. "2026-07")
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
