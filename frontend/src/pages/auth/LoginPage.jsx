import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import logoImg from '../../assets/logo-transparent.png';
import PublicVerificationWidget from '../../components/common/PublicVerificationWidget';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showTenantField, setShowTenantField] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password, tenantId || undefined);
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

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 6vh, 56px) 16px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img className="auth-brand-logo"
            src={logoImg}
            alt="ThinkB4Act"
            style={{
              width: 'min(260px, 76vw)',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '10px' }}>
            Multi-Tenant Security Awareness & Training Platform
          </p>
        </div>

        {/* Sign-in card */}
        <div className="login-card" style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 6vw, 32px)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '22px', textAlign: 'center' }}>
            Sign In to Portal
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tenant ID Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowTenantField(!showTenantField)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--orange-dark)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0',
                  marginBottom: showTenantField ? '8px' : '0',
                  transition: 'color 0.2s'
                }}
              >
                <Building2 size={14} />
                {showTenantField ? 'Hide' : 'Login with'} Organization Tenant ID
                {showTenantField ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showTenantField && (
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} color="var(--orange-dark)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value.toUpperCase())}
                    placeholder="e.g. TB4-A3K9MN"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--orange-border)',
                      borderRadius: '10px',
                      color: 'var(--navy)',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--orange)';
                      e.target.style.outline = '2px solid var(--orange)';
                      e.target.style.outlineOffset = '1px';
                      e.target.style.boxShadow = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--orange-border)';
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Your organization's unique Tenant ID (provided during registration)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate)', marginBottom: '6px' }}>
                Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--navy)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--orange)';
                    e.target.style.outline = '2px solid var(--orange)';
                    e.target.style.outlineOffset = '1px';
                    e.target.style.boxShadow = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--navy)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--orange)';
                    e.target.style.outline = '2px solid var(--orange)';
                    e.target.style.outlineOffset = '1px';
                    e.target.style.boxShadow = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                background: isButtonHovered ? 'var(--orange-dark)' : 'var(--orange)',
                border: '1px solid var(--orange)',
                borderRadius: '10px',
                color: 'var(--card)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'none',
                transform: isButtonHovered ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In to ThinkB4Act <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Public Verification Portal Widget */}
        <PublicVerificationWidget style={{ marginTop: '16px' }} />

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New organization?{' '}
            <Link to="/register" style={{ color: 'var(--orange-dark)', textDecoration: 'none', fontWeight: 700 }}>
              Register Your Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}