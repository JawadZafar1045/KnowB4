import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, CheckCircle2, XCircle, Award, Calendar, Building2, User, Percent, ExternalLink } from 'lucide-react';

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/certificates/verify/${certificateId}`)
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
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0f1c3f 0%, #070b14 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <Shield size={48} color="#06b6d4" />
          <p style={{ marginTop: '16px', fontSize: '1rem' }}>Verifying certificate authenticity...</p>
        </div>
      </div>
    );
  }

  const isValid = cert?.status === 'VALID';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f1c3f 0%, #070b14 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 25px rgba(6,182,212,0.35)', marginBottom: '12px'
        }}>
          <Shield size={28} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
          Cyber<span style={{ color: '#06b6d4' }}>Aware</span> Certificate Verification
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
          Tamper-Proof Digital Credential Validation
        </p>
      </div>

      {/* Verification Card */}
      <div style={{
        width: '100%', maxWidth: '520px',
        background: 'rgba(17, 26, 46, 0.85)',
        backdropFilter: 'blur(12px)',
        border: isValid ? '2px solid rgba(16, 185, 129, 0.4)' : error ? '2px solid rgba(244, 63, 94, 0.4)' : cert?.status === 'REVOKED' ? '2px solid rgba(244, 63, 94, 0.4)' : '1px solid #1e293b',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: isValid ? '0 0 40px rgba(16, 185, 129, 0.12)' : '0 0 40px rgba(244, 63, 94, 0.1)'
      }}>
        {error ? (
          <div style={{ textAlign: 'center' }}>
            <XCircle size={56} color="#f43f5e" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '16px' }}>
              Certificate Not Found
            </h2>
            <p style={{ color: '#94a3b8', marginTop: '8px' }}>{error}</p>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '12px' }}>
              Searched ID: <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{certificateId}</span>
            </p>
          </div>
        ) : cert ? (
          <>
            {/* Status Banner */}
            <div style={{
              textAlign: 'center', marginBottom: '24px',
              padding: '16px', borderRadius: '12px',
              background: isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {isValid ? <CheckCircle2 size={40} color="#10b981" /> : <XCircle size={40} color="#f43f5e" />}
              <h2 style={{
                fontSize: '1.25rem', fontWeight: 800, marginTop: '8px',
                color: isValid ? '#10b981' : '#f43f5e'
              }}>
                {isValid ? 'VALID CERTIFICATE' : `CERTIFICATE ${cert.status}`}
              </h2>
              {!isValid && cert.revokedAt && (
                <p style={{ color: '#fb7185', fontSize: '0.82rem', marginTop: '4px' }}>
                  Revoked: {new Date(cert.revokedAt).toLocaleDateString()}
                  {cert.revokedReason && ` — ${cert.revokedReason}`}
                </p>
              )}
            </div>

            {/* Certificate Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Certificate ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'monospace' }}>{cert.certificateId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Recipient</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.recipientName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={20} color="#06b6d4" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Training Course</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.courseName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={20} color="#a78bfa" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Organization</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.companyName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Percent size={20} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Assessment Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{cert.score}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Issued Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {cert.qrCodeUrl && (
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <img src={cert.qrCodeUrl} alt="Verification QR Code" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Scan QR for verification</div>
              </div>
            )}

            {/* Download PDF */}
            {cert.pdfUrl && isValid && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <a
                  href={`http://localhost:5000${cert.pdfUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                    color: '#ffffff', fontWeight: 600, fontSize: '0.85rem',
                    textDecoration: 'none', boxShadow: '0 4px 14px rgba(6,182,212,0.3)'
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
      <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: '#475569' }}>
        <p>Powered by CyberAware Security Awareness Platform</p>
        <p>This is a cryptographically verified digital credential. No login required.</p>
      </div>
    </div>
  );
}
