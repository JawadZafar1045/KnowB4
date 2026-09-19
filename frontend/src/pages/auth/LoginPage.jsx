import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import loginBg from '../../assets/login-bg.jpg';

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
      backgroundImage: `linear-gradient(180deg, rgba(15,28,63,0.55) 0%, rgba(10,15,30,0.7) 100%), url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
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
            background: 'linear-gradient(135deg, #0E7C86 0%, #0B5FA5 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(14, 124, 134, 0.45)',
            marginBottom: '16px'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Cyber<span style={{ color: '#5EEAD4' }}>Aware</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginTop: '6px' }}>
            Multi-Tenant Security Awareness & Training Platform
          </p>
        </div>

        {/* Glass Card (transparent over the background image) */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', textAlign: 'center' }}>
            Sign In to Portal
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(190, 18, 60, 0.2)',
              border: '1px solid rgba(190, 18, 60, 0.4)',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>
                Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#5EEAD4'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#5EEAD4'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
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
                background: 'linear-gradient(135deg, #0E7C86 0%, #0B5FA5 100%)',
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
                boxShadow: '0 4px 18px rgba(14, 124, 134, 0.4)',
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
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
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
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '8px',
                    color: '#5EEAD4',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5EEAD4'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public Certificate Link & Register */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          Have a certificate to verify?{' '}
          <Link to="/verify/CA-2026-000001" style={{ color: '#5EEAD4', textDecoration: 'none', fontWeight: 600 }}>
            Public Verification Portal
          </Link>
        </div>
      </div>
    </div>
  );
}