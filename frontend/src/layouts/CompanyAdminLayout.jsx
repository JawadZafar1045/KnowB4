import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  Send,
  BarChart2,
  Award,
  FileText,
  LogOut,
  Building2,
  ExternalLink
} from 'lucide-react';
import DemoRoleBar from '../components/DemoRoleBar';

export default function CompanyAdminLayout() {
  const { user, logout } = useAuth();

  const companyName = user?.company?.name || 'Customer Organization';
  const initials = (user?.name || 'Admin').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { to: '/company', label: 'Org Dashboard', icon: LayoutDashboard, end: true },
    { to: '/company/employees', label: 'Employees & Roster', icon: Users },
    { to: '/company/departments', label: 'Departments', icon: Layers },
    { to: '/company/campaigns', label: 'Training Campaigns', icon: Send },
    { to: '/company/reports', label: 'Analytics & Reports', icon: BarChart2 },
    { to: '/company/certificates', label: 'Certificates', icon: Award },
    { to: '/company/audit-logs', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F6F7F9' }}>
      <DemoRoleBar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '265px',
          background: 'linear-gradient(160deg, #2f6c8b 0%, #356c89 55%, #3d7491 100%)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          gap: '20px'
        }}>
          {/* Company Brand */}
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Building2 size={16} color="#a5c8d7" />
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                TENANT ADMIN
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                {user?.company?.subscriptionPlan || 'Enterprise'}
              </span>
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
                    padding: '9px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    background: isActive
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #a5c8d7' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Public Verification Link */}
          <div style={{
            marginTop: 'auto',
            padding: '12px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '6px' }}>PUBLIC VERIFICATION</div>
            <a
              href="/verify/CA-2026-000001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#a5c8d7',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Verify Certificate <ExternalLink size={11} />
            </a>
          </div>

          {/* User Profile Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
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
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{user?.jobTitle || 'SecOps Lead'}</div>
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

        {/* Content Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxHeight: 'calc(100vh - 35px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}