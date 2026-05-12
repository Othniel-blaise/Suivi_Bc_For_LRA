const STATUT_CONFIG = {
  TRANSMIS:     { bg: 'var(--amber-l)',  color: 'var(--amber-d)',  dot: 'var(--amber)',  label: 'Transmis' },
  RECU_BASE:    { bg: '#DBEAFE',         color: '#1D4ED8',         dot: '#3B82F6',       label: 'Reçu base' },
  EN_LIVRAISON: { bg: '#EDE9FE',         color: '#6D28D9',         dot: '#7C3AED',       label: 'En livraison' },
  LIVRE:        { bg: 'var(--green-l)',  color: 'var(--green-d)',  dot: 'var(--green)',  label: 'Livré' },
};

export default function Badge({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.TRANSMIS;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cfg.dot, display: 'inline-block', flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
