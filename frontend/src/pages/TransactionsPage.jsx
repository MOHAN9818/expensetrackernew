import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TransactionsPage() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [searchQuery, setSearchQuery] = useState('');

  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Bonus', 'Gifts', 'Other'];
  const expenseCategories = ['Food', 'Groceries', 'Shopping', 'Rent', 'Utilities', 'Transport', 'Travel', 'Entertainment', 'Medical', 'Education', 'Other'];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/transactions`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch transactions');
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Update default category when transaction type changes
  useEffect(() => {
    if (type === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Food');
    }
  }, [type]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!description.trim() || !amount || !category) {
      setFormError('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          type,
          category,
          date: date ? new Date(date) : new Date()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add transaction');

      // Clear Form
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setFormSuccess(true);

      // Refresh list
      fetchTransactions();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete transaction');
      
      // Refresh list
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
      
      {/* Left side: Add Transaction Form */}
      <div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Add Transaction</h3>
          
          {formError && (
            <div style={{ color: 'var(--color-expense)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{ color: 'var(--color-income)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ✓ Transaction added successfully!
            </div>
          )}

          <form onSubmit={handleAddTransaction}>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => setType('income')}
              >
                Got (Income)
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setType('expense')}
              >
                Spent (Expense)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Monthly Salary, Grocery Shop"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add Transaction
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Filterable List */}
      <div>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Transaction History</h3>
            
            {/* Simple filters wrapper */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '350px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', width: '120px' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading history...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-expense)' }}>{error}</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <p>No transactions found matching the filters.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {filteredTransactions.map(tx => (
                <div key={tx._id} className="transaction-item">
                  <div className="tx-main">
                    <div className={`tx-icon-box ${tx.type}`}>
                      {tx.type === 'income' ? '📥' : '📤'}
                    </div>
                    <div className="tx-info">
                      <h5>{tx.description}</h5>
                      <span>{tx.category} • {new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="tx-amount-area">
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                    <button 
                      className="btn-delete-tx" 
                      onClick={() => handleDeleteTransaction(tx._id)}
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
