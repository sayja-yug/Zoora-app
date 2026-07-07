import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStartupDetail, getDocuments } from '../api/client';
import {
  CATEGORY_META, CATEGORY_ORDER, scoreClass, formatScore, daysSince,
} from '../utils';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { ScoreHistoryChart } from '../components/ScoreHistoryChart';

const STALENESS_DAYS = 90;

const DOC_TYPE_LABELS = {
  pitch_deck: 'Pitch Deck',
  financial_audit: 'Financial Audit',
  loi: 'Letter of Intent (LOI)',
  soc2_report: 'SOC2 Report',
  patent: 'Patent',
  other: 'Other Document'
};

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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('zoora_user') || '{}'); } catch { return {}; }
  })();

  const isOwner = user.role === 'founder' && user.startupId === id;
  const isInvestorOrAdmin = user.role === 'investor' || user.role === 'admin';
  const showDocsSection = isOwner || isInvestorOrAdmin;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    const fetches = [getStartupDetail(id)];
    if (showDocsSection) {
      fetches.push(getDocuments(id));
    }
    
    Promise.all(fetches)
      .then(([detailRes, docsRes]) => {
        setData(detailRes.data);
        if (docsRes) {
          setDocuments(docsRes.data.documents || []);
        } else {
          setDocuments([]);
        }
      })
      .catch(() => setError('Failed to load startup details.'))
      .finally(() => setLoading(false));
  }, [id, showDocsSection]);

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

      {/* Verified documents section */}
      {showDocsSection && (
        <>
          <h2 className="section-heading">Data Vault Documents</h2>
          <div className="card card-glass animate-in" style={{ padding: '24px', marginBottom: 32 }}>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)' }}>
                No documents uploaded to the verification vault yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--text-tertiary)', height: 36 }}>
                      <th style={{ padding: '8px 12px' }}>Filename</th>
                      <th style={{ padding: '8px 12px' }}>Category Type</th>
                      <th style={{ padding: '8px 12px' }}>Uploaded</th>
                      <th style={{ padding: '8px 12px' }}>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const vColor = 
                        doc.verification_status === 'verified' ? 'var(--color-emerald)' : 
                        doc.verification_status === 'rejected' ? 'var(--color-rose)' : 'var(--color-amber)';
                      
                      const vLabel = 
                        doc.verification_status === 'verified' ? '✓ Verified' : 
                        doc.verification_status === 'rejected' ? '✗ Rejected' : '● Pending';

                      const vClass = 
                        doc.verification_status === 'verified' ? 'fresh' : 
                        doc.verification_status === 'rejected' ? 'stale' : 'pending';

                      return (
                        <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            📄 {doc.filename || doc.file_url.split('/').pop()}
                          </td>
                          <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>
                            {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                          </td>
                          <td style={{ padding: '14px 12px', color: 'var(--text-tertiary)' }}>
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span className={`staleness-flag ${vClass}`} style={{ 
                              fontSize: 11, 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 6,
                              padding: '3px 8px'
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: vColor, display: 'inline-block' }} />
                              {vLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Score history chart */}
      <h2 className="section-heading">Score History</h2>
      <div className="chart-wrapper animate-in" style={{ marginBottom: 40 }}>
        <ScoreHistoryChart history={score_history} />
      </div>
    </>
  );
}
