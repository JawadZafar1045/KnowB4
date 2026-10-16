import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building, BookOpen, ClipboardList, BarChart3, LogOut, ExternalLink, Menu } from 'lucide-react';
import logoImg from '../assets/logo-transparent.png';

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/super-admin', label: 'Platform Overview', icon: Shield, end: true },
    { to: '/super-admin/companies', label: 'Organizations', icon: Building },
    { to: '/super-admin/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/super-admin/quizzes', label: 'Quizzes', icon: ClipboardList },
    { to: '/super-admin/reports', label: 'Global Analytics', icon: BarChart3 },
  ];
  const initials = (user?.name || 'Admin').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
      <a className="app-verify-link" href="/verify" target="_blank" rel="noreferrer">
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
        <span>Super Admin</span>
      </div>
      <button className="app-logout" onClick={logout} title="Logout" aria-label="Logout">
        <LogOut size={18} />
      </button>
    </div>
  );

  return (
    <div className="app-shell app-shell-admin">
      <header className="mobile-app-bar">
        <img src={logoImg} alt="ThinkB4Act" />
        <span className="mobile-role-pill">Super Admin</span>
        <details className="mobile-drawer">
          <summary aria-label="Open navigation menu"><Menu size={22} /></summary>
          <div className="mobile-drawer-panel">
            <button className="mobile-drawer-overlay" onClick={closeDrawer} aria-label="Close navigation menu" />
            <div className="mobile-drawer-content">
              <div className="sidebar-brand">
                <img src={logoImg} alt="ThinkB4Act" />
                <span className="sidebar-role-pill">Super Admin</span>
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
            <span className="sidebar-role-pill">Super Admin</span>
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
