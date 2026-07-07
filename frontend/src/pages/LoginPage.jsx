import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const { token, user } = res.data;

      localStorage.setItem('zoora_token', token);
      localStorage.setItem('zoora_user', JSON.stringify(user));

      if (user.role === 'founder') {
        navigate('/founder');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-in">
        <div className="login-logo">
          <div className="login-logo-text">
            <span style={{ color: 'var(--color-cyan)' }}>Z</span>oora
          </div>
          <div className="login-tagline">AI-Powered Startup Intelligence</div>
        </div>

        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">Access your investor or founder dashboard</p>

        {/* Demo mode notice */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: 12,
          color: 'var(--color-cyan)',
          lineHeight: 1.5,
        }}>
          <strong>Demo mode</strong> — running with mock data. Use any email &amp; any password (4+ chars) to log in as an investor.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@fund.com or founder@startup.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            id="login-submit"
            type="submit"
            className="btn login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Are you a founder? </span>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/register'); }}
            style={{ color: 'var(--color-cyan)', textDecoration: 'none', cursor: 'pointer' }}
          >
            Register your startup
          </a>
        </div>
        
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Powered by Claude AI
        </div>
      </div>
    </div>
  );
}
