import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, BookOpen, Award, Compass, LogOut, ExternalLink } from 'lucide-react';
import DemoRoleBar from '../components/DemoRoleBar';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/employee', label: 'My Training', icon: BookOpen, end: true },
    { to: '/employee/catalog', label: 'Course Catalog', icon: Compass },
    { to: '/employee/certificates', label: 'My Certificates', icon: Award },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070b14' }}>
      <DemoRoleBar />

      {/* Top Navbar */}
      <header style={{
        background: '#0a0f1d',
        borderBottom: '1px solid #1e293b',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
              Cyber<span style={{ color: '#06b6d4' }}>Aware</span>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              background: '#111a2e',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #1e293b'
            }}>
              {user?.company?.name || 'Acme Financial'}
            </span>
          </div>

          {/* Nav Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/verify/CA-2026-000001"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '0.75rem',
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #1e293b'
            }}
          >
            Verify Certificate <ExternalLink size={10} />
          </a>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
              {user?.name || 'Ahmed Khan'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {user?.jobTitle || 'Senior Financial Analyst'}
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            style={{
              background: '#111a2e',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
