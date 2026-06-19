import { useState, useRef, useEffect } from 'react';
import Modal from './ui/Modal.jsx';
import { useCreateBC } from '../hooks/useBonsCommande.js';
import { IMPUTATIONS } from '../constants/imputations.js';

const inputStyle = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: 9,
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
  background: 'white',
};

function ImputationSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filtered = IMPUTATIONS.filter((imp) =>
    imp.toLowerCase().includes(search.toLowerCase())
  );

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function select(imp) {
    onChange(imp);
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Champ affiché */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          ...inputStyle,
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: value ? 'var(--text)' : 'var(--text4)',
          borderColor: open ? 'var(--blue)' : 'var(--border)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {value || 'Sélectionner une imputation'}
        </span>
        <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text4)', flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1.5px solid var(--blue)',
            borderRadius: 9,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Champ de recherche */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border2)' }}>
            <input
              autoFocus
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                padding: '7px 10px',
                fontSize: 12,
                borderColor: 'var(--border)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text4)', textAlign: 'center' }}>
                Aucun résultat
              </div>
            ) : (
              filtered.map((imp) => (
                <button
                  key={imp}
                  type="button"
                  onMouseDown={() => select(imp)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 14px',
                    fontSize: 12,
                    background: imp === value ? 'var(--blue-l)' : 'none',
                    color: imp === value ? 'var(--blue-d)' : 'var(--text)',
                    fontWeight: imp === value ? 700 : 400,
                    border: 'none',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border2)',
                  }}
                  onMouseEnter={(e) => {
                    if (imp !== value) e.currentTarget.style.background = 'var(--bg)';
                  }}
                  onMouseLeave={(e) => {
                    if (imp !== value) e.currentTarget.style.background = 'none';
                  }}
                >
                  {imp}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModalNouveauBC({ open, onClose }) {
  const [form, setForm] = useState({ numero: '', fournisseur: '', imputation: '', numeroDA: '' });
  const [numeroError, setNumeroError] = useState('');

  const createBC = useCreateBC(() => {
    setForm({ numero: '', fournisseur: '', imputation: '', numeroDA: '' });
    setNumeroError('');
    onClose();
  }, (err) => {
    if (err.response?.status === 409) {
      setNumeroError(`Ce numéro de BC existe déjà dans le système`);
    }
  });

  const today = new Date().toLocaleDateString('fr-FR');
  const canSubmit = form.numero.trim() && form.fournisseur.trim() && form.imputation && !numeroError;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || createBC.isPending) return;
    createBC.mutate({
      numero:      form.numero.trim(),
      fournisseur: form.fournisseur.trim(),
      imputation:  form.imputation,
      numeroDA:    form.numeroDA.trim() || undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau Bon de Commande">
      <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 20 }}>
        Le statut initial sera automatiquement "Transmis au fournisseur"
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>
            N° du BC *
          </label>
          <input
            style={{
              ...inputStyle,
              fontFamily: 'var(--mono)',
              borderColor: numeroError ? 'var(--red)' : 'var(--border)',
            }}
            placeholder="SO/BC-26-00064"
            value={form.numero}
            onChange={(e) => {
              setNumeroError('');
              setForm((f) => ({ ...f, numero: e.target.value }));
            }}
            onFocus={(e) => {
              if (!numeroError) e.target.style.borderColor = 'var(--blue)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = numeroError ? 'var(--red)' : 'var(--border)';
            }}
            disabled={createBC.isPending}
          />
          {numeroError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 5,
              padding: '7px 10px',
              background: 'var(--red-l)',
              borderRadius: 7,
              fontSize: 11,
              color: 'var(--red)',
              fontWeight: 600,
            }}>
              <span>⚠</span>
              {numeroError} — un N°BC ne peut être créé qu'une seule fois.
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>
            Fournisseur *
          </label>
          <input
            style={inputStyle}
            placeholder="Nom du fournisseur"
            value={form.fournisseur}
            onChange={(e) => setForm((f) => ({ ...f, fournisseur: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            disabled={createBC.isPending}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>
            Imputation *
          </label>
          <ImputationSelect
            value={form.imputation}
            onChange={(val) => setForm((f) => ({ ...f, imputation: val }))}
            disabled={createBC.isPending}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>
            N° DA <span style={{ fontWeight: 400, color: 'var(--text4)' }}>(optionnel)</span>
          </label>
          <input
            style={inputStyle}
            placeholder="DA-2026-00123"
            value={form.numeroDA}
            onChange={(e) => setForm((f) => ({ ...f, numeroDA: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            disabled={createBC.isPending}
          />
        </div>

        <div
          style={{
            background: 'var(--amber-l)',
            border: '1px solid #FDE68A',
            borderRadius: 9,
            padding: '10px 13px',
            fontSize: 12,
            color: 'var(--amber-d)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          📋 Statut initial : <strong>Transmis au fournisseur</strong> — daté du {today}
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={createBC.isPending}
            style={{
              flex: 1,
              border: '1.5px solid var(--border)',
              background: 'none',
              color: 'var(--text3)',
              padding: 11,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canSubmit || createBC.isPending}
            style={{
              flex: 2,
              background: canSubmit && !createBC.isPending ? 'var(--navy)' : 'var(--text5)',
              color: 'white',
              border: 'none',
              padding: 11,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: canSubmit && !createBC.isPending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {createBC.isPending ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Enregistrement...
              </>
            ) : (
              'Enregistrer le BC'
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}
