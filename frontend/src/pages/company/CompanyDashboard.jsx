import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, Layers } from 'lucide-react';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/company')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#71717a', padding: '60px', textAlign: 'center' }}>Loading organization dashboard...</div>;

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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Organization Security Dashboard</h1>
        <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Workforce cybersecurity readiness and training compliance overview</p>
      </div>

      {/* KPI Cards with Hover Effects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={i} 
              className="glass-card" 
              style={{ 
                padding: '20px', 
                background: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = kpi.color;
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a' }}>{kpi.label}</span>
                <div 
                  className="kpi-icon"
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px', background: kpi.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Icon size={16} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#18181b' }}>{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate + Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Completion rate ring with Hover */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '28px', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.12)';
            e.currentTarget.style.borderColor = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '20px' }}>
            Organization Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div 
              style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: `conic-gradient(from 0deg, #059669 0%, #10b981 ${(stats?.completionRate || 0) * 0.7}%, #34d399 ${(stats?.completionRate || 0)}%, #eef2f0 ${(stats?.completionRate || 0)}%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25), 0 2px 8px rgba(0,0,0,0.06)',
                padding: '10px',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>
                  {stats?.completionRate || 0}%
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Complete
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ color: '#52525b' }}><strong style={{ color: '#18181b' }}>{stats?.completed || 0}</strong> enrollments completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
                <span style={{ color: '#52525b' }}><strong style={{ color: '#18181b' }}>{stats?.inProgress || 0}</strong> currently in progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                <span style={{ color: '#52525b' }}><strong style={{ color: '#18181b' }}>{stats?.overdue || 0}</strong> past due date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Breakdown with Interactive Row Hover */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '28px', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(234, 88, 12, 0.1)';
            e.currentTarget.style.borderColor = '#ea580c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#ea580c" /> Departmental Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(stats?.departmentBreakdown || []).map((dept, i) => {
              const barColor = dept.completionRate >= 75 ? '#059669' : dept.completionRate >= 40 ? '#d97706' : '#dc2626';
              const chipBg = dept.completionRate >= 75 ? '#ecfdf5' : dept.completionRate >= 40 ? '#fffbeb' : '#fef2f2';
              return (
                <div 
                  key={i}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>{dept.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>{dept.employeeCount} staff</span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700,
                      color: barColor, background: chipBg, padding: '2px 9px', borderRadius: '6px',
                      transition: 'transform 0.2s ease'
                    }}>
                      {dept.completionRate}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '9px', borderRadius: '5px', background: '#f1f1f3', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '5px',
                      width: `${dept.completionRate}%`,
                      background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}