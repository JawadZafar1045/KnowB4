import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Users, BookOpen, Send, Award, Activity } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    api.get('/reports/super-admin')
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

  if (loading) {
    return <div style={{ color: '#71717a', padding: '60px', textAlign: 'center', fontWeight: 600 }}>Loading platform analytics...</div>;
  }

  // Single consistent accent (steel-blue) for every KPI icon and hover state
  const kpis = [
    { label: 'Total Organizations', value: stats?.totalCompanies || 0, icon: Building2 },
    { label: 'Active Organizations', value: stats?.activeCompanies || 0, icon: Activity },
    { label: 'Total Learners', value: stats?.totalEmployees || 0, icon: Users },
    { label: 'Published Courses', value: stats?.totalCourses || 0, icon: BookOpen },
    { label: 'Active Campaigns', value: stats?.totalCampaigns || 0, icon: Send },
    { label: 'Certificates Issued', value: stats?.totalCertificates || 0, icon: Award },
  ];

  const completionRate = stats?.platformCompletionRate || 0;
  const animatedCompletion = Math.round(completionRate * animProgress);

  return (
    <div style={{ color: '#18181b' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
          Platform Command Center
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem', marginTop: '4px' }}>
          Global multi-tenant analytics across all customer organizations
        </p>
      </div>

      {/* KPI Grid with consistent hover effects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const displayValue = Math.round(kpi.value * animProgress);
          return (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '22px',
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '14px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 24px -6px rgba(53, 108, 137, 0.18), 0 4px 8px -2px rgba(53, 108, 137, 0.08)';
                e.currentTarget.style.borderColor = '#356c89';
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1.1)';
                const bar = e.currentTarget.querySelector('.kpi-accent-bar');
                if (bar) bar.style.transform = 'scaleX(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e4e4e7';
                const iconBox = e.currentTarget.querySelector('.kpi-icon');
                if (iconBox) iconBox.style.transform = 'scale(1)';
                const bar = e.currentTarget.querySelector('.kpi-accent-bar');
                if (bar) bar.style.transform = 'scaleX(0)';
              }}
            >
              {/* Thin accent bar that sweeps in on hover — same color for every card */}
              <div
                className="kpi-accent-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #356c89, #4e86a0)',
                  transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#52525b' }}>{kpi.label}</span>
                <div
                  className="kpi-icon"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(53, 108, 137, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Icon size={18} color="#356c89" />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.03em' }}>
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate & Recent Organizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Completion Rate Card */}
        <div
          className="glass-card"
          style={{
            padding: '28px',
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '14px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(53, 108, 137, 0.16)';
            e.currentTarget.style.borderColor = '#356c89';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#e4e4e7';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '20px' }}>
            Platform Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '130px', height: '130px', borderRadius: '50%',
              background: `conic-gradient(from 0deg, #2f6c8b 0%, #356c89 ${animatedCompletion * 0.7}%, #4e86a0 ${animatedCompletion}%, #e4e4e7 ${animatedCompletion}%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(53, 108, 137, 0.22), 0 2px 8px rgba(0,0,0,0.06)',
              padding: '9px',
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
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: '#356c89', letterSpacing: '-0.02em' }}>
                  {animatedCompletion}%
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Complete
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#3f3f46', marginBottom: '10px' }}>
                <strong style={{ color: '#15803d' }}>{stats?.completedEnrollments || 0}</strong> completed out of <strong style={{ color: '#18181b' }}>{stats?.totalEnrollments || 0}</strong> total enrollments
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">Enterprise-Grade</span>
                <span className="badge badge-green">SOC2 Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Organizations Card */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '14px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(53, 108, 137, 0.16)';
            e.currentTarget.style.borderColor = '#356c89';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#e4e4e7';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '16px' }}>
            Customer Organizations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(stats?.recentCompanies || []).map((company, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px', background: '#fafafa',
                  border: '1px solid #e4e4e7',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(53, 108, 137, 0.05)';
                  e.currentTarget.style.borderColor = '#356c89';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.borderColor = '#e4e4e7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={16} color="#356c89" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#18181b' }}>{company.name}</span>
                </div>
                <span className={`badge ${company.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                  {company.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}