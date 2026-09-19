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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <DemoRoleBar />

      {/* Top Navbar */}
      <header style={{
        background: 'linear-gradient(100deg, #1e1b4b 0%, #0f0a2e 55%, #1a0e2e 100%)',
        borderBottom: '1px solid rgba(168,85,247,0.12)',
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
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 3px rgba(236,72,153,0.1), 0 4px 12px rgba(168, 85, 247, 0.35)'
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
              Cyber<span style={{ color: '#f472b6' }}>Aware</span>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: '#c4b5fd',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(168,85,247,0.2)'
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
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(168,85,247,0.22), rgba(236,72,153,0.12))'
                      : 'transparent',
                    border: isActive ? '1px solid rgba(236,72,153,0.35)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 14px rgba(236,72,153,0.15)' : 'none',
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
              color: '#c4b5fd',
              fontSize: '0.75rem',
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(168,85,247,0.2)'
            }}
          >
            Verify Certificate <ExternalLink size={10} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#ffffff'
            }}>
              {(user?.name || 'Ahmed Khan').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                {user?.name || 'Ahmed Khan'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {user?.jobTitle || 'Senior Financial Analyst'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(168,85,247,0.2)',
              color: '#c4b5fd',
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