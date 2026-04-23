import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useStatsParLieu } from '../hooks/useStatsParLieu.js';

function couleurBarre(taux) {
  if (taux >= 70) return '#16A34A';
  if (taux >= 40) return '#F59E0B';
  return '#EF4444';
}

function StatCard({ label, value, color }) {
  const colors = {
    green: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    amber: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    default: { bg: 'var(--surface)', text: 'var(--text)', border: 'var(--border)' },
  };
  const c = colors[color] || colors.default;
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '18px 22px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, fontWeight: 900, color: c.text }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name === 'livres' ? '✓ Livrés' : '⏳ En attente'} : <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Statistiques() {
  const { data, isLoading, error } = useStatsParLieu();
  const parLieu = data?.parLieu ?? [];

  const totalGlobal = parLieu.reduce((s, g) => s + g.total, 0);
  const livresGlobal = parLieu.reduce((s, g) => s + g.livres, 0);
  const enAttenteGlobal = parLieu.reduce((s, g) => s + g.enAttente, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div style={{
        background: 'var(--navy)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--navy2)',
              color: '#94a3b8',
              border: '1px solid #334155',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
            }}>
              ← Retour
            </button>
          </Link>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>
              📍 Livraisons par Lieu
            </div>
            <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
              Statistiques de livraison
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text4)', fontSize: 13 }}>
            Chargement...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)', fontSize: 13 }}>
            Erreur : {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Cartes résumé */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
              <StatCard label="Total BC" value={totalGlobal} />
              <StatCard label="Livrés ✓" value={livresGlobal} color="green" />
              <StatCard label="En attente ⏳" value={enAttenteGlobal} color="amber" />
            </div>

            {/* Tableau */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 28,
            }}>
              <div style={{
                padding: '13px 20px',
                borderBottom: '1px solid var(--border2)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text2)',
              }}>
                Détail par lieu
              </div>

              {parLieu.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
                  Aucune donnée. Créez des BC avec un lieu renseigné.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Lieu', 'Livrés', 'En attente', 'Total', 'Taux'].map((h) => (
                        <th key={h} style={{
                          padding: '10px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text4)',
                          textAlign: h === 'Lieu' ? 'left' : 'center',
                          borderBottom: '1px solid var(--border2)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parLieu.map((g) => {
                      const couleur = couleurBarre(g.tauxLivraison);
                      return (
                        <tr key={g.lieu} style={{ borderBottom: '1px solid var(--border2)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{g.lieu}</div>
                            <div style={{
                              height: 6,
                              background: 'var(--border2)',
                              borderRadius: 99,
                              overflow: 'hidden',
                              width: '100%',
                              maxWidth: 240,
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${g.tauxLivraison}%`,
                                background: couleur,
                                borderRadius: 99,
                                transition: 'width 0.4s ease',
                              }} />
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#16A34A' }}>
                            {g.livres}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#D97706' }}>
                            {g.enAttente}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                            {g.total}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              background: couleur + '22',
                              color: couleur,
                              fontWeight: 700,
                              fontSize: 12,
                              padding: '3px 10px',
                              borderRadius: 99,
                            }}>
                              {g.tauxLivraison}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Graphique */}
            {parLieu.length > 0 && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '20px 24px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 20 }}>
                  Graphique — Livrés vs En attente par lieu
                </div>
                <ResponsiveContainer width="100%" height={parLieu.length * 60 + 60}>
                  <BarChart
                    layout="vertical"
                    data={parLieu}
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="lieu" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip content={<TooltipCustom />} />
                    <Legend
                      formatter={(v) => v === 'livres' ? 'Livrés' : 'En attente'}
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    />
                    <Bar dataKey="livres" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="enAttente" stackId="a" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
