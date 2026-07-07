import React, { useState, useRef } from 'react';
import { getUploadUrl, uploadDocumentDirect } from '../api/client';

const DOC_TYPES = [
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'financial_audit', label: 'Financial Audit' },
  { value: 'loi', label: 'Letter of Intent (LOI)' },
  { value: 'soc2_report', label: 'SOC2 Report' },
  { value: 'patent', label: 'Patent Document' },
  { value: 'other', label: 'Other Document' }
];

export function DocumentUpload({ startupId, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('pitch_deck');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastFilename, setToastFilename] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Accept only common documents
      if (droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
      } else {
        setError('Unsupported file type. Please select a PDF, DOCX, or TXT file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  async function handleUpload(e) {
    if (e) e.preventDefault();
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      const currentFilename = file.name;
      // 1. Get presigned URL
      const { data } = await getUploadUrl(startupId, docType, file.name, file.type || 'application/octet-stream');
      
      // 2. Upload file directly to storage (MinIO/Mock)
      await uploadDocumentDirect(data.upload_url, file, file.type || 'application/octet-stream');
      
      // Success triggers
      setToastFilename(currentFilename);
      setShowToast(true);
      setFile(null);
      if (onUploadComplete) onUploadComplete();
      
      // Hide toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toast success notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #0A0F26 0%, #111830 100%)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(52, 211, 153, 0.1)',
          borderRadius: 12,
          padding: '16px 20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: 400,
          animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Animated checkmark circle */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '2px solid #34D399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D399',
            fontSize: 16,
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>Upload Successful</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              {toastFilename} added successfully
            </div>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            style={{
              marginLeft: 'auto',
              color: '#475569',
              fontSize: 18,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Styled Card */}
      <div className="card card-glass" style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 48, 0.7) 0%, rgba(13, 18, 48, 0.9) 100%)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        padding: '28px'
      }}>
        <h3 style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          marginBottom: 6,
          background: 'linear-gradient(90deg, #F1F5F9 0%, var(--color-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Upload Business Document
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Submit pitch decks, audited financials, or patents. Our AI engine parses data to verify your score.
        </p>

        <form onSubmit={handleUpload}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ color: 'var(--color-cyan)', fontSize: 11, fontWeight: 600 }}>Document Type</label>
            <select 
              className="form-input"
              value={docType}
              onChange={e => setDocType(e.target.value)}
              style={{
                background: 'rgba(7, 9, 26, 0.7)',
                borderColor: 'rgba(99, 120, 200, 0.3)',
                height: 42
              }}
            >
              {DOC_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ color: 'var(--color-cyan)', fontSize: 11, fontWeight: 600 }}>File Attachment</label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
            />

            {/* Custom Drag & Drop Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              style={{
                border: isDragActive ? '2px dashed var(--color-cyan)' : '2px dashed rgba(99, 120, 200, 0.3)',
                background: isDragActive ? 'rgba(0, 212, 255, 0.05)' : 'rgba(7, 9, 26, 0.4)',
                borderRadius: 10,
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDragActive ? '0 0 15px rgba(0, 212, 255, 0.1)' : 'none'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
              {file ? (
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{file.name}</span>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 11, marginTop: 4 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change file
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Drag &amp; drop your file here, or <span style={{ color: 'var(--color-cyan)', textDecoration: 'underline' }}>browse</span>
                  </span>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 11, marginTop: 6 }}>
                    Supports PDF, DOCX, TXT up to 25MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span> {error}
          </div>}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading || !file}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              background: loading ? 'rgba(99, 120, 200, 0.2)' : 'linear-gradient(135deg, var(--color-cyan) 0%, #0090FF 100%)',
              color: loading ? 'var(--text-tertiary)' : 'var(--color-bg-deep)',
              border: 'none',
              borderRadius: 10,
              boxShadow: (!loading && file) ? '0 6px 20px var(--color-cyan-glow)' : 'none',
              transform: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'var(--text-primary)' }} />
                Securing Payload…
              </span>
            ) : 'Submit for AI Verification'}
          </button>
        </form>
      </div>
      
      {/* Dynamic Keyframes injected locally */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
