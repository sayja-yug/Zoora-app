import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStartupDetail, getDocuments, deleteDocument } from '../api/client';
import { DocumentUpload } from '../components/DocumentUpload';

const DOC_TYPE_LABELS = {
  pitch_deck: 'Pitch Deck',
  financial_audit: 'Financial Audit',
  loi: 'Letter of Intent (LOI)',
  soc2_report: 'SOC2 Report',
  patent: 'Patent',
  other: 'Other Document'
};

export function FounderDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState('');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('zoora_user') || '{}'); } catch { return {}; }
  })();

  const loadData = async () => {
    if (!user.startupId) {
      setError('No startup associated with this account.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [detailRes, docsRes] = await Promise.all([
        getStartupDetail(user.startupId),
        getDocuments(user.startupId)
      ]);
      setData(detailRes.data);
      setDocuments(docsRes.data.documents || []);
    } catch (err) {
      setError('Failed to load startup details.');
    } finally {
      setLoading(false);
    }
  };

  const refreshDocuments = async () => {
    if (!user.startupId) return;
    try {
      setDocsLoading(true);
      const docsRes = await getDocuments(user.startupId);
      setDocuments(docsRes.data.documents || []);
    } catch (err) {
      console.error('Failed to refresh documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This will remove its associated score values.')) return;
    try {
      await deleteDocument(docId);
      refreshDocuments();
      const detailRes = await getStartupDetail(user.startupId);
      setData(detailRes.data);
    } catch (err) {
      alert('Failed to delete document. Please try again.');
    }
  };

  useEffect(() => {
    loadData().then(() => {
      // Data is loaded in state, but loadData doesn't return it directly to check here easily unless we modify it.
      // We can check in a separate effect or right after loading data. Let's check below where we have data.
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Syncing with secure vault…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Vault Offline</div>
        <div className="empty-state-body">{error}</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>
          Return to Login
        </button>
      </div>
    );
  }

  const { startup, scores } = data;
  
  useEffect(() => {
    if (startup && startup.onboarding_completed === false) {
      navigate('/onboarding');
    }
  }, [startup, navigate]);

  if (startup && startup.onboarding_completed === false) {
    return null; // prevent flash of content before redirect
  }

  const pendingDocsCount = documents.filter(d => d.parse_status === 'pending').length;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 0' }}>
      
      {/* Premium Header Banner */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(26, 11, 48, 0.4) 0%, rgba(13, 18, 48, 0.8) 100%)',
        border: '1px solid rgba(99, 120, 200, 0.15)',
        borderRadius: 20,
        padding: '32px 40px',
        marginBottom: 32,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div>
          <span style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            letterSpacing: 1.5, 
            textTransform: 'uppercase', 
            color: 'var(--color-cyan)',
            display: 'block',
            marginBottom: 8
          }}>
            Startup Dashboard
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#F1F5F9', marginBottom: 8 }}>
            Welcome, {startup.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--color-border)' }}>{startup.stage}</span>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--color-border)' }}>{startup.sector}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 600, lineHeight: 1.6 }}>
            Submit metrics and upload documents below. Our AI engine verifies your data and updates your scorecard status for prospective investors.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {/* Completeness Card */}
        <div className="card card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Profile Completeness</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-cyan)' }}>{Math.round(startup.profile_completeness_pct)}%</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: `${startup.profile_completeness_pct}%`, height: '100%', background: 'var(--color-cyan)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Uploaded Documents Card */}
        <div className="card card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vault Files</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{documents.length}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>uploaded</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>Securely stored in MinIO vault</span>
        </div>

        {/* AI Processing Card */}
        <div className="card card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Queue</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: pendingDocsCount > 0 ? 'var(--color-amber)' : 'var(--color-emerald)' }}>
              {pendingDocsCount}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>processing</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
            {pendingDocsCount > 0 ? 'Claude parsing active…' : 'All documents synchronized'}
          </span>
        </div>

        {/* Scorecard Categories Card */}
        <div className="card card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pillars Scored</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-purple)' }}>{scores.length}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/ 6 categories</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>Ready for investor review</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
        
        {/* Upload form */}
        <DocumentUpload startupId={startup.id} onUploadComplete={loadData} />
        
        {/* Documents Management Card */}
        <div className="card card-glass" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Secure S3 Vault</h3>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Repository of files used for scoring engine computations</p>
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ fontSize: 12, padding: '6px 12px', background: 'rgba(255,255,255,0.02)' }} 
              onClick={refreshDocuments}
              disabled={docsLoading}
            >
              {docsLoading ? 'Refreshing…' : '↻ Refresh Status'}
            </button>
          </div>

          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed rgba(99, 120, 200, 0.15)', borderRadius: 12 }}>
              <span style={{ fontSize: 32 }}>📭</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
                Vault is currently empty. Upload business documents above to list them here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--text-tertiary)', height: 36 }}>
                    <th style={{ padding: '8px 12px' }}>Filename</th>
                    <th style={{ padding: '8px 12px' }}>Category Type</th>
                    <th style={{ padding: '8px 12px' }}>Uploaded</th>
                    <th style={{ padding: '8px 12px' }}>AI Status</th>
                    <th style={{ padding: '8px 12px' }}>Verification</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const statusClass = 
                      doc.parse_status === 'parsed' ? 'fresh' : 
                      doc.parse_status === 'failed' ? 'stale' : 'pending';
                    
                    const statusLabel = 
                      doc.parse_status === 'parsed' ? '✓ Analyzed' : 
                      doc.parse_status === 'failed' ? '⚠ Failed' : '● Processing';

                    const dotColor = 
                      doc.parse_status === 'parsed' ? 'var(--color-emerald)' : 
                      doc.parse_status === 'failed' ? 'var(--color-rose)' : 'var(--color-amber)';

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
                      <tr key={doc.id} className="table-row-hover" style={{ 
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.2s ease',
                      }}>
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
                          <span className={`staleness-flag ${statusClass}`} style={{ 
                            fontSize: 11, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 6,
                            padding: '3px 8px'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
                            {statusLabel}
                          </span>
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
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <button
                            className="btn-danger btn"
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: 11, 
                              borderRadius: 6,
                            }}
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scorecard Status Card */}
        <div className="card card-glass" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Rating Status</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>Current metrics score status computed across active categories</p>
          
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(99, 120, 200, 0.15)', borderRadius: 12 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Scorecard is currently empty. AI engine will compute results upon first document intake.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Your company currently has **{scores.length}** scored categories active. Prospective investors can now view and inspect your detailed scorecard.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/startup/${startup.id}`)}
                  style={{
                    padding: '10px 18px',
                    fontSize: 13,
                    boxShadow: '0 4px 12px var(--color-cyan-glow)'
                  }}
                >
                  View Public Scorecard ↗
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => navigate('/')}
                  style={{
                    padding: '10px 18px',
                    fontSize: 13,
                  }}
                >
                  Inspect Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* local style inject for row hover */}
      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
