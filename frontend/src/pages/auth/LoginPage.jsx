import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@acmefinance.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (res.user.role === 'COMPANY_ADMIN') {
        navigate('/company');
      } else {
        navigate('/employee');
      }
    } else {
      setError(res.message);
    }
  };

  const fillCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f1c3f 0%, #070b14 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
            marginBottom: '16px'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
            Cyber<span style={{ color: '#06b6d4' }}>Aware</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
            Multi-Tenant Security Awareness & Training Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>
            Sign In to Portal
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    background: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    background: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                transition: 'opacity 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In to CyberAware <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Fill */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Quick Demo Logins (Click to autofill)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: '🛡️ Super Admin', email: 'superadmin@cyberaware.io' },
                { label: '🏢 Acme Admin', email: 'admin@acmefinance.com' },
                { label: '👤 Ahmed (Learner)', email: 'ahmed@acmefinance.com' },
                { label: '👤 Sara (Learner)', email: 'sara@acmefinance.com' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillCredentials(item.email)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px',
                    background: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public Certificate Link & Register */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
          Have a certificate to verify?{' '}
          <Link to="/verify/CA-2026-000001" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Public Verification Portal
          </Link>
        </div>
      </div>
    </div>
  );
}