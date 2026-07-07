export const CATEGORY_META = {
  tech:   { label: 'Tech / R&D',       color: '#3B82F6', cssVar: 'var(--cat-tech)' },
  certs:  { label: 'Certifications',   color: '#10B981', cssVar: 'var(--cat-certs)' },
  market: { label: 'Market',           color: '#F59E0B', cssVar: 'var(--cat-market)' },
  future: { label: 'Future Readiness', color: '#8B5CF6', cssVar: 'var(--cat-future)' },
  team:   { label: 'Team',             color: '#EC4899', cssVar: 'var(--cat-team)' },
  risk:   { label: 'Risk Deductions',  color: '#EF4444', cssVar: 'var(--cat-risk)' },
};

export const CATEGORY_ORDER = ['market', 'tech', 'team', 'future', 'certs', 'risk'];

export function scoreClass(score) {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function formatScore(score) {
  return score.toFixed(1);
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
