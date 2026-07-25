const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendAlarmEmail = async (to, title, amount, dueDate, frequency) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`Mock Alarm Email sent to ${to}: Reminder for ${title}`);
    return;
  }
  try {
    const text = `Hello,\n\nThis is an automated alarm from your Expense Tracker.\n\nYour ${frequency} bill for "${title}" amounting to $${amount.toLocaleString()} is due on the ${dueDate}th.\n\nPlease log in to your account to mark it as paid once completed.\n\nThank you!`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Alarm: ${title} is due!`,
      text
    });
  } catch (error) {
    console.error('Error sending alarm email:', error);
  }
};

const initCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinute}`;
      const todayDateString = now.toISOString().split('T')[0];

      // Find pending reminders
      const pendingReminders = await Reminder.find({ status: 'pending' }).populate('userId');

      for (let reminder of pendingReminders) {
        if (!reminder.userId || !reminder.userId.email) continue;
        
        // Skip if email already sent today
        if (reminder.lastEmailSentAt) {
          const lastSentDateString = reminder.lastEmailSentAt.toISOString().split('T')[0];
          if (lastSentDateString === todayDateString) {
            continue;
          }
        }

        let shouldTrigger = false;

        // Check frequency conditions
        if (reminder.frequency === 'monthly') {
          if (reminder.dueDate === currentDay) {
            shouldTrigger = true;
          }
        } else if (reminder.frequency === 'quarterly') {
          const refMonth = reminder.dueMonth || (reminder.createdAt.getMonth() + 1);
          if (currentMonth % 3 === refMonth % 3 && reminder.dueDate === currentDay) {
            shouldTrigger = true;
          }
        } else if (reminder.frequency === 'yearly' || reminder.frequency === 'one-time') {
          if (reminder.dueMonth === currentMonth && reminder.dueDate === currentDay) {
            shouldTrigger = true;
          }
        }

        // Check time condition
        if (shouldTrigger && reminder.alarmTime === currentTimeString) {
          await sendAlarmEmail(
            reminder.userId.email,
            reminder.title,
            reminder.amount,
            reminder.dueDate,
            reminder.frequency
          );

          reminder.lastEmailSentAt = now;
          await reminder.save();
        }
      }
    } catch (error) {
      console.error('Error in alarm cron job:', error);
    }
  });

  console.log('Alarm scheduler initialized.');
};

module.exports = initCron;
