import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDocuments, verifyDocument } from '../api/client';

const DOC_TYPE_LABELS = {
  pitch_deck: 'Pitch Deck',
  financial_audit: 'Financial Audit',
  loi: 'Letter of Intent (LOI)',
  soc2_report: 'SOC2 Report',
  patent: 'Patent',
  other: 'Other Document'
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified', 'rejected'
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await getAdminDocuments();
      setDocuments(res.data.documents || []);
    } catch (err) {
      setError('Failed to fetch admin documents repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleVerify = async (docId, action) => {
    try {
      setVerifyingId(docId);
      await verifyDocument(docId, action);
      await loadDocuments(); // reload list
      if (selectedDoc && selectedDoc.id === docId) {
        setSelectedDoc(prev => prev ? { ...prev, verification_status: action === 'verify' ? 'verified' : 'rejected' } : null);
      }
    } catch (err) {
      alert('Failed to update verification status.');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Decrypting document vault files…</span>
      </div>
    );
  }

  // Statistics
  const totalCount = documents.length;
  const pendingCount = documents.filter(d => d.verification_status === 'pending').length;
  const verifiedCount = documents.filter(d => d.verification_status === 'verified').length;
  const rejectedCount = documents.filter(d => d.verification_status === 'rejected').length;

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchesFilter = filter === 'all' || d.verification_status === filter;
    const matchesSearch = 
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      d.startup_name.toLowerCase().includes(search.toLowerCase()) ||
      d.doc_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      
      {/* Premium Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <span style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            letterSpacing: 1.5, 
            textTransform: 'uppercase', 
            color: 'var(--color-cyan)',
            display: 'block',
            marginBottom: 4
          }}>
            SYSTEM OPERATOR PORTAL
          </span>
          <h1 className="page-title">Admin Document Verification</h1>
          <p className="page-subtitle">Inspect audit details and verify source materials for startup scorecards</p>
        </div>
        <button 
          className="btn btn-ghost" 
          onClick={loadDocuments}
          style={{ fontSize: 13, background: 'rgba(255,255,255,0.02)' }}
        >
          ↻ Refresh Repository
        </button>
      </div>

      {/* KPI stats section */}
      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="card card-glass" style={{ padding: 18 }}>
          <span className="stat-label">Total Submissions</span>
          <div className="stat-value" style={{ marginTop: 8 }}>{totalCount}</div>
        </div>
        <div className="card card-glass" style={{ padding: 18, borderLeft: '3px solid var(--color-amber)' }}>
          <span className="stat-label">Pending Review</span>
          <div className="stat-value" style={{ marginTop: 8, color: 'var(--color-amber)' }}>{pendingCount}</div>
        </div>
        <div className="card card-glass" style={{ padding: 18, borderLeft: '3px solid var(--color-emerald)' }}>
          <span className="stat-label">Verified</span>
          <div className="stat-value" style={{ marginTop: 8, color: 'var(--color-emerald)' }}>{verifiedCount}</div>
        </div>
        <div className="card card-glass" style={{ padding: 18, borderLeft: '3px solid var(--color-rose)' }}>
          <span className="stat-label">Rejected</span>
          <div className="stat-value" style={{ marginTop: 8, color: 'var(--color-rose)' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Grid Layout for Repository and Inspect Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1.4fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Document Repository */}
        <div className="card card-glass" style={{ padding: 24 }}>
          
          {/* Filtering bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'verified', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    borderRadius: 20,
                    textTransform: 'capitalize',
                    border: '1px solid var(--color-border)',
                    background: filter === s ? 'var(--color-cyan-dim)' : 'transparent',
                    color: filter === s ? 'var(--color-cyan)' : 'var(--text-secondary)',
                    borderColor: filter === s ? 'var(--color-cyan)' : 'var(--color-border)'
                  }}
                >
                  {s} {s === 'all' ? `(${totalCount})` : s === 'pending' ? `(${pendingCount})` : s === 'verified' ? `(${verifiedCount})` : `(${rejectedCount})`}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search filename or startup..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ maxWidth: 260, fontSize: 12, padding: '6px 12px' }}
            />
          </div>

          {filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(99, 120, 200, 0.15)', borderRadius: 12 }}>
              <span style={{ fontSize: 32 }}>📁</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
                No documents found matching the filter criteria.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--text-tertiary)', height: 36 }}>
                    <th style={{ padding: '8px 12px' }}>Startup</th>
                    <th style={{ padding: '8px 12px' }}>File Info</th>
                    <th style={{ padding: '8px 12px' }}>Uploaded</th>
                    <th style={{ padding: '8px 12px' }}>Verification Status</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => {
                    const rowSelected = selectedDoc && selectedDoc.id === doc.id;
                    const vColor = 
                      doc.verification_status === 'verified' ? 'var(--color-emerald)' : 
                      doc.verification_status === 'rejected' ? 'var(--color-rose)' : 'var(--color-amber)';
                    const vLabel = doc.verification_status.toUpperCase();

                    return (
                      <tr 
                        key={doc.id} 
                        onClick={() => setSelectedDoc(doc)}
                        style={{ 
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          background: rowSelected ? 'rgba(0, 212, 255, 0.04)' : 'transparent',
                          transition: 'background 0.2s ease',
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {doc.startup_name}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ fontWeight: 500, color: '#F1F5F9' }}>📄 {doc.filename || doc.file_url.split('/').pop()}</div>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
                        </td>
                        <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>
                          <div>{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>by {doc.uploaded_by_email}</span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 700, 
                            color: vColor,
                            background: `rgba(${vColor === 'var(--color-emerald)' ? '16, 185, 129' : vColor === 'var(--color-rose)' ? '244, 63, 94' : '245, 158, 11'}, 0.08)`,
                            padding: '3px 8px',
                            borderRadius: 12,
                            border: `1px solid rgba(${vColor === 'var(--color-emerald)' ? '16, 185, 129' : vColor === 'var(--color-rose)' ? '244, 63, 94' : '245, 158, 11'}, 0.2)`
                          }}>
                            {vLabel}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          {doc.verification_status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-primary"
                                style={{ 
                                  padding: '4px 8px', 
                                  fontSize: 11, 
                                  borderRadius: 6,
                                  background: 'var(--color-emerald)',
                                  color: '#fff'
                                }}
                                disabled={verifyingId === doc.id}
                                onClick={() => handleVerify(doc.id, 'verify')}
                              >
                                Verify
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ 
                                  padding: '4px 8px', 
                                  fontSize: 11, 
                                  borderRadius: 6,
                                }}
                                disabled={verifyingId === doc.id}
                                onClick={() => handleVerify(doc.id, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', paddingRight: 8 }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inspect Panel */}
        {selectedDoc && (
          <div className="card card-glass" style={{ padding: 24, border: '1px solid var(--color-border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Document Inspection</h3>
              <button 
                onClick={() => setSelectedDoc(null)} 
                style={{ color: 'var(--text-tertiary)', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 20, fontSize: 13, background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 10, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px 16px', color: 'var(--text-secondary)' }}>
                <strong>Startup:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedDoc.startup_name}</span>
                <strong>Filename:</strong> <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedDoc.filename}</span>
                <strong>Doc Type:</strong> <span>{DOC_TYPE_LABELS[selectedDoc.doc_type] || selectedDoc.doc_type}</span>
                <strong>Status:</strong> <span style={{
                  color: selectedDoc.verification_status === 'verified' ? 'var(--color-emerald)' : 
                         selectedDoc.verification_status === 'rejected' ? 'var(--color-rose)' : 'var(--color-amber)',
                  fontWeight: 600
                }}>{selectedDoc.verification_status.toUpperCase()}</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Parsed Text Preview</h4>
              <div style={{ 
                background: 'var(--color-bg-input)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 8, 
                padding: 16, 
                fontSize: 12, 
                color: 'var(--text-secondary)', 
                maxHeight: 220, 
                overflowY: 'auto',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedDoc.parsed_text || "No text parsed or available for this document."}
              </div>
            </div>

            {selectedDoc.verification_status === 'pending' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: 12, background: 'var(--color-emerald)', color: '#fff', justifyContent: 'center' }}
                  disabled={verifyingId === selectedDoc.id}
                  onClick={() => handleVerify(selectedDoc.id, 'verify')}
                >
                  {verifyingId === selectedDoc.id ? 'Saving…' : '✓ Verify Document'}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1, padding: 12, justifyContent: 'center' }}
                  disabled={verifyingId === selectedDoc.id}
                  onClick={() => handleVerify(selectedDoc.id, 'reject')}
                >
                  {verifyingId === selectedDoc.id ? 'Saving…' : '✗ Reject Document'}
                </button>
              </div>
            )}
          </div>
        )}
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
