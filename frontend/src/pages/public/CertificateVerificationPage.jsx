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
        background: 'radial-gradient(ellipse at top, #EAF3F2 0%, #F6F7F9 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#71717a' }}>
          <Shield size={48} color="#356c89" />
          <p style={{ marginTop: '16px', fontSize: '1rem' }}>Verifying certificate authenticity...</p>
        </div>
      </div>
    );
  }

  const isValid = cert?.status === 'VALID';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #EAF3F2 0%, #F6F7F9 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #356c89 0%, #4e86a0 100%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(53,108,137,0.3)', marginBottom: '12px'
        }}>
          <Shield size={28} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
          Cyber<span style={{ color: '#356c89' }}>Aware</span> Certificate Verification
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: '4px' }}>
          Tamper-Proof Digital Credential Validation
        </p>
      </div>

      {/* Verification Card */}
      <div style={{
        width: '100%', maxWidth: '520px',
        background: '#ffffff',
        border: isValid ? '2px solid rgba(21, 128, 61, 0.35)' : error ? '2px solid rgba(220, 38, 38, 0.35)' : cert?.status === 'REVOKED' ? '2px solid rgba(220, 38, 38, 0.35)' : '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: isValid ? '0 8px 32px rgba(21, 128, 61, 0.12)' : '0 8px 32px rgba(220, 38, 38, 0.1)'
      }}>
        {error ? (
          <div style={{ textAlign: 'center' }}>
            <XCircle size={56} color="#dc2626" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', marginTop: '16px' }}>
              Certificate Not Found
            </h2>
            <p style={{ color: '#71717a', marginTop: '8px' }}>{error}</p>
            <p style={{ color: '#71717a', fontSize: '0.82rem', marginTop: '12px' }}>
              Searched ID: <span style={{ fontFamily: 'monospace', color: '#27272a' }}>{certificateId}</span>
            </p>
          </div>
        ) : cert ? (
          <>
            {/* Status Banner */}
            <div style={{
              textAlign: 'center', marginBottom: '24px',
              padding: '16px', borderRadius: '12px',
              background: isValid ? 'rgba(21, 128, 61, 0.08)' : 'rgba(220, 38, 38, 0.08)',
              border: `1px solid ${isValid ? 'rgba(21, 128, 61, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`
            }}>
              {isValid ? <CheckCircle2 size={40} color="#15803d" /> : <XCircle size={40} color="#dc2626" />}
              <h2 style={{
                fontSize: '1.25rem', fontWeight: 800, marginTop: '8px',
                color: isValid ? '#15803d' : '#dc2626'
              }}>
                {isValid ? 'VALID CERTIFICATE' : `CERTIFICATE ${cert.status}`}
              </h2>
              {!isValid && cert.revokedAt && (
                <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '4px' }}>
                  Revoked: {new Date(cert.revokedAt).toLocaleDateString()}
                  {cert.revokedReason && ` — ${cert.revokedReason}`}
                </p>
              )}
            </div>

            {/* Certificate Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={20} color="#356c89" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Certificate ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#356c89', fontFamily: 'monospace' }}>{cert.certificateId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} color="#356c89" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Recipient</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.recipientName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={20} color="#356c89" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Training Course</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.courseName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={20} color="#356c89" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Organization</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{cert.companyName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Percent size={20} color="#356c89" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Assessment Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{cert.score}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color="#356c89" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>Issued Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {cert.qrCodeUrl && (
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e4e4e7' }}>
                <img src={cert.qrCodeUrl} alt="Verification QR Code" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>Scan QR for verification</div>
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
                    background: 'linear-gradient(135deg, #356c89 0%, #4e86a0 100%)',
                    color: '#ffffff', fontWeight: 600, fontSize: '0.85rem',
                    textDecoration: 'none', boxShadow: '0 4px 14px rgba(53,108,137,0.3)'
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
      <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: '#71717a' }}>
        <p>Powered by CyberAware Security Awareness Platform</p>
        <p>This is a cryptographically verified digital credential. No login required.</p>
      </div>
    </div>
  );
}