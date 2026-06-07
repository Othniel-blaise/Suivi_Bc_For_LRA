import Badge from './ui/Badge.jsx';

const ORDER = ['TRANSMIS', 'RECU_BASE', 'EN_LIVRAISON', 'LIVRE'];
const STEP_COLORS = ['#94A3B8', '#3B82F6', '#7C3AED', '#22C55E'];

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function Parcours({ bc }) {
  const currentIdx = ORDER.indexOf(bc.statut);
  const hasPartialBase = bc.typeReceptionBase === 'PARTIEL' && !!bc.dateReceptionBase;

  const steps = [
    { icon: '📤', label: 'Transmis',      sub: null },
    { icon: '🏠', label: 'Base (PK29)',   sub: hasPartialBase ? null : bc.lieuBase || null },
    { icon: '🚚', label: 'Transfert',     sub: bc.agentLivreur || null },
    { icon: '📍', label: 'Reçu Chantier', sub: bc.lieuReception || bc.lieuDestination || null },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const isPartialBase = i === 1 && hasPartialBase;
        const color = isPartialBase ? '#D97706' : done ? STEP_COLORS[i] : '#334155';

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ textAlign: 'center' }}>
              {/* Label + badge PARTIEL */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10,
                fontWeight: isCurrent || isPartialBase ? 800 : 600,
                color,
                opacity: done || isPartialBase ? 1 : 0.35,
                whiteSpace: 'nowrap',
              }}>
                <span>{step.icon} {step.label}</span>
                {isPartialBase && (
                  <span style={{
                    fontSize: 9, background: '#FEF3C7', color: '#B45309',
                    borderRadius: 4, padding: '1px 5px', fontWeight: 800,
                    border: '1px solid #FDE68A',
                  }}>
                    PARTIEL
                  </span>
                )}
                {step.sub && (
                  <span style={{ fontWeight: 700, opacity: 0.75 }}>({step.sub})</span>
                )}
              </div>
              {/* Horodatage sous le label */}
              {isPartialBase && (
                <div style={{ fontSize: 8, color: '#D97706', fontWeight: 700, marginTop: 2, letterSpacing: 0.2 }}>
                  {fmtDate(bc.dateReceptionBase)}
                </div>
              )}
            </div>

            {i < steps.length - 1 && (
              <span style={{
                fontSize: 10, color: i < currentIdx ? STEP_COLORS[i] : '#334155',
                opacity: i < currentIdx ? 1 : 0.25, fontWeight: 700,
              }}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}


export default function BCRow({ bc, index, total, onDelete }) {
  const isLast = index === total - 1;
  const hasPartialBase = bc.typeReceptionBase === 'PARTIEL' && !!bc.dateReceptionBase;

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: isLast ? 'none' : '1px solid var(--border2)',
    }}>
      {/* Ligne principale */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        {/* Infos BC */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              {bc.numero}
            </span>
            <Badge statut={bc.statut} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 2 }}>
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
            background: 'none', border: 'none', color: 'var(--text4)',
            fontSize: 14, padding: '2px 4px', borderRadius: 4,
            flexShrink: 0, lineHeight: 1, transition: 'color 0.15s', cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text4)')}
        >
          ✕
        </button>
      </div>

      {/* ── Banderole réception base partielle ── */}
      {hasPartialBase && (
        <div style={{
          marginTop: 10,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #FDE68A',
        }}>
          {/* En-tête */}
          <div style={{
            background: '#F59E0B',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 12 }}>⚠️</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>
              Réception base partielle
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: 'rgba(0,0,0,0.15)', borderRadius: 4, padding: '1px 7px',
            }}>
              {fmtDate(bc.dateReceptionBase)}
            </span>
          </div>

          {/* Corps */}
          <div style={{
            background: '#FFFBEB',
            padding: '8px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            {bc.lieuBase && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: '#92400E' }}>📍</span>
                <div>
                  <div style={{ fontSize: 9, color: '#B45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Lieu</div>
                  <div style={{ fontSize: 11, color: '#78350F', fontWeight: 600 }}>{bc.lieuBase}</div>
                </div>
              </div>
            )}
            {bc.observationsBase && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: '#92400E' }}>💬</span>
                <div>
                  <div style={{ fontSize: 9, color: '#B45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Observations</div>
                  <div style={{ fontSize: 11, color: '#78350F' }}>{bc.observationsBase}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Note de réception finale ── */}
      {bc.statut === 'LIVRE' && bc.articlesRecus && (
        <div style={{
          marginTop: 10,
          background: 'var(--bg)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--text3)',
          borderLeft: '3px solid var(--green)',
        }}>
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
