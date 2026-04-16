export default function Badge({ statut }) {
  const isLivre = statut === 'LIVRE';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: isLivre ? 'var(--green-l)' : 'var(--amber-l)',
        color: isLivre ? 'var(--green-d)' : 'var(--amber-d)',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isLivre ? 'var(--green)' : 'var(--amber)',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {isLivre ? 'Livré' : 'Transmis'}
    </span>
  );
}
