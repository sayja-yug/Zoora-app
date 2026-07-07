import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/client';

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startupName, setStartupName] = useState('');
  const [startupStage, setStartupStage] = useState('seed');
  const [startupSector, setStartupSector] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({
        email,
        password,
        role: 'founder',
        startupName,
        startupStage,
        startupSector
      });
      const { token, user } = res.data;

      localStorage.setItem('zoora_token', token);
      localStorage.setItem('zoora_user', JSON.stringify(user));
      localStorage.setItem('zoora_startup_name', startupName);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-in" style={{ maxWidth: 450 }}>
        <div className="login-logo">
          <div className="login-logo-text">
            <span style={{ color: 'var(--color-cyan)' }}>Z</span>oora
          </div>
          <div className="login-tagline">Founder Portal</div>
        </div>

        <h1 className="login-title">Register Startup</h1>
        <p className="login-subtitle">Create an account to submit your documents for scoring.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Startup Name</label>
            <input
              type="text"
              className="form-input"
              value={startupName}
              onChange={e => setStartupName(e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select 
                className="form-input" 
                value={startupStage}
                onChange={e => setStartupStage(e.target.value)}
              >
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="series-c+">Series C+</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sector</label>
              <input
                type="text"
                className="form-input"
                value={startupSector}
                onChange={e => setStartupSector(e.target.value)}
                placeholder="e.g. AI, FinTech"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Founder Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="founder@acme.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              required
              minLength={10}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="btn login-btn"
            style={{ marginTop: 24 }}
            disabled={loading}
          >
            {loading ? 'Registering…' : 'Register Startup'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            style={{ color: 'var(--color-cyan)', textDecoration: 'none', cursor: 'pointer' }}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
