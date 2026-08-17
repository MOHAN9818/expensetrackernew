import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ setCurrentPage }) {
  const { getAuthHeaders, API_URL, changePassword } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch transactions
      const txRes = await fetch(`${API_URL}/transactions`, {
        headers: getAuthHeaders()
      });
      const txData = await txRes.json();
      if (!txRes.ok) throw new Error(txData.message || 'Failed to fetch transactions');

      // Fetch reminders
      const remRes = await fetch(`${API_URL}/reminders`, {
        headers: getAuthHeaders()
      });
      const remData = await remRes.json();
      if (!remRes.ok) throw new Error(remData.message || 'Failed to fetch reminders');

      setTransactions(txData);
      setReminders(remData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayReminder = async (id) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}/pay`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to pay reminder');
      }
      // Refresh data
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password should be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  // Find active reminders/alarms
  // An alarm is triggered if: status is 'pending' AND (due within 5 days OR past due)
  const today = new Date();
  const currentDay = today.getDate();
  
  const activeAlarms = reminders.filter(r => {
    if (r.status !== 'pending') return false;
    const daysLeft = r.dueDate - currentDay;
    // Alarm if overdue (daysLeft < 0) or due soon (daysLeft <= 5)
    return daysLeft <= 5;
  });

  // Calculate expense categories percentages
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  const expenseCategoriesMap = {};
  expenseTransactions.forEach(tx => {
    expenseCategoriesMap[tx.category] = (expenseCategoriesMap[tx.category] || 0) + tx.amount;
  });

  const expenseCategoriesData = Object.keys(expenseCategoriesMap).map(cat => ({
    name: cat,
    amount: expenseCategoriesMap[cat],
    percentage: totalExpense > 0 ? Math.round((expenseCategoriesMap[cat] / totalExpense) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const expenseColors = ['#6366f1', '#f59e0b', '#f43f5e', '#a855f7', '#38bdf8', '#fb923c', '#22c55e', '#e879f9', '#94a3b8'];

  let expenseChartAngle = 0;
  const expenseChartBackground = expenseCategoriesData.length === 0
    ? 'conic-gradient(#334155 0deg 360deg)'
    : expenseCategoriesData.map((cat, index) => {
        const slice = totalExpense > 0 ? (cat.amount / totalExpense) * 360 : 0;
        const start = expenseChartAngle;
        expenseChartAngle += slice;
        return `${expenseColors[index % expenseColors.length]} ${start.toFixed(1)}deg ${expenseChartAngle.toFixed(1)}deg`;
      }).join(', ');

  // Calculate income categories percentages
  const incomeTransactions = transactions.filter(tx => tx.type === 'income');
  const incomeCategoriesMap = {};
  incomeTransactions.forEach(tx => {
    incomeCategoriesMap[tx.category] = (incomeCategoriesMap[tx.category] || 0) + tx.amount;
  });

  const incomeCategoriesData = Object.keys(incomeCategoriesMap).map(cat => ({
    name: cat,
    amount: incomeCategoriesMap[cat],
    percentage: totalIncome > 0 ? Math.round((incomeCategoriesMap[cat] / totalIncome) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const incomeColors = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857', '#a7f3d0'];

  let incomeChartAngle = 0;
  const incomeChartBackground = incomeCategoriesData.length === 0
    ? 'conic-gradient(#334155 0deg 360deg)'
    : incomeCategoriesData.map((cat, index) => {
        const slice = totalIncome > 0 ? (cat.amount / totalIncome) * 360 : 0;
        const start = incomeChartAngle;
        incomeChartAngle += slice;
        return `${incomeColors[index % incomeColors.length]} ${start.toFixed(1)}deg ${incomeChartAngle.toFixed(1)}deg`;
      }).join(', ');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Loading financial data...</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Alarm Message Section */}
      {activeAlarms.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⏰</span> Active Bill Alarms ({activeAlarms.length})
          </h3>
          {activeAlarms.map(alarm => {
            const daysLeft = alarm.dueDate - currentDay;
            let statusText = '';
            let isOverdue = false;

            if (daysLeft < 0) {
              statusText = `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''}`;
              isOverdue = true;
            } else if (daysLeft === 0) {
              statusText = 'Due today!';
            } else {
              statusText = `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''} (on the ${alarm.dueDate}th)`;
            }

            return (
              <div key={alarm._id} className="alert-banner">
                <div className="alert-message">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-text">
                    <h5>{alarm.title} Payment Required</h5>
                    <p>
                      Amount: <strong>${alarm.amount.toLocaleString()}</strong> • Status: <span style={{ color: isOverdue ? 'var(--color-expense)' : 'var(--color-warning)', fontWeight: '700' }}>{statusText}</span>
                    </p>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-small" 
                  onClick={() => handlePayReminder(alarm._id)}
                  style={{ background: 'var(--color-income)', color: '#0b0f19', boxShadow: 'none' }}
                >
                  Pay Now
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Stats (Got, Spent, Balance) */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon income">💵</div>
          <div className="stat-info">
            <h4>Total Got (Salary/Income)</h4>
            <div className="stat-value">${totalIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon expense">💸</div>
          <div className="stat-info">
            <h4>Total Spent (Expenses)</h4>
            <div className="stat-value" style={{ color: 'var(--color-expense)' }}>
              ${totalExpense.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon balance">⚖️</div>
          <div className="stat-info">
            <h4>Net Balance</h4>
            <div className="stat-value" style={{ color: balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
              ${balance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Two-Column Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Recent Transactions & Category Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Category Summary (Expenses) */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Expense Breakdown</h3>
            {expenseCategoriesData.length === 0 ? (
              <div className="empty-state">
                <p>No expenses logged yet. Add some on the Transactions page!</p>
              </div>
            ) : (
              <div className="expense-visual-card">
                <div className="expense-chart-shell">
                  <div className="expense-pie-chart" style={{ background: `conic-gradient(${expenseChartBackground})` }}>
                    <div className="expense-pie-center">
                      <span>Total</span>
                      <strong>${totalExpense.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="expense-chart-legend">
                  {expenseCategoriesData.map((cat, index) => (
                    <div key={cat.name} className="expense-legend-item">
                      <span className="expense-legend-swatch" style={{ background: expenseColors[index % expenseColors.length] }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="expense-legend-top">
                          <span>{cat.name}</span>
                          <strong>${cat.amount.toLocaleString()}</strong>
                        </div>
                        <div className="expense-legend-bottom">{cat.percentage}% of expenses</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Category Summary (Income) */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Income Breakdown</h3>
            {incomeCategoriesData.length === 0 ? (
              <div className="empty-state">
                <p>No income logged yet. Add some on the Transactions page!</p>
              </div>
            ) : (
              <div className="expense-visual-card">
                <div className="expense-chart-shell">
                  <div className="expense-pie-chart" style={{ background: `conic-gradient(${incomeChartBackground})` }}>
                    <div className="expense-pie-center">
                      <span>Total</span>
                      <strong>${totalIncome.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="expense-chart-legend">
                  {incomeCategoriesData.map((cat, index) => (
                    <div key={cat.name} className="expense-legend-item">
                      <span className="expense-legend-swatch" style={{ background: incomeColors[index % incomeColors.length] }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="expense-legend-top">
                          <span>{cat.name}</span>
                          <strong>${cat.amount.toLocaleString()}</strong>
                        </div>
                        <div className="expense-legend-bottom">{cat.percentage}% of income</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Feed */}
          <div className="glass-card">
            <div className="feed-header">
              <h3 className="feed-title">Recent Activity</h3>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => setCurrentPage('transactions')}
              >
                View All
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No transactions added yet.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {transactions.slice(0, 5).map(tx => (
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
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Actions & Upcoming Reminders summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Actions */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3>Quick Actions</h3>
            <button className="btn btn-primary" onClick={() => setCurrentPage('transactions')}>
              ➕ Add Transaction
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('reminders')}>
              ⏰ Manage Alarms
            </button>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
            {passwordMessage && (
              <div className="form-success-message" style={{ marginBottom: '0.75rem' }}>{passwordMessage}</div>
            )}
            {passwordError && (
              <div className="form-error-message" style={{ marginBottom: '0.75rem' }}>{passwordError}</div>
            )}
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <input
                type="password"
                className="form-input"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
              <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Reminders/Alarms Widget */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Monthly Bills Tracker</h3>
            {reminders.length === 0 ? (
              <div className="empty-state" style={{ padding: '1rem' }}>
                <p>No monthly alarms configured.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reminders.map(rem => (
                  <div 
                    key={rem._id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{rem.title}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Due day: {rem.dueDate}th
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                        ${rem.amount.toLocaleString()}
                      </div>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          color: rem.status === 'paid' ? 'var(--color-income)' : 'var(--color-warning)' 
                        }}
                      >
                        {rem.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
