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

  const initials = (user?.name || 'Admin').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <DemoRoleBar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '268px',
          background: 'linear-gradient(160deg, #1e1b4b 0%, #0f0a2e 55%, #1a0e2e 100%)',
          borderRight: '1px solid rgba(168,85,247,0.12)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 18px',
          gap: '30px'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', paddingLeft: '4px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 4px rgba(236,72,153,0.1), 0 4px 16px rgba(168, 85, 247, 0.4)',
              flexShrink: 0
            }}>
              <Shield size={23} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.08rem', letterSpacing: '-0.01em', color: '#f8fafc', lineHeight: 1.1 }}>
                Cyber<span style={{ color: '#f472b6' }}>Aware</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#f472b6', fontWeight: 700, letterSpacing: '0.08em', marginTop: '2px' }}>
                SUPER ADMIN
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', padding: '0 12px 6px' }}>
              MENU
            </div>
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
                    padding: '11px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(168,85,247,0.22), rgba(236,72,153,0.12))'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #ec4899' : '3px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(236,72,153,0.15)' : 'none',
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
          <div style={{
            marginTop: 'auto',
            padding: '14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(148,163,184,0.1)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '8px' }}>PUBLIC TOOLS</div>
            <a
              href="/verify/CA-2026-000001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#e879f9',
                fontSize: '0.82rem',
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
            paddingTop: '18px',
            borderTop: '1px solid rgba(148,163,184,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, color: '#ffffff'
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Platform Owner</div>
              </div>
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
                borderRadius: '6px',
                flexShrink: 0
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