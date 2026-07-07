import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CATEGORY_META, CATEGORY_ORDER, scoreClass, formatScore, daysSince,
} from '../utils';

export function Leaderboard({ startups }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('total');
  const [search, setSearch] = useState('');

  const filtered = startups
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sector.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortKey === 'total') return b.total_weighted_score - a.total_weighted_score;
      if (sortKey === 'completeness') return b.profile_completeness_pct - a.profile_completeness_pct;
      const aScore = a.category_scores?.[sortKey]?.weighted_score ?? 0;
      const bScore = b.category_scores?.[sortKey]?.weighted_score ?? 0;
      return bScore - aScore;
    });

  function SortTh({ label, sk }) {
    const active = sortKey === sk;
    return (
      <th
        className={`sortable ${active ? 'sorted' : ''}`}
        onClick={() => setSortKey(sk)}
      >
        {label} {active ? '↓' : ''}
      </th>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">⌕</span>
          <input
            id="leaderboard-search"
            type="text"
            className="search-input"
            placeholder="Search startups or sectors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
          {filtered.length} startup{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Startup</th>
              <SortTh label="Total" sk="total" />
              {CATEGORY_ORDER.map(cat => (
                <SortTh key={cat} label={cat.toUpperCase()} sk={cat} />
              ))}
              <SortTh label="Complete" sk="completeness" />
              <th>Last Scored</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                  No startups match your search.
                </td>
              </tr>
            ) : filtered.map((startup, idx) => {
              const totalClass = scoreClass(startup.total_weighted_score);
              const days = daysSince(startup.last_scored_at);
              const stale = days !== null && days > 90;

              return (
                <tr
                  key={startup.id}
                  id={`startup-row-${startup.id}`}
                  onClick={() => navigate(`/startup/${startup.id}`)}
                  title="Click to view details"
                >
                  {/* Rank */}
                  <td>
                    <div className={`rank-badge ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}`}>
                      {idx + 1}
                    </div>
                  </td>

                  {/* Startup info */}
                  <td>
                    <div className="startup-info">
                      <span className="startup-name">{startup.name}</span>
                      <div className="startup-meta">
                        <span>{startup.stage}</span>
                        <span>·</span>
                        <span>{startup.sector}</span>
                      </div>
                    </div>
                  </td>

                  {/* Total score */}
                  <td>
                    <span className={`score-pill ${totalClass}`}>
                      {formatScore(startup.total_weighted_score)}
                    </span>
                  </td>

                  {/* Category sub-scores as mini bars */}
                  {CATEGORY_ORDER.map(cat => {
                    const catScore = startup.category_scores?.[cat];
                    const score = catScore?.weighted_score ?? 0;
                    const catClass = scoreClass(score);
                    return (
                      <td key={cat}>
                        <div className="category-scores-row">
                          <div className="cat-mini-score">
                            <div className="cat-mini-bar-track">
                              <div
                                className="cat-mini-bar-fill"
                                style={{
                                  width: `${score * 10}%`,
                                  background: CATEGORY_META[cat].color,
                                }}
                              />
                            </div>
                            <span className={`cat-mini-value`} style={{
                              color: catClass === 'high' ? '#34D399' : catClass === 'medium' ? '#FCD34D' : '#FB7185'
                            }}>
                              {formatScore(score)}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Profile completeness */}
                  <td>
                    <div className="completeness-badge">
                      <div className="completeness-bar-track">
                        <div
                          className="completeness-bar-fill"
                          style={{ width: `${startup.profile_completeness_pct}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--text-tertiary)' }}>
                        {Math.round(startup.profile_completeness_pct)}%
                      </span>
                    </div>
                  </td>

                  {/* Last scored */}
                  <td>
                    {days === null ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Never</span>
                    ) : (
                      <span
                        className={`staleness-flag ${stale ? 'stale' : 'fresh'}`}
                        title={startup.last_scored_at ?? ''}
                      >
                        {stale ? '⚠' : '✓'} {days}d ago
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
