import { useState } from 'react';
import { useAuthStore } from '../store/auth.js';
import { useBonsCommande, useDeleteBC } from '../hooks/useBonsCommande.js';
import StatCard from '../components/StatCard.jsx';
import BCRow from '../components/BCRow.jsx';
import ModalNouveauBC from '../components/ModalNouveauBC.jsx';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { data: bcs = [], isLoading, error } = useBonsCommande();
  const deleteBC = useDeleteBC();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const total = bcs.length;
  const enAttente = bcs.filter((b) => b.statut === 'TRANSMIS').length;
  const livres = bcs.filter((b) => b.statut === 'LIVRE').length;

  function handleDelete(bc) {
    setDeleteConfirm(bc);
  }

  function confirmDelete() {
    if (!deleteConfirm) return;
    deleteBC.mutate(deleteConfirm.id);
    setDeleteConfirm(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        style={{
          background: 'var(--navy)',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
            Suivi Bons de Commande
          </div>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
            Bonjour, {user?.nom} · Dashboard
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'var(--amber)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            + Nouveau BC
          </button>
          <button
            onClick={logout}
            style={{
              background: 'var(--navy2)',
              color: '#94a3b8',
              border: '1px solid #334155',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11,
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total BC" value={total} />
          <StatCard label="En attente" value={enAttente} color="amber" />
          <StatCard label="Livrés" value={livres} color="green" />
        </div>

        {/* Tableau */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '13px 20px',
              borderBottom: '1px solid var(--border2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
              Tous les bons de commande
            </span>
            <span style={{ fontSize: 11, color: 'var(--text4)' }}>
              {total} entrée{total > 1 ? 's' : ''}
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

          {!isLoading && !error && bcs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
              Aucun bon de commande. Cliquez sur "+ Nouveau BC" pour commencer.
            </div>
          )}

          {bcs.map((bc, i) => (
            <BCRow
              key={bc.id}
              bc={bc}
              index={i}
              total={bcs.length}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Modal nouveau BC */}
      <ModalNouveauBC open={showModal} onClose={() => setShowModal(false)} />

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              padding: 26,
              maxWidth: 360,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              Supprimer ce BC ?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.5 }}>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>
                {deleteConfirm.numero}
              </span>{' '}
              — {deleteConfirm.fournisseur}
              <br />
              Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  border: '1.5px solid var(--border)',
                  background: 'none',
                  color: 'var(--text3)',
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteBC.isPending}
                style={{
                  flex: 1,
                  background: 'var(--red)',
                  color: 'white',
                  border: 'none',
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
