import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ModalBackButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="modal-back-button"
      aria-label="Go back"
      title="Back"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '36px',
        height: '36px',
        minWidth: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 0,
        border: 'none',
        borderRadius: '50%',
        background: 'transparent',
        color: '#18181b',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = '#f4f4f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <ArrowLeft size={18} />
    </button>
  );
}
