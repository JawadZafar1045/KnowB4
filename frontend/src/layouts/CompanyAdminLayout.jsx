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
  ExternalLink,
  BookOpen,
  Menu
} from 'lucide-react';
import SetPasswordModal from '../components/auth/SetPasswordModal';
import logoImg from '../assets/logo-transparent.png';
import { formatOrganizationName } from '../utils/displayFormatters';

export default function CompanyAdminLayout() {
  const { user, logout } = useAuth();
  const companyName = formatOrganizationName(user?.company?.name || 'Customer Organization');
  const initials = (user?.name || 'Admin').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { to: '/company', label: 'Org Dashboard', icon: LayoutDashboard, end: true },
    { to: '/company/employees', label: 'Employees & Roster', icon: Users },
    { to: '/company/departments', label: 'Departments', icon: Layers },
    { to: '/company/courses', label: 'Course Library', icon: BookOpen },
    { to: '/company/campaigns', label: 'Training Campaigns', icon: Send },
    { to: '/company/reports', label: 'Analytics & Reports', icon: BarChart2 },
    { to: '/company/certificates', label: 'Certificates', icon: Award },
    { to: '/company/audit-logs', label: 'Audit Trail', icon: FileText },
  ];
  const closeDrawer = (event) => {
    const drawer = event.currentTarget.closest('details');
    if (drawer) drawer.open = false;
  };

  const renderNavigation = (className = '') => (
    <nav className={`app-sidebar-nav ${className}`}>
      <span className="sidebar-section-label">MENU</span>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={closeDrawer}
          className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
      <a className="app-verify-link" href="/verify/CA-2026-000001" target="_blank" rel="noreferrer">
        <ExternalLink size={18} aria-hidden="true" />
        <span>Verify Certificate</span>
      </a>
    </nav>
  );

  const renderUser = (className = '') => (
    <div className={`app-user-card ${className}`}>
      <div className="app-avatar">{initials}</div>
      <div className="app-user-copy">
        <strong>{user?.name || 'Administrator'}</strong>
        <span>{user?.jobTitle || 'Company Admin'}</span>
      </div>
      <button className="app-logout" onClick={logout} title="Logout" aria-label="Logout">
        <LogOut size={18} />
      </button>
    </div>
  );

  return (
    <div className="app-shell app-shell-admin">
      {user?.requiresPasswordReset && <SetPasswordModal />}
      <header className="mobile-app-bar">
        <img src={logoImg} alt="ThinkB4Act" />
        <span className="mobile-role-pill">Company Admin</span>
        <details className="mobile-drawer">
          <summary aria-label="Open navigation menu"><Menu size={22} /></summary>
          <div className="mobile-drawer-panel">
            <button className="mobile-drawer-overlay" onClick={closeDrawer} aria-label="Close navigation menu" />
            <div className="mobile-drawer-content">
              <div className="sidebar-brand">
                <img src={logoImg} alt="ThinkB4Act" />
                <span className="sidebar-role-pill">Company Admin</span>
              </div>
              <div className="sidebar-organization">
                <strong>{companyName}</strong>
                <span>{user?.company?.subscriptionPlan || 'Enterprise'}</span>
              </div>
              {renderNavigation('mobile-drawer-nav')}
              {renderUser('mobile-drawer-user')}
            </div>
          </div>
        </details>
      </header>

      <div className="app-shell-row">
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <img src={logoImg} alt="ThinkB4Act" />
            <span className="sidebar-role-pill">Company Admin</span>
          </div>
          <div className="sidebar-organization">
            <strong>{companyName}</strong>
            <span>{user?.company?.subscriptionPlan || 'Enterprise'}</span>
          </div>
          {renderNavigation()}
          {renderUser()}
        </aside>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
