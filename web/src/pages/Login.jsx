import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
import { login } from '../api/bons-commande.js';

export default function LoginPage() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form);
      setAuth(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1.5px solid var(--border)',
    borderRadius: 9,
    padding: '10px 13px',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          padding: '36px 30px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'var(--navy)',
              borderRadius: 16,
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            📦
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            Suivi Bons de Commande
          </div>
          <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 4 }}>
            Espace Patron — Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                marginBottom: 5,
              }}
            >
              Identifiant
            </label>
            <input
              style={inputStyle}
              placeholder="patron"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              disabled={loading}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                marginBottom: 5,
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              style={inputStyle}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'var(--red-l)',
                color: 'var(--red)',
                fontSize: 12,
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--text5)' : 'var(--navy)',
              color: 'white',
              border: 'none',
              padding: '13px',
              borderRadius: 11,
              fontSize: 14,
              fontWeight: 700,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
            padding: '9px 12px',
            background: 'var(--bg)',
            borderRadius: 8,
            fontSize: 11,
            color: 'var(--text4)',
          }}
        >
          Connexion patron :{' '}
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text3)' }}>
            patron / admin123
          </span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
