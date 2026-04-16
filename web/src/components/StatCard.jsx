export default function StatCard({ label, value, color = 'default' }) {
  const styles = {
    default: {
      bg: 'var(--surface)',
      border: 'var(--border)',
      labelColor: 'var(--text4)',
      valueColor: 'var(--text)',
    },
    amber: {
      bg: 'var(--amber-l)',
      border: '#FDE68A',
      labelColor: 'var(--amber-d)',
      valueColor: 'var(--amber-d)',
    },
    green: {
      bg: 'var(--green-l)',
      border: '#BBF7D0',
      labelColor: 'var(--green-d)',
      valueColor: 'var(--green-d)',
    },
  };

  const s = styles[color] || styles.default;

  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius)',
        padding: '18px 20px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: s.labelColor,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: s.valueColor,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
