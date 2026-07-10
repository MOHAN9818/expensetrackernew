const express = require('express');
const router = express.Router();
const {
  getReminders,
  addReminder,
  payReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getReminders)
  .post(protect, addReminder);

router.route('/:id')
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

router.put('/:id/pay', protect, payReminder);

module.exports = router;
