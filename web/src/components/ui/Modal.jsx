import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 460,
          padding: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {title && (
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
