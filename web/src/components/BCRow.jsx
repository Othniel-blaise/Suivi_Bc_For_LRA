import Badge from './ui/Badge.jsx';

const ORDER = ['TRANSMIS', 'RECU_BASE', 'EN_LIVRAISON', 'LIVRE'];
const STEP_COLORS = ['#94A3B8', '#3B82F6', '#7C3AED', '#22C55E'];

function Parcours({ bc }) {
  const currentIdx = ORDER.indexOf(bc.statut);

  const steps = [
    { icon: '📤', label: 'Transmis',   sub: null },
    { icon: '🏠', label: 'Base',       sub: bc.lieuBase || null },
    { icon: '🚚', label: 'Transfert',  sub: bc.agentLivreur || null },
    { icon: '📍', label: 'Chantier',   sub: bc.lieuReception || bc.lieuDestination || null },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const color = done ? STEP_COLORS[i] : '#334155';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 10,
                fontWeight: isCurrent ? 800 : 600,
                color,
                opacity: done ? 1 : 0.35,
                whiteSpace: 'nowrap',
              }}>
                {step.icon} {step.label}
                {step.sub && (
                  <span style={{ fontWeight: 700, marginLeft: 2 }}>({step.sub})</span>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <span style={{
                fontSize: 10, color: i < currentIdx ? STEP_COLORS[i] : '#334155',
                opacity: i < currentIdx ? 1 : 0.3, fontWeight: 700,
              }}>/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}


export default function BCRow({ bc, index, total, onDelete }) {
  const isLast = index === total - 1;

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

        {/* Parcours */}
        <Parcours bc={bc} />

        {/* Bouton supprimer */}
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
