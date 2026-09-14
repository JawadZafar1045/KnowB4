import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, ExternalLink, Download } from 'lucide-react';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my').then(res => setCertificates(res.data.certificates || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '60px', textAlign: 'center' }}>Loading certificates...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>My Certificates</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Verified digital security credentials you've earned</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Award size={48} color="#64748b" />
          <p style={{ color: '#94a3b8', marginTop: '16px' }}>No certificates earned yet. Complete a course assessment to receive your verified certificate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {certificates.map(cert => (
            <div key={cert._id} className="glass-card" style={{
              padding: '28px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(99,102,241,0.04) 100%)',
              border: '1px solid rgba(6,182,212,0.25)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative corner accent */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)'
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(6,182,212,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Award size={26} color="#f59e0b" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.05rem' }}>{cert.courseName}</h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#06b6d4' }}>{cert.certificateId}</div>
                </div>
                <span className={`badge ${cert.status === 'VALID' ? 'badge-green' : 'badge-rose'}`}>{cert.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div><span style={{ color: '#64748b' }}>Organization:</span> <span style={{ color: '#e2e8f0' }}>{cert.companyName}</span></div>
                <div><span style={{ color: '#64748b' }}>Score:</span> <strong style={{ color: '#10b981' }}>{cert.score}%</strong></div>
                <div><span style={{ color: '#64748b' }}>Issued:</span> <span style={{ color: '#e2e8f0' }}>{new Date(cert.issuedAt).toLocaleDateString()}</span></div>
                <div><span style={{ color: '#64748b' }}>Recipient:</span> <span style={{ color: '#e2e8f0' }}>{cert.recipientName}</span></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.78rem' }}>
                  <ExternalLink size={12} /> Verify Online
                </a>
                {cert.pdfUrl && (
                  <a href={`http://localhost:5000${cert.pdfUrl}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.78rem' }}>
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
