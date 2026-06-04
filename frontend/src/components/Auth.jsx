import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ShieldAlert, Key, Dumbbell } from 'lucide-react';

export const Auth = ({ currentView, setView }) => {
  const { login, register, forgotPassword, resetPassword, error, toastMessage } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setLoading(true);
    await register(name, email, password);
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const sentCode = await forgotPassword(email);
    setLoading(false);
    if (sentCode) {
      setResetSent(true);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !code || !newPassword) return;
    setLoading(true);
    const success = await resetPassword(email, code, newPassword);
    setLoading(false);
    if (success) {
      setView('login');
      setResetSent(false);
      setCode('');
      setNewPassword('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(6,182,212,0.2)',
            marginBottom: '16px'
          }}>
            <Dumbbell size={32} className="text-gradient-cyan-violet" style={{ strokeWidth: 2.5 }} />
          </div>
          <h1 className="text-gradient-cyan-violet" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>PULSEFIT</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            {currentView === 'login' && 'Log in to track your gym stats and goals'}
            {currentView === 'register' && 'Begin your customized premium health journey'}
            {currentView === 'forgot' && !resetSent && 'Recover your dashboard account'}
            {currentView === 'forgot' && resetSent && 'Apply your numeric recovery passcode'}
          </p>
        </div>

        {/* Form View switching logic */}
        {currentView === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>PASSWORD</label>
                <span 
                  onClick={() => setView('forgot')} 
                  style={{ color: 'var(--color-cyan)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', hover: { textDecoration: 'underline' } }}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              New to PulseFit?{' '}
              <span onClick={() => setView('register')} style={{ color: 'var(--color-violet)', fontWeight: 600, cursor: 'pointer' }}>
                Create Account
              </span>
            </p>
          </form>
        )}

        {currentView === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  style={{ paddingLeft: '44px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Creating...' : 'Register'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <span onClick={() => setView('login')} style={{ color: 'var(--color-cyan)', fontWeight: 600, cursor: 'pointer' }}>
                Sign In
              </span>
            </p>
          </form>
        )}

        {currentView === 'forgot' && (
          <div>
            {!resetSent ? (
              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>EMAIL ADDRESS</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@domain.com"
                      style={{ paddingLeft: '44px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Request Code'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Back to{' '}
                  <span onClick={() => setView('login')} style={{ color: 'var(--color-cyan)', fontWeight: 600, cursor: 'pointer' }}>
                    Sign In
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleReset}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>RECOVERY CODE</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 6-digit code"
                      style={{ paddingLeft: '44px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>NEW PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      style={{ paddingLeft: '44px' }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Change Password'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Didn't receive it?{' '}
                  <span onClick={() => setResetSent(false)} style={{ color: 'var(--color-cyan)', fontWeight: 600, cursor: 'pointer' }}>
                    Resend Code
                  </span>
                </p>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
