import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, Award, Percent, Layers } from 'lucide-react';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/company')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '60px', textAlign: 'center' }}>Loading organization dashboard...</div>;

  const kpis = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Training Completed', value: stats?.completed || 0, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Not Started', value: stats?.notStarted || 0, icon: AlertTriangle, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
    { label: 'Avg Score', value: `${stats?.averageScore || 0}%`, icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Organization Security Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Workforce cybersecurity readiness and training compliance overview</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>{kpi.label}</span>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', background: kpi.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={16} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate + Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Completion rate ring */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Organization Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: `conic-gradient(#10b981 ${(stats?.completionRate || 0) * 3.6}deg, #1e293b 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: '#111a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800, color: '#10b981'
              }}>
                {stats?.completionRate || 0}%
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#10b981' }}>{stats?.completed || 0}</strong> enrollments completed</div>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#f59e0b' }}>{stats?.inProgress || 0}</strong> currently in progress</div>
              <div><strong style={{ color: '#f43f5e' }}>{stats?.overdue || 0}</strong> past due date</div>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#06b6d4" /> Departmental Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(stats?.departmentBreakdown || []).map((dept, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{dept.name}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {dept.employeeCount} staff &bull; {dept.completionRate}% complete
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#1e293b' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${dept.completionRate}%`,
                    background: dept.completionRate >= 75 ? '#10b981' : dept.completionRate >= 40 ? '#f59e0b' : '#f43f5e',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
