import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SetPasswordModal({ onComplete }) {
  const { user, setUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/change-password', { newPassword });
      if (res.data.success) {
        // Update user state in localStorage & AuthContext
        const updatedUser = { ...user, requiresPasswordReset: false };
        localStorage.setItem('cyberaware_user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        if (onComplete) onComplete();
      } else {
        setError(res.data.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '16px',
        background: '#ffffff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(37,99,235,0.25)',
            marginBottom: '14px'
          }}>
            <Key size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Set Your Permanent Password
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
            Welcome! Because this is your first login with a temporary password, please establish a secure new password for your account.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '18px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Enter at least 6 characters..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Re-enter your new password..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
            }}
          >
            {loading ? 'Updating Password...' : 'Save Password & Continue'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
