import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, ExternalLink, ShieldOff, X } from 'lucide-react';

export default function CompanyCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/company').then(res => setCerts(res.data.certificates || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id, certId) => {
    if (!window.confirm(`Revoke certificate ${certId}?`)) return;
    await api.put(`/certificates/${id}/revoke`, { reason: 'Revoked by Company Admin for compliance' });
    setCerts(prev => prev.map(c => c._id === id ? { ...c, status: 'REVOKED' } : c));
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading certificates...</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Issued Certificates</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Verified digital security credentials issued to your workforce</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Certificate ID</th><th>Recipient</th><th>Course</th><th>Score</th><th>Issued</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {certs.map(cert => (
              <tr key={cert._id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#06b6d4' }}>{cert.certificateId}</td>
                <td style={{ fontWeight: 600 }}>{cert.recipientName || cert.userId?.name}</td>
                <td>{cert.courseName}</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>{cert.score}%</td>
                <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{new Date(cert.issuedAt).toLocaleDateString()}</td>
                <td><span className={`badge ${cert.status === 'VALID' ? 'badge-green' : 'badge-rose'}`}>{cert.status}</span></td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                    <ExternalLink size={12} /> Verify
                  </a>
                  {cert.status === 'VALID' && (
                    <button onClick={() => handleRevoke(cert._id, cert.certificateId)} className="btn-danger" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                      <ShieldOff size={12} /> Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
