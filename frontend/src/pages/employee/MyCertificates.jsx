import React, { useState, useEffect } from 'react';
import api, { resolveAssetUrl } from '../../services/api';
import { Award, ExternalLink, Download } from 'lucide-react';
import { formatOrganizationName, formatStatus } from '../../utils/displayFormatters';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my').then(res => setCertificates(res.data.certificates || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '60px', textAlign: 'center' }}>Loading certificates...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>My Certificates</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified digital security credentials you've earned</p>
      </div>

      {certificates.length === 0 ? (
        <div className="surface-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Award size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No certificates earned yet. Complete a course assessment to receive your verified certificate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {certificates.map(cert => (
            <div key={cert._id} className="surface-card" style={{
              padding: '28px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative corner accent */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--surface-subtle)'
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--icon-tile)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Award size={26} color="var(--warning-text)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem' }}>{cert.courseName}</h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--navy)' }}>{cert.certificateId}</div>
                </div>
                <span className={`badge ${cert.status === 'VALID' ? 'badge-green' : 'badge-rose'}`}>{formatStatus(cert.status)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Organization:</span> <span style={{ color: 'var(--text)' }}>{formatOrganizationName(cert.companyName)}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Score:</span> <strong style={{ color: 'var(--success-text)' }}>{cert.score}%</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Issued:</span> <span style={{ color: 'var(--border)' }}>{new Date(cert.issuedAt).toLocaleDateString()}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Recipient:</span> <span style={{ color: 'var(--border)' }}>{cert.recipientName}</span></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.78rem' }}>
                  <ExternalLink size={12} /> Verify Online
                </a>
                {cert.pdfUrl && (
                  <a href={resolveAssetUrl(cert.pdfUrl)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                    <Download size={12} /> Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
