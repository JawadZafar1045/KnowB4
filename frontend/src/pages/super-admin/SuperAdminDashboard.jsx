import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Users, BookOpen, Send, Award, Activity } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/super-admin')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: '#475569', padding: '60px', textAlign: 'center', fontWeight: 600 }}>Loading platform analytics...</div>;
  }

  const kpis = [
    { label: 'Total Organizations', value: stats?.totalCompanies || 0, icon: Building2, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Active Organizations', value: stats?.activeCompanies || 0, icon: Activity, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Total Learners', value: stats?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Published Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Active Campaigns', value: stats?.totalCampaigns || 0, icon: Send, color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
    { label: 'Certificates Issued', value: stats?.totalCertificates || 0, icon: Award, color: '#e11d48', bg: 'rgba(225,29,72,0.12)' },
  ];

  return (
    <div style={{ color: '#0f172a' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Platform Command Center
        </h1>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px' }}>
          Global multi-tenant analytics across all customer organizations
        </p>
      </div>

      {/* KPI Grid with Hover Effects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={i} 
              className="glass-card" 
              style={{ 
                padding: '22px', 
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{kpi.label}</span>
                <div 
                  className="kpi-icon"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Icon size={18} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                {kpi.value}
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
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(6, 182, 212, 0.12)';
            e.currentTarget.style.borderColor = '#06b6d4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
            Platform Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '130px', height: '130px', borderRadius: '50%',
              background: `conic-gradient(from 0deg, #0891b2 0%, #06b6d4 ${(stats?.platformCompletionRate || 0) * 0.7}%, #22d3ee ${(stats?.platformCompletionRate || 0)}%, #e2e8f0 ${(stats?.platformCompletionRate || 0)}%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25), 0 2px 8px rgba(0,0,0,0.06)',
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
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: '#0891b2', letterSpacing: '-0.02em' }}>
                  {stats?.platformCompletionRate || 0}%
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Complete
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '10px' }}>
                <strong style={{ color: '#059669' }}>{stats?.completedEnrollments || 0}</strong> completed out of <strong style={{ color: '#0f172a' }}>{stats?.totalEnrollments || 0}</strong> total enrollments
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
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Customer Organizations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(stats?.recentCompanies || []).map((company, i) => (
              <div 
                key={i} 
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '8px', background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={16} color="#06b6d4" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{company.name}</span>
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