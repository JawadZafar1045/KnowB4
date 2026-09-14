import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoRoleBar() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      email: 'superadmin@cyberaware.io',
      icon: Shield,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
      redirect: '/super-admin'
    },
    {
      role: 'COMPANY_ADMIN',
      label: 'Acme Admin',
      email: 'admin@acmefinance.com',
      icon: Building2,
      color: 'border-blue-500/40 text-blue-400 bg-blue-950/40',
      redirect: '/company'
    },
    {
      role: 'EMPLOYEE',
      label: 'Ahmed (Learner)',
      email: 'ahmed@acmefinance.com',
      icon: User,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
      redirect: '/employee'
    },
    {
      role: 'EMPLOYEE_2',
      label: 'Sara (Learner)',
      email: 'sara@acmefinance.com',
      icon: User,
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
      redirect: '/employee'
    }
  ];

  const handleSwitch = async (email, redirect) => {
    const res = await login(email, 'Password123!');
    if (res.success) {
      navigate(redirect);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #090e1c 0%, #111a2e 100%)',
      borderBottom: '1px solid #1e293b',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(6, 182, 212, 0.2)',
          color: '#22d3ee',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          DEMO SWITCHER
        </span>
        <span style={{ color: '#94a3b8' }}>Switch perspective:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {demoAccounts.map((acc) => {
          const Icon = acc.icon;
          const isCurrent = user?.email === acc.email;
          return (
            <button
              key={acc.email}
              onClick={() => handleSwitch(acc.email, acc.redirect)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: isCurrent ? '1px solid #06b6d4' : '1px solid #1e293b',
                background: isCurrent ? 'rgba(6, 182, 212, 0.25)' : '#0d1424',
                color: isCurrent ? '#22d3ee' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: '0.75rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={12} />
              {acc.label}
              {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
