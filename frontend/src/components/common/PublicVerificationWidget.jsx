import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, ArrowRight, Award } from 'lucide-react';

export default function PublicVerificationWidget({ style = {} }) {
  const [certId, setCertId] = useState('');
  const [inputError, setInputError] = useState('');
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) {
      setInputError('Please enter a certificate ID.');
      return;
    }
    setInputError('');
    navigate(`/verify/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div
      className="surface-card public-verification-widget"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px 22px',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'left',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(234, 88, 12, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--orange)',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <h3
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: 'var(--navy)',
              margin: 0,
              letterSpacing: '-0.01em'
            }}
          >
            Public Verification Portal
          </h3>
          <p
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              margin: '2px 0 0',
              lineHeight: 1.3
            }}
          >
            Verify authenticity of any ThinkB4Act training certificate
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleVerify} style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Award
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            />
            <input
              type="text"
              value={certId}
              onChange={(e) => {
                setCertId(e.target.value.toUpperCase());
                if (inputError) setInputError('');
              }}
              placeholder="e.g. CERT-2026-0001"
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                background: 'var(--surface-muted)',
                border: inputError ? '1px solid var(--danger-text)' : '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--navy)',
                fontSize: '0.84rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.04em',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--orange)';
                e.target.style.outline = '2px solid var(--orange)';
                e.target.style.outlineOffset = '1px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputError ? 'var(--danger-text)' : 'var(--border)';
                e.target.style.outline = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              padding: '9px 16px',
              background: isBtnHovered ? 'var(--orange-dark)' : 'var(--orange)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease, transform 0.15s ease',
              transform: isBtnHovered ? 'translateY(-1px)' : 'translateY(0)'
            }}
          >
            <Search size={14} /> Verify
          </button>
        </div>

        {inputError && (
          <div style={{ fontSize: '0.72rem', color: 'var(--danger-text)', marginTop: '5px' }}>
            {inputError}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>Tamper-proof digital validation</span>
          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>No login required</span>
        </div>
      </form>
    </div>
  );
}
