const Transaction = require('../models/Transaction');
const { getStore } = require('../config/db');

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const store = getStore();
    if (store) {
      const transactions = await store.listTransactions(req.user.id);
      return res.status(200).json(transactions);
    }

    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    if (!description || !amount || !type || !category) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const store = getStore();
    if (store) {
      const transaction = await store.createTransaction({
        userId: req.user.id,
        description,
        amount,
        type,
        category,
        date: date || new Date()
      });
      return res.status(201).json(transaction);
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      description,
      amount,
      type,
      category,
      date: date || new Date()
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check for user
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check for user
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const store = getStore();
    if (store) {
      const removed = await store.deleteTransaction(req.params.id, req.user.id);
      if (!removed) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      return res.status(200).json({ id: req.params.id, message: 'Transaction removed' });
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
};
