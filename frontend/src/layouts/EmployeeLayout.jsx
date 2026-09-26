import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Compass, LogOut, ExternalLink } from 'lucide-react';
import DemoRoleBar from '../components/DemoRoleBar';
import logoImg from '../assets/logo.png';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/employee', label: 'My Training', icon: BookOpen, end: true },
    { to: '/employee/catalog', label: 'Course Catalog', icon: Compass },
    { to: '/employee/certificates', label: 'My Certificates', icon: Award },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F6F7F9' }}>
      <DemoRoleBar />

      {/* Top Navbar */}
      <header style={{
        background: 'linear-gradient(100deg, #2f6c8b 0%, #356c89 55%, #3d7491 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img
              src={logoImg}
              alt="Logo"
              style={{
                width: '34px',
                height: '34px',
                objectFit: 'contain'
              }}
            />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
              THINKB4<span style={{ color: '#0d3741' }}>ACT</span>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: '#ffffff',
              background: 'rgba(255,255,255,0.12)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)'
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
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    background: isActive
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
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
              color: '#a5c8d7',
              fontSize: '0.75rem',
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            Verify Certificate <ExternalLink size={10} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#356c89'
            }}>
              {(user?.name || 'Ahmed Khan').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                {user?.name || 'Ahmed Khan'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                {user?.jobTitle || 'Senior Financial Analyst'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
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