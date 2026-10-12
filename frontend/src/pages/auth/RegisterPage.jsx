import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Building2, User, Mail, Lock, Key, Phone, Briefcase, ArrowRight, AlertCircle, CheckCircle2, Shield, Copy, Check } from 'lucide-react';
import logoImg from '../../assets/logo-transparent.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    industry: 'Technology',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // holds { tenantId, companyName }
  const [copied, setCopied] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const industries = [
    'Technology', 'Finance & Banking', 'Healthcare', 'Education',
    'Government', 'Retail', 'Manufacturing', 'Legal',
    'Energy & Utilities', 'Telecommunications', 'Other'
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.companyName || !form.adminName || !form.email || !form.password || !form.secretKey) {
      setError('All required fields must be filled');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register-company', {
        companyName: form.companyName,
        adminName: form.adminName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        industry: form.industry,
        secretKey: form.secretKey
      });

      if (res.data.success) {
        setSuccess({
          tenantId: res.data.tenantId,
          companyName: res.data.company.name,
          message: res.data.message
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyTenantId = () => {
    navigator.clipboard.writeText(success.tenantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 38px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--slate)',
    marginBottom: '6px'
  };

  // Success Screen
  if (success) {
    return (
      <div className="auth-register-page" style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div className="auth-register-card" style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={36} color="var(--success-text)" />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
              Registration Successful!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {success.message}
            </p>

            <div style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Your Tenant ID
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
              }}>
                <span style={{
                  fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy)',
                  letterSpacing: '0.1em', fontFamily: 'monospace'
                }}>
                  {success.tenantId}
                </span>
                <button
                  onClick={copyTenantId}
                  style={{
                    background: copied ? 'var(--success-bg)' : 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: 'var(--navy)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.75rem', fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                Save this ID! Your employees will use it to login to your organization's portal.
              </p>
            </div>

            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-bg)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              textAlign: 'left'
            }}>
              <Shield size={18} color="var(--warning-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--warning-text)', lineHeight: 1.5, margin: 0 }}>
                <strong>Pending Activation:</strong> A platform administrator will review and activate your organization. You'll be able to login once activated.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--orange)',
                border: '1px solid var(--orange)',
                borderRadius: '10px',
                color: 'var(--card)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              Go to Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-register-page" style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img className="auth-brand-logo" src={logoImg} alt="ThinkB4Act" style={{ width: 'min(220px, 72vw)', height: 'auto', objectFit: 'contain', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Register Your Organization
          </p>
        </div>

        {/* Registration Card */}
        <div className="auth-register-card" style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '16px', textAlign: 'center' }}>
            Organization Registration
          </h2>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)', fontSize: '0.82rem', marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Secret Key */}
            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-bg)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <label style={{ ...labelStyle, color: 'var(--warning-text)' }}>
                Platform Registration Key *
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--warning-text)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  value={form.secretKey}
                  onChange={(e) => handleChange('secretKey', e.target.value)}
                  placeholder="Enter secret registration key"
                  required
                  style={{ ...inputStyle, borderColor: 'var(--warning-text)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--warning-text)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--warning-text)'}
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Contact the platform administrator to obtain this key
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label style={labelStyle}>Organization Name *</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                  required
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Two Column: Industry + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Industry</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <select
                    value={form.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '12px' }}
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind} style={{ background: 'var(--card)', color: 'var(--text)' }}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

            {/* Admin Name */}
            <div>
              <label style={labelStyle}>Administrator Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={form.adminName}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  placeholder="John Doe"
                  required
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label style={labelStyle}>Administrator Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="admin@company.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Passwords Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
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
                marginTop: '4px',
                background: isButtonHovered ? 'var(--orange-dark)' : 'var(--orange)',
                border: '1px solid var(--orange)',
                borderRadius: '10px',
                color: 'var(--card)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: 'none',
                transform: isButtonHovered ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Registering Organization...' : (
                <>
                  Register Organization <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--navy)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
