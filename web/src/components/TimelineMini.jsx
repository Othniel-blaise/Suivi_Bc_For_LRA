function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const ORDER = ['TRANSMIS', 'RECU_BASE', 'EN_LIVRAISON', 'LIVRE'];
const STEP_LABELS = ['Transmis', 'Base', 'Livraison', 'Livré'];
const STEP_COLORS = ['var(--blue)', '#3B82F6', '#7C3AED', '#22C55E'];

export default function TimelineMini({ dateTransmission, dateReceptionBase, dateLivraison, dateReception, statut }) {
  const currentIdx = ORDER.indexOf(statut);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {ORDER.map((_, i) => {
        const done = i <= currentIdx;
        const color = done ? STEP_COLORS[i] : 'var(--border)';
        const dates = [dateTransmission, dateReceptionBase, dateLivraison, dateReception];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 2px' }} />
              <div style={{ fontSize: 8, color: done ? color : 'var(--text5)', fontWeight: 700 }}>
                {STEP_LABELS[i]}
              </div>
              {dates[i] && <div style={{ fontSize: 8, color: 'var(--text4)' }}>{fmt(dates[i])}</div>}
            </div>
            {i < ORDER.length - 1 && (
              <div style={{ width: 16, height: 2, background: i < currentIdx ? STEP_COLORS[i] : 'var(--border)', marginBottom: 12, flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
