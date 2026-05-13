import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuthStore } from '../store/auth.js';
import { useBonsCommande, useDeleteBC } from '../hooks/useBonsCommande.js';
import StatCard from '../components/StatCard.jsx';
import BCRow from '../components/BCRow.jsx';
import ModalNouveauBC from '../components/ModalNouveauBC.jsx';
import ModalImportBC from '../components/ModalImportBC.jsx';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { data: bcs = [], isLoading, error } = useBonsCommande();
  const deleteBC = useDeleteBC();
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 🔍 États filtres
  const [search, setSearch] = useState('');
  const [searchLieu, setSearchLieu] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const hasFilters = search || searchLieu || filtreStatut;

  // 🔍 Filtrage — source unique de vérité
  const filtered = useMemo(() => {
    return bcs.filter((bc) => {
      const q = search.trim().toLowerCase();
      const qLieu = searchLieu.trim().toLowerCase();
      const matchSearch = !q || [bc.numero, bc.fournisseur, bc.imputation]
        .filter(Boolean).some((f) => f.toLowerCase().includes(q));
      const matchLieu = !qLieu || (bc.lieuReception || '').toLowerCase().includes(qLieu);
      const matchStatut = !filtreStatut || bc.statut === filtreStatut;
      return matchSearch && matchLieu && matchStatut;
    });
  }, [bcs, search, searchLieu, filtreStatut]);

  // 📊 Stats dérivées de filtered (réactives aux filtres)
  const total = filtered.length;
  const enCours = filtered.filter((b) => b.statut !== 'LIVRE').length;
  const livres = filtered.filter((b) => b.statut === 'LIVRE').length;

  function resetFiltres() {
    setSearch('');
    setSearchLieu('');
    setFiltreStatut('');
  }

  const STATUT_LABELS = {
    TRANSMIS: 'Transmis',
    RECU_BASE: 'Reçu base',
    EN_LIVRAISON: 'En livraison',
    LIVRE: 'Livré',
  };

  function exportExcel() {
    const rows = filtered.map((bc) => ({
      'N° BC': bc.numero,
      'N° DA': bc.numeroDA || '',
      'Fournisseur': bc.fournisseur,
      'Imputation': bc.imputation || '',
      'Statut': STATUT_LABELS[bc.statut] || bc.statut,
      'Lieu réception base': bc.lieuBase || '',
      'Agent livreur': bc.agentLivreur || '',
      'Lieu destination': bc.lieuDestination || '',
      'Lieu réception finale': bc.lieuReception || '',
      'Date création': bc.createdAt ? new Date(bc.createdAt).toLocaleDateString('fr-FR') : '',
      'Date réception base': bc.dateReceptionBase ? new Date(bc.dateReceptionBase).toLocaleDateString('fr-FR') : '',
      'Date livraison': bc.dateLivraison ? new Date(bc.dateLivraison).toLocaleDateString('fr-FR') : '',
      'Date réception finale': bc.dateReception ? new Date(bc.dateReception).toLocaleDateString('fr-FR') : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bons de commande');
    const suffix = hasFilters ? '_filtres' : '';
    XLSX.writeFile(wb, `bons_commande${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function handleDelete(bc) { setDeleteConfirm(bc); }
  function confirmDelete() {
    if (!deleteConfirm) return;
    deleteBC.mutate(deleteConfirm.id);
    setDeleteConfirm(null);
  }

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
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
            Suivi Bons de Commande
          </div>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
            Bonjour, {user?.nom} · Dashboard
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          {user?.role === 'PATRON' && (
            <Link to="/stats" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--navy2)', color: '#94a3b8',
                border: '1px solid #334155', padding: '8px 14px',
                borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>📍 Stats par lieu</button>
            </Link>
          )}
          {user?.role === 'PATRON' && (
            <button onClick={() => setShowImport(true)} style={{
              background: 'var(--navy2)', color: '#94a3b8',
              border: '1px solid #334155', padding: '8px 14px',
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>📥 Importer Excel</button>
          )}
          <button onClick={exportExcel} style={{
            background: 'var(--navy2)', color: '#4ade80',
            border: '1px solid #334155', padding: '8px 14px',
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>📤 Exporter Excel</button>
          <button onClick={() => setShowModal(true)} style={{
            background: 'var(--amber)', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          }}>+ Nouveau BC</button>
          <button onClick={logout} style={{
            background: 'var(--navy2)', color: '#94a3b8',
            border: '1px solid #334155', padding: '8px 12px',
            borderRadius: 8, fontSize: 11,
          }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stats — réactives aux filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label={hasFilters ? 'Résultats' : 'Total BC'} value={total} />
          <StatCard label="En cours" value={enCours} color="amber" />
          <StatCard label="Livrés" value={livres} color="green" />
        </div>

        {/* 🔍 Filtres */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '18px 20px',
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>

          {/* Ligne 1 — 2 barres de recherche */}
          <div style={{ display: 'flex', gap: 12 }}>

            {/* Barre BC / Fournisseur */}
            <div style={{
              flex: 2,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--navy2)',
              border: '1.5px solid #334155',
              borderRadius: 10, padding: '12px 16px',
              transition: 'border-color 0.15s',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un BC, fournisseur, imputation..."
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#e2e8f0', fontSize: 13, width: '100%',
                  letterSpacing: '0.1px',
                }}
              />
              {search && (
                <span onClick={() => setSearch('')} style={{
                  cursor: 'pointer', color: '#475569', fontSize: 15,
                  flexShrink: 0, padding: '0 2px',
                }}>✕</span>
              )}
            </div>

            {/* Barre Lieu */}
           
          </div>

          {/* Ligne 2 — Boutons statut + compteur */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 700, letterSpacing: '0.5px', marginRight: 4 }}>
              STATUT :
            </span>

            {[
              { label: 'Tous',           value: '' },
              { label: '📤 Transmis',    value: 'TRANSMIS' },
              { label: '🏠 Reçu base',   value: 'RECU_BASE' },
              { label: '🚚 En livraison', value: 'EN_LIVRAISON' },
              { label: '✅ Livré',        value: 'LIVRE' },
            ].map((opt) => {
              const isActive = filtreStatut === opt.value;
              const bgActive = opt.value === 'LIVRE' ? '#22c55e'
                : opt.value === 'RECU_BASE' ? '#3B82F6'
                : opt.value === 'EN_LIVRAISON' ? '#7C3AED'
                : opt.value === 'TRANSMIS' ? 'var(--amber)'
                : '#f1f5f9';
              return (
                <button
                  key={opt.value}
                  onClick={() => setFiltreStatut(opt.value)}
                  style={{
                    padding: '7px 18px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: isActive ? 'none' : '1px solid #334155',
                    background: isActive ? bgActive : 'var(--navy2)',
                    color: isActive
                      ? opt.value === '' ? '#0F172A' : 'white'
                      : 'var(--text4)',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}

            {/* Bouton réinitialiser uniquement */}
            {hasFilters && (
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={resetFiltres} style={{
                  background: 'none', border: '1px solid #334155',
                  color: '#64748b', padding: '6px 12px',
                  borderRadius: 8, fontSize: 11, cursor: 'pointer',
                }}>✕ Réinitialiser</button>
              </div>
            )}
          </div>
        </div>

        {/* Tableau */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '13px 20px',
            borderBottom: '1px solid var(--border2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
              {hasFilters ? 'Résultats filtrés' : 'Tous les bons de commande'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>
              {total} entrée{total > 1 ? 's' : ''}
              {hasFilters && ` sur ${bcs.length}`}
            </span>
          </div>

          {isLoading && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
              Chargement...
            </div>
          )}
          {error && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--red)', fontSize: 13 }}>
              Erreur : {error.message}
            </div>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
              {hasFilters ? (
                <>
                  Aucun résultat pour ces filtres.{' '}
                  <span onClick={resetFiltres}
                    style={{ color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}>
                    Réinitialiser
                  </span>
                </>
              ) : 'Aucun bon de commande.'}
            </div>
          )}

          {filtered.map((bc, i) => (
            <BCRow key={bc.id} bc={bc} index={i} total={filtered.length} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      <ModalNouveauBC open={showModal} onClose={() => setShowModal(false)} />
      <ModalImportBC open={showImport} onClose={() => setShowImport(false)} />

      {/* Modal suppression */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 26,
            maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Supprimer ce BC ?</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.5 }}>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{deleteConfirm.numero}</span>{' '}
              — {deleteConfirm.fournisseur}<br />Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, border: '1.5px solid var(--border)', background: 'none',
                color: 'var(--text3)', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600,
              }}>Annuler</button>
              <button onClick={confirmDelete} disabled={deleteBC.isPending} style={{
                flex: 1, background: 'var(--red)', color: 'white', border: 'none',
                padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700,
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}