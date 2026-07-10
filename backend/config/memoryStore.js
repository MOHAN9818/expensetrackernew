const crypto = require('crypto');

const getCurrentMonthString = () => new Date().toISOString().slice(0, 7);

const createMemoryStore = () => {
  const users = [];
  const transactions = [];
  const reminders = [];

  let userIdCounter = 1;
  let transactionIdCounter = 1;
  let reminderIdCounter = 1;

  const createUser = async ({ name, email, password }) => {
    const user = {
      _id: String(userIdCounter++),
      id: String(userIdCounter - 1),
      name,
      email: String(email).toLowerCase(),
      password,
      createdAt: new Date()
    };
    users.push(user);
    return user;
  };

  const findUserByEmail = async (email) => {
    return users.find((user) => user.email === String(email).toLowerCase()) || null;
  };

  const findUserById = async (id) => {
    return users.find((user) => user._id === String(id) || user.id === String(id)) || null;
  };

  const createTransaction = async ({ userId, description, amount, type, category, date }) => {
    const transaction = {
      _id: String(transactionIdCounter++),
      userId: String(userId),
      description,
      amount,
      type,
      category,
      date: date || new Date(),
      createdAt: new Date()
    };
    transactions.push(transaction);
    return transaction;
  };

  const listTransactions = async (userId) => {
    return transactions
      .filter((transaction) => transaction.userId === String(userId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const deleteTransaction = async (id, userId) => {
    const index = transactions.findIndex((transaction) => transaction._id === String(id) && transaction.userId === String(userId));
    if (index === -1) return null;
    const [removedTransaction] = transactions.splice(index, 1);
    return removedTransaction;
  };

  const createReminder = async ({ userId, title, amount, dueDate }) => {
    const reminder = {
      _id: String(reminderIdCounter++),
      userId: String(userId),
      title,
      amount,
      dueDate,
      status: 'pending',
      lastPaidMonth: '',
      createdAt: new Date()
    };
    reminders.push(reminder);
    return reminder;
  };

  const listReminders = async (userId) => {
    const currentMonth = getCurrentMonthString();
    return reminders
      .filter((reminder) => reminder.userId === String(userId))
      .map((reminder) => {
        if (reminder.status === 'paid' && reminder.lastPaidMonth !== currentMonth) {
          reminder.status = 'pending';
          reminder.lastPaidMonth = '';
        }
        return reminder;
      });
  };

  const payReminder = async (id, userId) => {
    const reminder = reminders.find((item) => item._id === String(id) && item.userId === String(userId));
    if (!reminder) return null;
    reminder.status = 'paid';
    reminder.lastPaidMonth = getCurrentMonthString();
    return reminder;
  };

  const deleteReminder = async (id, userId) => {
    const index = reminders.findIndex((reminder) => reminder._id === String(id) && reminder.userId === String(userId));
    if (index === -1) return null;
    const [removedReminder] = reminders.splice(index, 1);
    return removedReminder;
  };

  return {
    createUser,
    findUserByEmail,
    findUserById,
    createTransaction,
    listTransactions,
    deleteTransaction,
    createReminder,
    listReminders,
    payReminder,
    deleteReminder
  };
};

module.exports = createMemoryStore;
