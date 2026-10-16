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
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import logoImg from '../../assets/logo-transparent.png';
import { resolveAssetUrl } from '../../services/api';
import { formatOrganizationName, formatStatus } from '../../utils/displayFormatters';
import { useAuth } from '../../context/AuthContext';

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(Boolean(certificateId));
  const [error, setError] = useState(null);

  // Search input state
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
          setError(data.message || 'No certificate record found matching this ID.');
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
      setSearchId('');
    }
  }, [certificateId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchId.trim();
    if (clean) {
      navigate(`/verify/${encodeURIComponent(clean)}`);
    }
  };

  const handleClear = () => {
    setSearchId('');
    setCert(null);
    setError(null);
    navigate('/verify');
  };

  const isValid = cert?.status === 'VALID';

  // Back link based on auth role
  const getBackLink = () => {
    if (!user) return { to: '/login', label: 'Back to Sign In' };
    if (user.role === 'SUPER_ADMIN') return { to: '/super-admin', label: 'Back to Super Admin Console' };
    if (user.role === 'COMPANY_ADMIN') return { to: '/company', label: 'Back to Org Dashboard' };
    return { to: '/employee', label: 'Back to Employee Training' };
  };

  const backLink = getBackLink();

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
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '18px' }}>
        <Link
          to={backLink.to}
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
          <ArrowLeft size={16} /> {backLink.label}
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
          maxWidth: '560px',
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
        <form onSubmit={handleSearchSubmit} className="verification-search-form" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label
              htmlFor="cert-search-input"
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--navy)',
                margin: 0
              }}
            >
              Search & Validate Certificate
            </label>
            {certificateId && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--orange-dark)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <RotateCcw size={12} /> Clear search
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
            <div
              className="search-input-wrapper"
              style={{
                position: 'relative',
                flex: '1 1 0%',
                minWidth: '180px'
              }}
            >
              <Award
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '14px', pointerEvents: 'none' }}
              />
              <input
                id="cert-search-input"
                type="text"
                autoFocus
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter Certificate Number or ID (e.g. CERT-2026-0001)"
                required
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 14px 0 42px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--navy)',
                  fontSize: '0.92rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--orange)';
                  e.target.style.outline = '2px solid var(--orange)';
                  e.target.style.outlineOffset = '1px';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.outline = 'none';
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary btn-inline"
              style={{
                width: 'auto',
                minWidth: '130px',
                flex: '0 0 auto',
                flexShrink: 0,
                height: '46px',
                padding: '0 22px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              <Search size={16} /> Validate
            </button>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Enter the certificate serial number printed on the credential, transcript, or completion email.
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
            <XCircle size={44} color="var(--danger-text)" style={{ margin: '0 auto 10px' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger-text)', margin: '0 0 6px' }}>
              Certificate Not Found
            </h2>
            <p style={{ color: 'var(--danger-text)', fontSize: '0.86rem', margin: 0 }}>{error}</p>
            {certificateId && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Searched ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{certificateId}</span>
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
              padding: '36px 20px',
              backgroundColor: 'var(--surface-muted)',
              borderRadius: '12px',
              border: '1px dashed var(--border)'
            }}
          >
            <ShieldCheck size={44} color="var(--navy)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
              Ready to Validate
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
              Enter any issued certificate number or serial ID in the search box above to immediately confirm validity, assessment grade, recipient identity, and issuing organization.
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