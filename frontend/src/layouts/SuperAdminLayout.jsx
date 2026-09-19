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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F6F7F9' }}>
      <DemoRoleBar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '268px',
          background: 'linear-gradient(160deg, #2f6c8b 0%, #356c89 55%, #3d7491 100%)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
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
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 4px rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}>
              <Shield size={23} color="#356c89" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.08rem', letterSpacing: '-0.01em', color: '#ffffff', lineHeight: 1.1 }}>
                Cyber<span style={{ color: '#a5c8d7' }}>Aware</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#a5c8d7', fontWeight: 700, letterSpacing: '0.08em', marginTop: '2px' }}>
                SUPER ADMIN
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', padding: '0 12px 6px' }}>
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
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    background: isActive
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #a5c8d7' : '3px solid transparent',
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
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '8px' }}>PUBLIC TOOLS</div>
            <a
              href="/verify/CA-2026-000001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#a5c8d7',
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
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, color: '#356c89'
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Platform Owner</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
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