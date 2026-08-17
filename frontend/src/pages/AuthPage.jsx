import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup States
  const [signupStep, setSignupStep] = useState(1); // 1 = Details, 2 = OTP & Password
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  
  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');

  // Shared States (OTP & Password)
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState(''); // Used for both signup and forgot password new password
  const [confirmPassword, setConfirmPassword] = useState('');

  // General States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, register, verifyOtp, googleLogin, forgotPassword, resetPassword } = useAuth();

  const resetMessages = () => {
    setError('');
    setMessage('');
  };

  const clearForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setForgotEmail('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setSignupStep(1);
    setForgotStep(1);
  };

  const toggleMode = (mode) => {
    resetMessages();
    clearForms();
    if (mode === 'login') {
      setIsLoginMode(true);
      setIsForgotPasswordMode(false);
    } else if (mode === 'signup') {
      setIsLoginMode(false);
      setIsForgotPasswordMode(false);
    } else if (mode === 'forgot') {
      setIsLoginMode(false);
      setIsForgotPasswordMode(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        throw new Error('Email and password are required');
      }
      const res = await login(loginEmail, loginPassword);
      if (res && res.notVerified) {
        throw new Error('Please sign up and verify your email first.');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupDetailsSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!signupName.trim() || !signupEmail.trim()) {
        throw new Error('Name and email are required');
      }
      await register(signupName, signupEmail);
      setSignupStep(2);
      setMessage('Registration initiated! Please check your email for the OTP.');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerifySubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!otp.trim()) throw new Error('OTP is required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      if (password !== confirmPassword) throw new Error('Passwords do not match');

      await verifyOtp(signupEmail, otp, password);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!forgotEmail.trim()) throw new Error('Email is required');
      await forgotPassword(forgotEmail);
      setForgotStep(2);
      setMessage('An OTP has been sent to your email to reset your password.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!otp.trim()) throw new Error('OTP is required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      if (password !== confirmPassword) throw new Error('Passwords do not match');

      await resetPassword(forgotEmail, otp, password);
      setMessage('Password successfully reset! You can now log in.');
      toggleMode('login'); // Switch back to login page
    } catch (err) {
      setError(err.message || 'Reset password failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    resetMessages();
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
        
        {/* Toggle Login/Signup (Hidden in Forgot Password mode) */}
        {!isForgotPasswordMode && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <button 
              className={`btn ${isLoginMode ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ flex: 1 }}
              onClick={() => toggleMode('login')}
            >
              Login
            </button>
            <button 
              className={`btn ${!isLoginMode ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ flex: 1 }}
              onClick={() => toggleMode('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="auth-header">
          <h2>
            {isForgotPasswordMode 
              ? (forgotStep === 1 ? 'Reset Password' : 'Create New Password')
              : isLoginMode 
              ? 'Welcome Back' 
              : signupStep === 1 ? 'Create an Account' : 'Verify & Set Password'}
          </h2>
          <p>
            {isForgotPasswordMode
              ? (forgotStep === 1 ? 'Enter your email to receive a password reset OTP' : 'Enter the OTP and your new secure password')
              : isLoginMode
              ? 'Enter your email and password to log in'
              : signupStep === 1
              ? 'Fill in your details to get started'
              : 'Enter the 6-digit OTP and create a secure password'}
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

        {/* LOGIN FORM */}
        {!isForgotPasswordMode && isLoginMode && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--color-income)', cursor: 'pointer', fontSize: '0.85rem' }}
                  onClick={() => toggleMode('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {/* SIGNUP FORM - STEP 1 */}
        {!isForgotPasswordMode && !isLoginMode && signupStep === 1 && (
          <form onSubmit={handleSignupDetailsSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {/* SIGNUP FORM - STEP 2 */}
        {!isForgotPasswordMode && !isLoginMode && signupStep === 2 && (
          <form onSubmit={handleSignupVerifySubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={signupEmail} disabled />
            </div>
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
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete Signup'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => { setSignupStep(1); setOtp(''); setPassword(''); setConfirmPassword(''); resetMessages(); }}
            >
              Back
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM - STEP 1 */}
        {isForgotPasswordMode && forgotStep === 1 && (
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset Link'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => toggleMode('login')}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM - STEP 2 */}
        {isForgotPasswordMode && forgotStep === 2 && (
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={forgotEmail} disabled />
            </div>
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
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => { setForgotStep(1); setOtp(''); setPassword(''); setConfirmPassword(''); resetMessages(); }}
            >
              Back
            </button>
          </form>
        )}

        {/* GOOGLE AUTH - Only show on standard login/signup first steps */}
        {!isForgotPasswordMode && (isLoginMode || signupStep === 1) && (
          <>
            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>or continue with</span>
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
