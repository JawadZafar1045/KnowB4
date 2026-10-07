import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, Layers } from 'lucide-react';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    api.get('/reports/company')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Animate every number on this page from 0 up to its real value once data has loaded
  useEffect(() => {
    if (loading || !stats) return;
    let frameId;
    let startTime = null;
    const duration = 1100;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimProgress(eased);
      if (t < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [loading, stats]);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '60px', textAlign: 'center' }}>Loading organization dashboard...</div>;

  // Single consistent steel-blue accent for every KPI icon and hover state
  const kpis = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, suffix: '', icon: Users },
    { label: 'Training Completed', value: stats?.completed || 0, suffix: '', icon: CheckCircle2 },
    { label: 'In Progress', value: stats?.inProgress || 0, suffix: '', icon: Clock },
    { label: 'Not Started', value: stats?.notStarted || 0, suffix: '', icon: AlertTriangle },
    { label: 'Overdue', value: stats?.overdue || 0, suffix: '', icon: AlertTriangle },
    { label: 'Avg Score', value: stats?.averageScore || 0, suffix: '%', icon: TrendingUp },
  ];

  const completionRate = stats?.completionRate || 0;
  const animatedCompletion = Math.round(completionRate * animProgress);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Organization Security Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Workforce cybersecurity readiness and training compliance overview</p>
      </div>

      {/* KPI Cards with consistent hover effects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const displayValue = Math.round(kpi.value * animProgress);
          return (
            <div
              key={i}
              className="surface-card"
              style={{
                padding: '20px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--navy)';
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1.1)';
                const bar = e.currentTarget.querySelector('.kpi-accent-bar');
                if (bar) bar.style.transform = 'scaleX(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1)';
                const bar = e.currentTarget.querySelector('.kpi-accent-bar');
                if (bar) bar.style.transform = 'scaleX(0)';
              }}
            >
              <div
                className="kpi-accent-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'var(--navy)',
                  transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="kpi-label" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</span>
                <div
                  className="kpi-icon"
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px', background: 'var(--icon-tile)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Icon size={16} color="var(--orange)" />
                </div>
              </div>
              <div className="kpi-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>{displayValue}{kpi.suffix}</div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate + Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Completion rate ring with consistent hover */}
        <div
          className="surface-card"
          style={{
            padding: '28px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: 'var(--shadow-card)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            e.currentTarget.style.borderColor = 'var(--navy)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
            Organization Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div
              style={{
                width: '140px', height: '140px', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
                <circle cx="70" cy="70" r="65" fill="none" stroke="#E3E8EF" strokeWidth="10" />
                <circle
                  cx="70"
                  cy="70"
                  r="65"
                  fill="none"
                  stroke="#F26A1B"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 65}
                  strokeDashoffset={2 * Math.PI * 65 * (1 - animatedCompletion / 100)}
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
                  {animatedCompletion}%
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Complete
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-text)', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text)' }}>{stats?.completed || 0}</strong> enrollments completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning-text)', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text)' }}>{stats?.inProgress || 0}</strong> currently in progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger-text)', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text)' }}>{stats?.overdue || 0}</strong> past due date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Breakdown with consistent hover */}
        <div
          className="surface-card"
          style={{
            padding: '28px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: 'var(--shadow-card)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            e.currentTarget.style.borderColor = 'var(--navy)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--navy)" /> Departmental Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(stats?.departmentBreakdown || []).map((dept, i) => {
              const barColor = 'var(--orange)';
              const chipBg = 'var(--surface-subtle)';
              const chipColor = 'var(--navy)';
              const animatedDeptRate = Math.round(dept.completionRate * animProgress);
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
                    e.currentTarget.style.background = 'var(--surface-subtle)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{dept.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dept.employeeCount} staff</span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700,
                      color: chipColor, background: chipBg, border: '1px solid var(--orange)', padding: '2px 9px', borderRadius: '9999px',
                      transition: 'transform 0.2s ease'
                    }}>
                      {animatedDeptRate}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '9px', borderRadius: '5px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '5px',
                      width: `${animatedDeptRate}%`,
                      background: barColor,
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