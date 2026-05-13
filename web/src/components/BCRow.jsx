import { useState } from 'react';
import Badge from './ui/Badge.jsx';
import TimelineMini from './TimelineMini.jsx';
import ModalWorkflow from './ModalWorkflow.jsx';

const ACTION = {
  TRANSMIS:     { label: '🏠 Réceptionner à la base', color: '#3B82F6' },
  RECU_BASE:    { label: '🚚 Mettre en livraison',    color: '#7C3AED' },
  EN_LIVRAISON: { label: '✅ Confirmer livraison',    color: '#16A34A' },
};

export default function BCRow({ bc, index, total, onDelete }) {
  const isLast = index === total - 1;
  const [showWorkflow, setShowWorkflow] = useState(false);
  const action = ACTION[bc.statut];

  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--border2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {/* Infos principales */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {bc.numero}
            </span>
            <Badge statut={bc.statut} />
          </div>
          <div
            style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 2 }}
          >
            {bc.fournisseur}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text4)' }}>
            {bc.imputation}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flexShrink: 0 }}>
          <TimelineMini
            dateTransmission={bc.dateTransmission}
            dateReceptionBase={bc.dateReceptionBase}
            dateLivraison={bc.dateLivraison}
            dateReception={bc.dateReception}
            statut={bc.statut}
          />
        </div>

        {/* Bouton action workflow */}
        {action && (
          <button
            onClick={() => setShowWorkflow(true)}
            style={{
              background: action.color, color: 'white', border: 'none',
              padding: '6px 12px', borderRadius: 8, fontSize: 11,
              fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {action.label}
          </button>
        )}

        {/* Supprimer */}
        <button
          onClick={() => onDelete(bc)}
          title="Supprimer ce BC"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text4)',
            fontSize: 14,
            padding: '2px 4px',
            borderRadius: 4,
            flexShrink: 0,
            lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text4)')}
        >
          ✕
        </button>
      </div>

      {showWorkflow && (
        <ModalWorkflow bc={bc} onClose={() => setShowWorkflow(false)} />
      )}

      {/* Note de réception */}
      {bc.statut === 'LIVRE' && bc.articlesRecus && (
        <div
          style={{
            marginTop: 10,
            background: 'var(--bg)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 11,
            color: 'var(--text3)',
            borderLeft: '3px solid var(--green)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--text2)' }}>Réception : </span>
          {bc.articlesRecus}
          {bc.lieuReception && (
            <span style={{ color: 'var(--blue)', marginLeft: 6, fontWeight: 600 }}>
              📍 {bc.lieuReception}
            </span>
          )}
          {bc.receptionniste && (
            <span style={{ color: 'var(--text4)', marginLeft: 6 }}>
              → {bc.receptionniste.nom}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
