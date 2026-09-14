import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, User, Clock } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/audit-logs').then(res => setLogs(res.data.logs || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading audit trail...</div>;

  const actionColors = {
    CERTIFICATE_ISSUED: 'badge-green',
    CERTIFICATE_REVOKED: 'badge-rose',
    CAMPAIGN_LAUNCHED: 'badge-cyan',
    EMPLOYEE_CREATED: 'badge-amber',
    EMPLOYEES_BULK_IMPORTED: 'badge-amber',
    COMPANY_CREATED: 'badge-cyan',
    COMPANY_STATUS_UPDATED: 'badge-slate',
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Compliance Audit Trail</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Security event log for organizational governance</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.userId?.name || 'System'}</td>
                <td><span className={`badge ${actionColors[log.action] || 'badge-slate'}`} style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                <td style={{ color: '#94a3b8' }}>{log.resource}</td>
                <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
