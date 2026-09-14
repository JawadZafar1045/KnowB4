import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building, BookOpen, BarChart3, LogOut, ExternalLink } from 'lucide-react';
import DemoRoleBar from '../components/DemoRoleBar';

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/super-admin', label: 'Platform Overview', icon: Shield, end: true },
    { to: '/super-admin/companies', label: 'Organizations', icon: Building },
    { to: '/super-admin/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/super-admin/reports', label: 'Global Analytics', icon: BarChart3 },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070b14' }}>
      <DemoRoleBar />
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '260px',
          background: '#0a0f1d',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          gap: '24px'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Cyber<span style={{ color: '#06b6d4' }}>Aware</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.05em' }}>
                SUPER ADMIN
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Public Verification Link */}
          <div style={{ marginTop: 'auto', padding: '12px', background: '#0f172a', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Public Tools:</div>
            <a
              href="/verify/CA-2026-000001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Verify Certificate <ExternalLink size={12} />
            </a>
          </div>

          {/* User footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Platform Owner</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxHeight: 'calc(100vh - 35px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
