import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart2 } from 'lucide-react';

export default function TrainingReports() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/company').then(res => setEnrollments(res.data.enrollments || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading reports...</div>;

  const statusColors = { COMPLETED: 'badge-green', IN_PROGRESS: 'badge-amber', ASSIGNED: 'badge-slate', FAILED: 'badge-rose', OVERDUE: 'badge-rose' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Training Analytics & Reports</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Detailed per-employee enrollment status and scores</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Course</th><th>Campaign</th><th>Progress</th><th>Status</th><th>Assigned</th><th>Due</th></tr></thead>
          <tbody>
            {enrollments.map(en => (
              <tr key={en._id}>
                <td style={{ fontWeight: 600 }}>{en.userId?.name || '—'}</td>
                <td>{en.courseId?.title || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{en.campaignId?.name || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: '#1e293b' }}>
                      <div style={{ width: `${en.progressPercentage}%`, height: '100%', borderRadius: '3px', background: en.progressPercentage >= 100 ? '#10b981' : '#06b6d4' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>{en.progressPercentage}%</span>
                  </div>
                </td>
                <td><span className={`badge ${statusColors[en.status] || 'badge-slate'}`}>{en.status}</span></td>
                <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{new Date(en.assignedAt || en.createdAt).toLocaleDateString()}</td>
                <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{new Date(en.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
