import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Users, BookOpen, Send, Award, TrendingUp, Activity } from 'lucide-react';

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
    return <div style={{ color: '#94a3b8', padding: '60px', textAlign: 'center' }}>Loading platform analytics...</div>;
  }

  const kpis = [
    { label: 'Total Organizations', value: stats?.totalCompanies || 0, icon: Building2, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Active Organizations', value: stats?.activeCompanies || 0, icon: Activity, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Total Learners', value: stats?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Published Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    { label: 'Active Campaigns', value: stats?.totalCampaigns || 0, icon: Send, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Certificates Issued', value: stats?.totalCertificates || 0, icon: Award, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Platform Command Center
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Global multi-tenant analytics across all customer organizations
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>{kpi.label}</span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={18} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Platform Completion Rate
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `conic-gradient(#06b6d4 ${(stats?.platformCompletionRate || 0) * 3.6}deg, #1e293b 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: '#111a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4'
              }}>
                {stats?.platformCompletionRate || 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                <strong style={{ color: '#10b981' }}>{stats?.completedEnrollments || 0}</strong> completed out of <strong style={{ color: '#f8fafc' }}>{stats?.totalEnrollments || 0}</strong> total enrollments
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">Enterprise-Grade</span>
                <span className="badge badge-green">SOC2 Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Customer Organizations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(stats?.recentCompanies || []).map((company, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', background: '#0e1526',
                border: '1px solid #1e293b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={16} color="#06b6d4" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{company.name}</span>
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
