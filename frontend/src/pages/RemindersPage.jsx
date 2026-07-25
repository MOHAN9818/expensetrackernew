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
  const [frequency, setFrequency] = useState('monthly');
  const [dueMonth, setDueMonth] = useState('');
  const [alarmTime, setAlarmTime] = useState('09:00');
  
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

    if ((frequency === 'yearly' || frequency === 'one-time') && !dueMonth) {
      setFormError('Please select a due month for yearly/one-time alarms');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          dueDate: dueDay,
          frequency,
          dueMonth: dueMonth ? parseInt(dueMonth) : undefined,
          alarmTime
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add reminder');

      setTitle('');
      setAmount('');
      setDueDate('');
      setFrequency('monthly');
      setDueMonth('');
      setAlarmTime('09:00');
      
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
    if (!window.confirm('Are you sure you want to remove this alarm?')) return;

    try {
      const response = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete alarm');
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
          <h3 style={{ marginBottom: '1.25rem' }}>Set Email Alarm</h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Set a recurring or one-time email alarm for your bills. You will receive an email notification on the specific day and time.
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
              <label className="form-label">Frequency</label>
              <select className="form-input" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (Every 3 months)</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            {(frequency === 'yearly' || frequency === 'one-time' || frequency === 'quarterly') && (
              <div className="form-group">
                <label className="form-label">{frequency === 'quarterly' ? 'Starting Month' : 'Due Month'}</label>
                <select className="form-input" value={dueMonth} onChange={(e) => setDueMonth(e.target.value)} required>
                  <option value="">Select a month...</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Due Day of Month (1-31)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alarm Time</label>
              <input
                type="time"
                className="form-input"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Set Alarm
            </button>
          </form>
        </div>
      </div>

      {/* Right side: List of reminders */}
      <div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Active Email Alarms</h3>

          {loading ? (
            <p>Loading active alarms...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-expense)' }}>{error}</p>
          ) : reminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No email alarms set. Configure credit card bills, rent, etc. to get alarms!</p>
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
                    dueMsg = `Overdue by ${Math.abs(daysLeft)} day(s)!`;
                  } else if (daysLeft === 0) {
                    isCritical = true;
                    dueMsg = 'Due TODAY!';
                  } else if (daysLeft <= 5) {
                    isCritical = true;
                    dueMsg = `Due in ${daysLeft} day(s)`;
                  } else {
                    dueMsg = `Due on the ${rem.dueDate}th`;
                  }
                } else {
                  dueMsg = 'Paid';
                }

                return (
                  <div key={rem._id} className="glass-card reminder-card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span className={`reminder-status-badge ${rem.status}`}>
                      {rem.status}
                    </span>
                    
                    <h4 className="reminder-title">{rem.title}</h4>
                    <div className="reminder-amount">${rem.amount.toLocaleString()}</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <div className="reminder-due-date">
                        <span>⏰</span> 
                        <span className={isCritical ? 'critical' : ''}>{dueMsg}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ textTransform: 'capitalize' }}>{rem.frequency}</span> 
                        {rem.dueMonth && ` (Month: ${rem.dueMonth})`} 
                        {' '}@ {rem.alarmTime}
                      </div>
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
