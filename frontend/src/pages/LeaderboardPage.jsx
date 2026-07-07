import React, { useEffect, useState } from 'react';
import { Leaderboard } from '../components/Leaderboard';
import { getLeaderboard } from '../api/client';

export function LeaderboardPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getLeaderboard();
      setStartups(res.data.startups);
      setLastRefreshed(new Date());
    } catch {
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Stats
  const avgScore = startups.length > 0
    ? startups.reduce((s, x) => s + x.total_weighted_score, 0) / startups.length
    : 0;
  const topScore = startups.length > 0
    ? Math.max(...startups.map(s => s.total_weighted_score))
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Startup Leaderboard</h1>
          <p className="page-subtitle">
            {startups.length} startups · Updated {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <button
          id="refresh-leaderboard"
          className="btn btn-ghost"
          onClick={load}
          disabled={loading}
        >
          {loading ? '↻ Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Startups</div>
          <div className="stat-value accent">{startups.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Portfolio Average Score</div>
          <div className="stat-value">{avgScore.toFixed(1)}<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/10</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Score</div>
          <div className="stat-value" style={{ color: 'var(--color-emerald)' }}>{topScore.toFixed(1)}<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/10</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Profile Completeness</div>
          <div className="stat-value">
            {startups.length > 0
              ? Math.round(startups.reduce((s, x) => s + x.profile_completeness_pct, 0) / startups.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading startup data…</span>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-title">Error loading data</div>
          <div className="empty-state-body">{error}</div>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={load}>
            Try again
          </button>
        </div>
      ) : (
        <Leaderboard startups={startups} />
      )}
    </>
  );
}
