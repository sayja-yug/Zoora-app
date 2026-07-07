import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStartupDetail } from '../api/client';
import {
  CATEGORY_META, CATEGORY_ORDER, scoreClass, formatScore, daysSince,
} from '../utils';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { ScoreHistoryChart } from '../components/ScoreHistoryChart';

const STALENESS_DAYS = 90;

function CategoryCard({ score }) {
  const meta = CATEGORY_META[score.category];
  const cls  = scoreClass(score.weighted_score);
  const days = daysSince(score.computed_at);
  const stale = days !== null && days > STALENESS_DAYS;

  return (
    <div id={`cat-card-${score.category}`} className="category-card">
      <div className="category-card-header">
        <div className="category-name">
          <div className="category-dot" style={{ background: meta.color }} />
          <span style={{ color: meta.color }}>{meta.label}</span>
        </div>
        <div>
          {stale ? (
            <span className="staleness-flag stale" title={`Last verified ${days} days ago`}>
              ⚠ {days}d stale
            </span>
          ) : (
            <span className="staleness-flag fresh">
              ✓ Current
            </span>
          )}
        </div>
      </div>

      <div className="category-score-display" style={{ marginBottom: 16 }}>
        <span
          className="category-score-big"
          style={{ color: cls === 'high' ? '#34D399' : cls === 'medium' ? '#FCD34D' : '#FB7185' }}
        >
          {formatScore(score.weighted_score)}
        </span>
        <span className="category-score-max">/10</span>
      </div>

      <ConfidenceBar breakdown={score.confidence_breakdown} category={score.category} showLabel={false} />

      <div className="category-fill-row" style={{ marginTop: 12 }}>
        <span>{score.populated_metrics}/{score.total_metrics} metrics populated</span>
        {score.computed_at && (
          <span title={new Date(score.computed_at).toLocaleString()}>
            Updated {new Date(score.computed_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export function StartupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getStartupDetail(id)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load startup details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading startup profile…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Startup not found</div>
        <div className="empty-state-body">{error}</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          ← Back to Leaderboard
        </button>
      </div>
    );
  }

  const { startup, scores, score_history } = data;

  // Compute total weighted score on the frontend (same formula as backend)
  const weights = {
    market: 0.28, tech: 0.22, team: 0.15, future: 0.15, certs: 0.10, risk: 0.10
  };
  const scoreMap = Object.fromEntries(scores.map(s => [s.category, s.weighted_score]));
  const totalScore = Object.entries(weights).reduce(
    (sum, [cat, w]) => sum + w * (scoreMap[cat] ?? 0), 0
  );

  // Sort scores by CATEGORY_ORDER
  const orderedScores = CATEGORY_ORDER
    .map(cat => scores.find(s => s.category === cat))
    .filter(Boolean);

  return (
    <>
      <div className="detail-header animate-in">
        <div>
          <button id="back-to-leaderboard" className="detail-back-btn" onClick={() => navigate('/')}>
            ← Back to Leaderboard
          </button>
          <h1 className="detail-startup-name">{startup.name}</h1>
          <div className="detail-startup-badges">
            <span className="detail-badge">{startup.stage}</span>
            <span className="detail-badge">{startup.sector}</span>
            {startup.website && (
              <a
                href={startup.website}
                className="detail-badge"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-cyan)' }}
                onClick={e => e.stopPropagation()}
              >
                ↗ Website
              </a>
            )}
          </div>
        </div>

        <div className="detail-total-score">
          <div className="detail-total-score-label">Overall Score</div>
          <div
            className="score-pill-large"
            style={{ color: scoreClass(totalScore) === 'high' ? '#34D399' : scoreClass(totalScore) === 'medium' ? '#FCD34D' : '#FB7185' }}
          >
            {formatScore(totalScore)}
            <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>/10</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {Math.round(startup.profile_completeness_pct)}% profile complete
          </div>
        </div>
      </div>

      {/* Category score cards */}
      <h2 className="section-heading">Category Breakdown</h2>
      <div className="category-grid animate-in">
        {orderedScores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No scores yet</div>
            <div className="empty-state-body">Scores will appear after the first data submission.</div>
          </div>
        ) : (
          orderedScores.map(score => (
            <CategoryCard key={score.category} score={score} />
          ))
        )}
      </div>

      {/* Overall confidence breakdown */}
      {orderedScores.length > 0 && (() => {
        // Weighted average confidence across all categories
        const catWeights = weights;
        const combined = { verified_doc: 0, llm_inferred: 0, self_reported: 0 };
        let totalW = 0;
        for (const score of orderedScores) {
          const w = catWeights[score.category] ?? 0;
          combined.verified_doc  += w * score.confidence_breakdown.verified_doc;
          combined.llm_inferred  += w * score.confidence_breakdown.llm_inferred;
          combined.self_reported += w * score.confidence_breakdown.self_reported;
          totalW += w;
        }
        if (totalW > 0) {
          combined.verified_doc  /= totalW;
          combined.llm_inferred  /= totalW;
          combined.self_reported /= totalW;
        }
        return (
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Overall Data Confidence
            </h3>
            <ConfidenceBar breakdown={combined} />
          </div>
        );
      })()}

      {/* Score history chart */}
      <h2 className="section-heading">Score History</h2>
      <div className="chart-wrapper animate-in" style={{ marginBottom: 40 }}>
        <ScoreHistoryChart history={score_history} />
      </div>
    </>
  );
}
