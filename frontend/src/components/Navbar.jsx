import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentPage, setCurrentPage }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}>
          <span>💸</span> FinControl
        </a>
        
        <ul className="nav-links">
          <li>
            <a 
              href="#dashboard" 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="#transactions" 
              className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('transactions'); }}
            >
              Transactions
            </a>
          </li>
          <li>
            <a 
              href="#reminders" 
              className={`nav-link ${currentPage === 'reminders' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('reminders'); }}
            >
              Bill Alarms
            </a>
          </li>
        </ul>

        <div className="nav-user">
          <span className="user-name">Hello, <strong>{user.name}</strong></span>
          <button className="btn btn-secondary btn-small" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
