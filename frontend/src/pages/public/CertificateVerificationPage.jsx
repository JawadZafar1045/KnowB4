import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Building2,
  User,
  Percent,
  ExternalLink,
  Search,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import logoImg from '../../assets/logo-transparent.png';
import { resolveAssetUrl } from '../../services/api';
import { formatOrganizationName, formatStatus } from '../../utils/displayFormatters';

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(Boolean(certificateId));
  const [error, setError] = useState(null);

  // Search input state for verifying another certificate or when landing on /verify directly
  const [searchId, setSearchId] = useState(certificateId || '');

  const verifyId = (idToVerify) => {
    if (!idToVerify || !idToVerify.trim()) {
      setLoading(false);
      setCert(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCert(null);

    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/certificates/verify/${encodeURIComponent(idToVerify.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.certificate) {
          setCert(data.certificate);
        } else {
          setError(data.message || 'Certificate not found. Please double-check the ID.');
        }
      })
      .catch(() => setError('Unable to connect to verification service'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (certificateId) {
      setSearchId(certificateId);
      verifyId(certificateId);
    } else {
      setLoading(false);
      setCert(null);
      setError(null);
    }
  }, [certificateId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${encodeURIComponent(searchId.trim())}`);
    }
  };

  const isValid = cert?.status === 'VALID';

  return (
    <div
      className="certificate-page"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* Top Navigation */}
      <div style={{ width: '100%', maxWidth: '540px', marginBottom: '20px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--navy)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>

      {/* Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img
          className="certificate-brand-logo"
          src={logoImg}
          alt="ThinkB4Act"
          style={{
            width: 'min(220px, 72vw)',
            height: 'auto',
            objectFit: 'contain',
            marginBottom: '10px'
          }}
        />
        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px'
          }}
        >
          Public Certificate Verification Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
          Cryptographic tamper-proof digital credential validation
        </p>
      </div>

      {/* Main Verification Card */}
      <div
        className="certificate-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--card)',
          border: isValid
            ? '1px solid var(--success-border)'
            : error || cert?.status === 'REVOKED'
            ? '1px solid var(--danger-border)'
            : '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Search Bar on Portal */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: '6px'
            }}
          >
            Enter Certificate ID to Verify
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Award
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '12px' }}
              />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="e.g. CERT-2026-0001"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--navy)',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <Search size={15} /> Verify
            </button>
          </div>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Shield size={44} color="var(--orange)" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Verifying cryptographic credential...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: 'var(--danger-bg)',
              borderRadius: '12px',
              border: '1px solid var(--danger-border)'
            }}
          >
            <XCircle size={48} color="var(--danger-text)" style={{ margin: '0 auto 10px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger-text)', margin: '0 0 6px' }}>
              Certificate Not Found
            </h2>
            <p style={{ color: 'var(--danger-text)', fontSize: '0.88rem', margin: 0 }}>{error}</p>
            {certificateId && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Searched ID: <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{certificateId}</span>
              </p>
            )}
          </div>
        ) : cert ? (
          <div>
            {/* Status Banner */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: isValid ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${isValid ? 'var(--success-border)' : 'var(--danger-border)'}`
              }}
            >
              {isValid ? (
                <CheckCircle2 size={36} color="var(--success-text)" style={{ margin: '0 auto 6px' }} />
              ) : (
                <XCircle size={36} color="var(--danger-text)" style={{ margin: '0 auto 6px' }} />
              )}
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  margin: 0,
                  color: isValid ? 'var(--success-text)' : 'var(--danger-text)'
                }}
              >
                {isValid ? 'AUTHENTIC & VALID CREDENTIAL' : `CERTIFICATE ${formatStatus(cert.status)}`}
              </h2>
              {!isValid && cert.revokedAt && (
                <p style={{ color: 'var(--danger-text)', fontSize: '0.82rem', marginTop: '4px' }}>
                  Revoked: {new Date(cert.revokedAt).toLocaleDateString()}
                  {cert.revokedReason && ` — ${cert.revokedReason}`}
                </p>
              )}
            </div>

            {/* Certificate Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={18} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Certificate ID</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'monospace' }}>
                    {cert.certificateId}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text)' }}>
                    {cert.recipientName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={18} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Training Course</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text)' }}>
                    {cert.courseName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={18} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Organization</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text)' }}>
                    {formatOrganizationName(cert.companyName)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Percent size={18} color="var(--success-text)" />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success-text)' }}>
                      {cert.score}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={18} color="var(--navy)" />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Issued Date</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text)' }}>
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {cert.qrCodeUrl && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)'
                }}
              >
                <img
                  src={cert.qrCodeUrl}
                  alt="Verification QR Code"
                  style={{ width: '96px', height: '96px', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Scan QR code for instant mobile verification
                </div>
              </div>
            )}

            {/* Download PDF */}
            {cert.pdfUrl && isValid && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <a
                  href={resolveAssetUrl(cert.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    fontSize: '0.84rem',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Download Certificate PDF
                </a>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: 'var(--surface-muted)',
              borderRadius: '12px',
              border: '1px dashed var(--border)'
            }}
          >
            <ShieldCheck size={40} color="var(--navy)" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
              Ready to Validate
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, maxWidth: '380px', marginInline: 'auto' }}>
              Enter the unique certificate serial number printed on the credential or PDF to confirm validity, grade score, and student authenticity.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}
      >
        <p style={{ margin: 0 }}>Powered by ThinkB4Act Multi-Tenant Security Awareness Platform</p>
        <p style={{ margin: '2px 0 0' }}>Tamper-proof digital credential verification. Open to the public with no login required.</p>
      </div>
    </div>
  );
}