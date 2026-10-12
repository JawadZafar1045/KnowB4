import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, CheckCircle2, XCircle, Award, Calendar, Building2, User, Percent, ExternalLink } from 'lucide-react';
import logoImg from '../../assets/logo-transparent.png';
import { resolveAssetUrl } from '../../services/api';
import { formatOrganizationName, formatStatus } from '../../utils/displayFormatters';

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/certificates/verify/${certificateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCert(data.certificate);
        } else {
          setError(data.message || 'Certificate not found');
        }
      })
      .catch(() => setError('Unable to connect to verification service'))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return (
      <div className="certificate-page" style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Shield size={48} color="var(--navy)" />
          <p style={{ marginTop: '16px', fontSize: '1rem' }}>Verifying certificate authenticity...</p>
        </div>
      </div>
    );
  }

  const isValid = cert?.status === 'VALID';

  return (
    <div className="certificate-page" style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img className="certificate-brand-logo"
          src={logoImg}
          alt="ThinkB4Act"
          style={{
            width: 'min(220px, 72vw)', height: 'auto', objectFit: 'contain',
            marginBottom: '12px'
          }}
        />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Certificate Verification
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          Tamper-Proof Digital Credential Validation
        </p>
      </div>

      {/* Verification Card */}
      <div className="certificate-card" style={{
        width: '100%', maxWidth: '520px',
        background: 'var(--card)',
        border: isValid ? '1px solid var(--success-border)' : error || cert?.status === 'REVOKED' ? '1px solid var(--danger-border)' : '1px solid var(--border)',
        borderRadius: '12px',
        padding: '36px',
        boxShadow: 'var(--shadow-card)'
      }}>
        {error ? (
          <div style={{ textAlign: 'center' }}>
            <XCircle size={56} color="var(--danger-text)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger-text)', marginTop: '16px' }}>
              Certificate Not Found
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '12px' }}>
              Searched ID: <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{certificateId}</span>
            </p>
          </div>
        ) : cert ? (
          <>
            {/* Status Banner */}
            <div style={{
              textAlign: 'center', marginBottom: '24px',
              padding: '16px', borderRadius: '12px',
              background: isValid ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1px solid ${isValid ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}>
              {isValid ? <CheckCircle2 size={40} color="var(--success-text)" /> : <XCircle size={40} color="var(--danger-text)" />}
              <h2 style={{
                fontSize: '1.25rem', fontWeight: 800, marginTop: '8px',
                color: isValid ? 'var(--success-text)' : 'var(--danger-text)'
              }}>
                {isValid ? 'VALID CERTIFICATE' : `CERTIFICATE ${formatStatus(cert.status)}`}
              </h2>
              {!isValid && cert.revokedAt && (
                <p style={{ color: 'var(--danger-text)', fontSize: '0.82rem', marginTop: '4px' }}>
                  Revoked: {new Date(cert.revokedAt).toLocaleDateString()}
                  {cert.revokedReason && ` — ${cert.revokedReason}`}
                </p>
              )}
            </div>

            {/* Certificate Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={20} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Certificate ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'monospace' }}>{cert.certificateId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{cert.recipientName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={20} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Training Course</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{cert.courseName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={20} color="var(--navy)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Organization</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{formatOrganizationName(cert.companyName)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Percent size={20} color="var(--success-text)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assessment Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)' }}>{cert.score}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color="var(--navy)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Issued Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {cert.qrCodeUrl && (
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <img src={cert.qrCodeUrl} alt="Verification QR Code" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Scan QR for verification</div>
              </div>
            )}

            {/* Download PDF */}
            {cert.pdfUrl && isValid && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <a
                  href={resolveAssetUrl(cert.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '8px',
                    background: 'var(--orange)',
                    color: 'var(--card)', fontWeight: 600, fontSize: '0.85rem',
                    textDecoration: 'none', boxShadow: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Download Certificate PDF
                </a>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <p>Powered by ThinkB4Act Security Awareness Platform</p>
        <p>This is a cryptographically verified digital credential. No login required.</p>
      </div>
    </div>
  );
}