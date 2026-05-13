import { useState } from 'react';
import { useReceptionnerBase, useMettreEnLivraison, useLivraisonFinale } from '../hooks/useBonsCommande.js';

const CONFIG = {
  TRANSMIS: {
    titre: '🏠 Réception à la base',
    bouton: 'Confirmer la réception base',
    couleur: '#3B82F6',
    champs: ['lieuBase', 'typeReception', 'observations'],
  },
  RECU_BASE: {
    titre: '🚚 Mise en livraison',
    bouton: 'Confirmer le départ',
    couleur: '#7C3AED',
    champs: ['agentLivreur', 'lieuDestination'],
  },
  EN_LIVRAISON: {
    titre: '✅ Confirmer la livraison',
    bouton: 'Marquer comme livré',
    couleur: '#16A34A',
    champs: ['lieuReception', 'typeReception', 'observations'],
  },
};

export default function ModalWorkflow({ bc, onClose }) {
  const cfg = CONFIG[bc?.statut];
  const [form, setForm] = useState({ typeReception: 'TOTAL' });

  const receptionBase  = useReceptionnerBase(onClose);
  const enLivraison    = useMettreEnLivraison(onClose);
  const livraisonFin   = useLivraisonFinale(onClose);

  if (!bc || !cfg) return null;

  const mutation = bc.statut === 'TRANSMIS'     ? receptionBase
                 : bc.statut === 'RECU_BASE'    ? enLivraison
                 : livraisonFin;

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ id: bc.id, ...form });
  }

  const has = (k) => cfg.champs.includes(k);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 28,
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{cfg.titre}</div>
          <div style={{ fontSize: 12, color: 'var(--text4)' }}>
            BC <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{bc.numero}</span>
            {' — '}{bc.fournisseur}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Lieu base */}
          {has('lieuBase') && (
            <div>
              <label style={labelStyle}>Lieu de réception (base) *</label>
              <input
                required
                value={form.lieuBase || ''}
                onChange={(e) => set('lieuBase', e.target.value)}
                placeholder="Ex : Entrepôt principal Abidjan"
                style={inputStyle}
              />
            </div>
          )}

          {/* Agent livreur */}
          {has('agentLivreur') && (
            <div>
              <label style={labelStyle}>Agent livreur *</label>
              <input
                required
                value={form.agentLivreur || ''}
                onChange={(e) => set('agentLivreur', e.target.value)}
                placeholder="Nom de l'agent"
                style={inputStyle}
              />
            </div>
          )}

          {/* Lieu destination */}
          {has('lieuDestination') && (
            <div>
              <label style={labelStyle}>Lieu de destination *</label>
              <input
                required
                value={form.lieuDestination || ''}
                onChange={(e) => set('lieuDestination', e.target.value)}
                placeholder="Ex : Chantier Yamoussoukro"
                style={inputStyle}
              />
            </div>
          )}

          {/* Lieu réception finale */}
          {has('lieuReception') && (
            <div>
              <label style={labelStyle}>Lieu de réception (destination) *</label>
              <input
                required
                value={form.lieuReception || ''}
                onChange={(e) => set('lieuReception', e.target.value)}
                placeholder="Ex : Chantier Yamoussoukro"
                style={inputStyle}
              />
            </div>
          )}

          {/* Type réception */}
          {has('typeReception') && (
            <div>
              <label style={labelStyle}>Type de réception *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['TOTAL', 'PARTIEL'].map((v) => (
                  <button
                    key={v} type="button"
                    onClick={() => set('typeReception', v)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: form.typeReception === v ? cfg.couleur : 'var(--navy2)',
                      color: form.typeReception === v ? 'white' : 'var(--text4)',
                      border: form.typeReception === v ? 'none' : '1px solid #334155',
                    }}
                  >
                    {v === 'TOTAL' ? '✅ Totale' : '⚠️ Partielle'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          {has('observations') && (
            <div>
              <label style={labelStyle}>Observations <span style={{ color: 'var(--text4)' }}>(optionnel)</span></label>
              <textarea
                value={form.observations || ''}
                onChange={(e) => set('observations', e.target.value)}
                placeholder="Anomalies, manques, remarques..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, border: '1.5px solid var(--border)', background: 'none',
              color: 'var(--text3)', padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Annuler</button>
            <button type="submit" disabled={mutation.isPending} style={{
              flex: 2, background: cfg.couleur, color: 'white', border: 'none',
              padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              opacity: mutation.isPending ? 0.7 : 1,
            }}>
              {mutation.isPending ? 'Enregistrement...' : cfg.bouton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 5 };
const inputStyle = {
  width: '100%', background: 'var(--navy2)', border: '1.5px solid #334155',
  borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
};
