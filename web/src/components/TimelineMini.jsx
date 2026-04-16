function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function TimelineMini({ dateTransmission, dateReception, statut }) {
  const isLivre = statut === 'LIVRE';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: 'var(--blue)',
            margin: '0 auto 3px',
          }}
        />
        <div style={{ fontSize: 9, color: 'var(--blue)', fontWeight: 700 }}>Transmis</div>
        <div style={{ fontSize: 9, color: 'var(--text4)' }}>{fmt(dateTransmission)}</div>
      </div>
      <div
        style={{
          width: 30,
          height: 2,
          background: isLivre ? 'var(--blue)' : 'var(--border)',
          marginBottom: 14,
          flexShrink: 0,
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: isLivre ? '#22C55E' : 'var(--border)',
            margin: '0 auto 3px',
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: isLivre ? 'var(--green)' : 'var(--text5)',
            fontWeight: 700,
          }}
        >
          Livré
        </div>
        {dateReception && (
          <div style={{ fontSize: 9, color: 'var(--text4)' }}>{fmt(dateReception)}</div>
        )}
      </div>
    </div>
  );
}
