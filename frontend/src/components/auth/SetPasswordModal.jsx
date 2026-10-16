import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ModalBackButton from '../common/ModalBackButton';
import ModalPortal from '../common/ModalPortal';

export default function SetPasswordModal({ onComplete }) {
  const { user, setUser } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
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

  if (!isVisible) return null;

  return (
    <ModalPortal>
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="surface-card" style={{
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '12px',
        background: 'var(--card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <ModalBackButton onClick={() => setIsVisible(false)} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--icon-tile)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Key size={28} color="var(--card)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
            Set Your Permanent Password
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
            Welcome! Because this is your first login with a temporary password, please establish a secure new password for your account.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
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
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--slate)', fontWeight: 600 }}>New Password</label>
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
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--slate)', fontWeight: 600 }}>Confirm New Password</label>
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
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
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
              background: 'var(--orange)'
            }}
          >
            {loading ? 'Updating Password...' : 'Save Password & Continue'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
