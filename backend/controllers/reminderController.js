const Reminder = require('../models/Reminder');
const { getStore } = require('../config/db');

// Helper to get current month string as YYYY-MM
const getCurrentMonthString = () => {
  return new Date().toISOString().slice(0, 7);
};

// @desc    Get user reminders (and auto-reset status if month changed)
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const store = getStore();
    if (store) {
      const reminders = await store.listReminders(req.user.id);
      return res.status(200).json(reminders);
    }

    const reminders = await Reminder.find({ userId: req.user.id });
    const currentMonth = getCurrentMonthString();
    let updated = false;

    // Check if any paid reminder needs to be reset for the new month
    const processedReminders = await Promise.all(
      reminders.map(async (reminder) => {
        if (reminder.status === 'paid' && reminder.lastPaidMonth !== currentMonth) {
          reminder.status = 'pending';
          await reminder.save();
          updated = true;
        }
        return reminder;
      })
    );

    res.status(200).json(processedReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new monthly reminder
// @route   POST /api/reminders
// @access  Private
const addReminder = async (req, res) => {
  try {
    const { title, amount, dueDate } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const store = getStore();
    if (store) {
      const reminder = await store.createReminder({
        userId: req.user.id,
        title,
        amount,
        dueDate
      });
      return res.status(201).json(reminder);
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      title,
      amount,
      dueDate
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark reminder as paid for this month
// @route   PUT /api/reminders/:id/pay
// @access  Private
const payReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const store = getStore();
    if (store) {
      const updatedReminder = await store.payReminder(req.params.id, req.user.id);
      if (!updatedReminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }
      return res.status(200).json(updatedReminder);
    }

    reminder.status = 'paid';
    reminder.lastPaidMonth = getCurrentMonthString();
    await reminder.save();

    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reminder info
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // If changing back to pending, reset lastPaidMonth if it matches current month
    if (req.body.status === 'pending' && reminder.status === 'paid') {
      req.body.lastPaidMonth = '';
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const store = getStore();
    if (store) {
      const removed = await store.deleteReminder(req.params.id, req.user.id);
      if (!removed) {
        return res.status(404).json({ message: 'Reminder not found' });
      }
      return res.status(200).json({ id: req.params.id, message: 'Reminder removed' });
    }

    await reminder.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Reminder removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReminders,
  addReminder,
  payReminder,
  updateReminder,
  deleteReminder
};
