import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RemindersPage() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reminders`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch reminders');
      setReminders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const dueDay = parseInt(dueDate);
    if (!title.trim() || !amount || isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      setFormError('Please enter a valid title, amount, and due day (1-31)');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          dueDate: dueDay
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add reminder');

      setTitle('');
      setAmount('');
      setDueDate('');
      setFormSuccess(true);
      fetchReminders();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handlePayReminder = async (id) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}/pay`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update reminder status');
      }
      fetchReminders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to remove this reminder?')) return;

    try {
      const response = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete reminder');
      }
      fetchReminders();
    } catch (err) {
      alert(err.message);
    }
  };

  const today = new Date();
  const currentDay = today.getDate();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
      
      {/* Left side: Add reminder form */}
      <div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Set Bill Alarm</h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Set a monthly recurring alert (alarm) for bills like credit cards, rent, or utilities. 
            The system resets them to pending automatically at the start of each month.
          </p>

          {formError && (
            <div style={{ color: 'var(--color-expense)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{ color: 'var(--color-income)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ✓ Alarm configured successfully!
            </div>
          )}

          <form onSubmit={handleAddReminder}>
            <div className="form-group">
              <label className="form-label">Alarm/Bill Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HDFC Credit Card Bill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bill Amount ($)</label>
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
              <label className="form-label">Due Day of Month (1-31)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15 (due on 15th every month)"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Set Monthly Alarm
            </button>
          </form>
        </div>
      </div>

      {/* Right side: List of reminders */}
      <div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Active Monthly Bill Alarms</h3>

          {loading ? (
            <p>Loading active alarms...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-expense)' }}>{error}</p>
          ) : reminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No monthly alarms set. Configure credit card bills, rent, etc. to get alarms!</p>
            </div>
          ) : (
            <div className="reminder-grid">
              {reminders.map(rem => {
                const daysLeft = rem.dueDate - currentDay;
                let isCritical = false;
                let dueMsg = '';

                if (rem.status === 'pending') {
                  if (daysLeft < 0) {
                    isCritical = true;
                    dueMsg = `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''}!`;
                  } else if (daysLeft === 0) {
                    isCritical = true;
                    dueMsg = 'Due TODAY!';
                  } else if (daysLeft <= 5) {
                    isCritical = true;
                    dueMsg = `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
                  } else {
                    dueMsg = `Due in ${daysLeft} days (on the ${rem.dueDate}th)`;
                  }
                } else {
                  dueMsg = 'Paid for this month';
                }

                return (
                  <div key={rem._id} className="glass-card reminder-card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span className={`reminder-status-badge ${rem.status}`}>
                      {rem.status}
                    </span>
                    
                    <h4 className="reminder-title">{rem.title}</h4>
                    <div className="reminder-amount">${rem.amount.toLocaleString()}</div>
                    
                    <div className="reminder-due-date">
                      <span>⏰</span> 
                      <span className={isCritical ? 'critical' : ''}>{dueMsg}</span>
                    </div>

                    <div className="reminder-actions">
                      {rem.status === 'pending' && (
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => handlePayReminder(rem._id)}
                          style={{ flex: 1, background: 'var(--color-income)', color: '#0b0f19', boxShadow: 'none' }}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => handleDeleteReminder(rem._id)}
                        style={{ color: 'var(--color-expense)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
                      >
                        Delete Alarm
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
