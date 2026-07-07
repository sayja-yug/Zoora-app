import React from 'react';
import { CATEGORY_META } from '../utils';

function getWarningLevel(breakdown) {
  if (breakdown.self_reported > 0.7) return 'mostly-self';
  if (breakdown.verified_doc > 0.6) return 'mostly-verified';
  return null;
}

export function ConfidenceBar({ breakdown, category, showLabel = true }) {
  const verifiedPct  = Math.round(breakdown.verified_doc  * 100);
  const llmPct       = Math.round(breakdown.llm_inferred  * 100);
  const selfPct      = Math.round(breakdown.self_reported * 100);
  const warning      = getWarningLevel(breakdown);
  const catLabel     = category ? CATEGORY_META[category]?.label : null;

  return (
    <div className="confidence-bar-container">
      {showLabel && (
        <div className="confidence-bar-label">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {catLabel ?? 'Score Confidence'}
          </span>
        </div>
      )}

      <div className="confidence-stacked-track">
        <div
          className="confidence-stacked-segment conf-verified"
          style={{ width: `${verifiedPct}%` }}
          title={`Verified doc: ${verifiedPct}%`}
        />
        <div
          className="confidence-stacked-segment conf-llm"
          style={{ width: `${llmPct}%` }}
          title={`LLM inferred: ${llmPct}%`}
        />
        <div
          className="confidence-stacked-segment conf-self"
          style={{ width: `${selfPct}%` }}
          title={`Self-reported: ${selfPct}%`}
        />
      </div>

      <div className="confidence-legend">
        <div className="confidence-legend-item">
          <div className="confidence-dot conf-verified" />
          <span>Verified {verifiedPct}%</span>
        </div>
        <div className="confidence-legend-item">
          <div className="confidence-dot conf-llm" />
          <span>AI-inferred {llmPct}%</span>
        </div>
        <div className="confidence-legend-item">
          <div className="confidence-dot conf-self" />
          <span>Self-reported {selfPct}%</span>
        </div>
      </div>

      {warning === 'mostly-self' && (
        <div className="confidence-warning mostly-self">
          ⚠ Score is mostly self-reported — treat with caution
        </div>
      )}
      {warning === 'mostly-verified' && (
        <div className="confidence-warning mostly-verified">
          ✓ Score is mostly document-verified
        </div>
      )}
    </div>
  );
}
