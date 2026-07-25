import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage() {
  // steps: 1 = Email, 2 = Name (Signup), 3 = OTP
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { checkEmail, register, verifyOtp, googleLogin } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!email.trim()) throw new Error('Email is required');
      const res = await checkEmail(email);
      if (res.exists) {
        setStep(3); // Go to OTP step for login
        setMessage(res.message || 'OTP sent to your email for login.');
      } else {
        setStep(2); // Go to Name step for signup
        setMessage(res.message || 'User not found. Please provide your name to sign up.');
      }
    } catch (err) {
      setError(err.message || 'Error checking email');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('Name is required');
      await register(name, email);
      setStep(3); // Go to OTP step for signup
      setMessage('Registration initiated! Please check your email for the OTP.');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!otp.trim()) throw new Error('OTP is required');
      await verifyOtp(email, otp);
      // Context sets user and App.jsx handles redirect
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>
            {step === 1 ? 'Welcome' : step === 2 ? 'Complete Signup' : 'Verify OTP'}
          </h2>
          <p>
            {step === 1
              ? 'Enter your email to sign in or create an account'
              : step === 2
              ? 'Please provide your full name to continue'
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-expense-glow)',
            border: '1px solid var(--color-expense)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'var(--color-income-glow)',
            border: '1px solid var(--color-income)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ✅ {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Checking...' : 'Continue with Email'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNameSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => { setStep(1); setError(''); setMessage(''); }}
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
            >
              Use a different email
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>or</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google Sign-In was unsuccessful. Try again later.');
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
