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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: "#fafafa"}}>
      <DemoRoleBar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '265px',
          background: '#0a0f1d',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          gap: '20px'
        }}>
          {/* Company Brand */}
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Building2 size={16} color="#06b6d4" />
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                TENANT ADMIN
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {user?.company?.subscriptionPlan || 'Enterprise'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
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
          <div style={{ marginTop: 'auto', padding: '12px', background: '#0f172a', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Public Verification:</div>
            <a
              href="/verify/CA-2026-000001"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
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
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.jobTitle || 'SecOps Lead'}</div>
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

        {/* Content Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxHeight: 'calc(100vh - 35px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
