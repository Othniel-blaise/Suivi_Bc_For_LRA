import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Modal from './ui/Modal.jsx';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client.js';

const COL_NUMERO = ['n° du bc', 'n°bc', 'nbc', 'numero', 'numéro', 'n° bc', 'bc', 'n°'];
const COL_FOURNISSEUR = ['fournisseur'];
const COL_IMPUTATION = ['imputation', 'objet', 'désignation', 'designation', 'libellé', 'libelle'];

function normalise(str) {
  return String(str ?? '').toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function detecterColonne(headers, candidats) {
  for (const h of headers) {
    if (candidats.includes(normalise(h))) return h;
  }
  return null;
}

function parseRows(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rows.length === 0) return { rows: [], mapping: null, error: 'Fichier vide' };

  const headers = Object.keys(rows[0]);
  const colNumero = detecterColonne(headers, COL_NUMERO);
  const colFournisseur = detecterColonne(headers, COL_FOURNISSEUR);
  const colImputation = detecterColonne(headers, COL_IMPUTATION);

  if (!colNumero || !colFournisseur) {
    return {
      rows: [],
      mapping: null,
      error: `Colonnes non reconnues. Attendu : "N° du BC" et "Fournisseur". Trouvé : ${headers.join(', ')}`,
    };
  }

  const parsed = rows
    .map((r) => ({
      numero: String(r[colNumero] ?? '').trim(),
      fournisseur: String(r[colFournisseur] ?? '').trim(),
      imputation: colImputation ? String(r[colImputation] ?? '').trim() : '—',
    }))
    .filter((r) => r.numero && r.fournisseur);

  return { rows: parsed, mapping: { colNumero, colFournisseur, colImputation }, error: null };
}

export default function ModalImportBC({ open, onClose }) {
  const [etape, setEtape] = useState('upload'); // upload | preview | resultat
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState(null);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [nomFichier, setNomFichier] = useState('');
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  function reset() {
    setEtape('upload');
    setRows([]);
    setMapping(null);
    setParseError('');
    setLoading(false);
    setResultat(null);
    setNomFichier('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomFichier(file.name);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const { rows: parsed, mapping: map, error } = parseRows(wb);
        if (error) { setParseError(error); return; }
        if (parsed.length === 0) { setParseError('Aucune ligne valide trouvée.'); return; }
        setRows(parsed);
        setMapping(map);
        setEtape('preview');
      } catch {
        setParseError('Impossible de lire le fichier. Vérifiez le format.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    setLoading(true);
    try {
      const { data } = await api.post('/bons-commande/import', rows);
      setResultat(data);
      setEtape('resultat');
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
    } catch (err) {
      setParseError(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: 9,
    padding: '9px 12px', fontSize: 13, outline: 'none', background: 'white',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Importer depuis Excel / CSV">

      {/* ── ÉTAPE 1 : Upload ── */}
      {etape === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{
            background: 'var(--bg)', border: '2px dashed var(--border)',
            borderRadius: 12, padding: '28px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Sélectionner un fichier
            </div>
            <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 16 }}>
              Formats acceptés : <strong>.xlsx</strong> (Excel) ou <strong>.csv</strong>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file" style={{
              display: 'inline-block',
              background: 'var(--navy)',
              color: 'white',
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              Choisir un fichier
            </label>
            {nomFichier && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
                📄 {nomFichier}
              </div>
            )}
          </div>

          {parseError && (
            <div style={{
              background: 'var(--red-l)', border: '1px solid #FCA5A5',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)',
            }}>
              ⚠ {parseError}
            </div>
          )}

          <div style={{
            background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', fontSize: 11,
            color: 'var(--text4)', lineHeight: 1.8,
          }}>
            <strong style={{ color: 'var(--text3)' }}>Format attendu :</strong><br />
            Colonne 1 : <code>N° du BC</code> &nbsp;|&nbsp;
            Colonne 2 : <code>Fournisseur</code> &nbsp;|&nbsp;
            Colonne 3 : <code>Imputation</code> (optionnel)
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Prévisualisation ── */}
      {etape === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg)', borderRadius: 8, padding: '10px 14px',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              📄 {nomFichier}
            </span>
            <span style={{
              background: '#DBEAFE', color: '#1D4ED8',
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            }}>
              {rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)' }}>
                <tr>
                  {['#', 'Numéro', 'Nom du fournisseur', 'Imputation par défaut'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, color: 'var(--text4)',
                      borderBottom: '1px solid var(--border2)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border2)' }}>
                    <td style={{ padding: '7px 12px', color: 'var(--text4)', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: '7px 12px', fontFamily: 'var(--mono)', fontWeight: 600 }}>{r.numero}</td>
                    <td style={{ padding: '7px 12px' }}>{r.fournisseur}</td>
                    <td style={{ padding: '7px 12px', color: 'var(--text3)' }}>{r.imputation || '—'}</td>
                  </tr>
                ))}
                {rows.length > 50 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text4)', fontSize: 11 }}>
                      ... et {rows.length - 50} autres lignes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {parseError && (
            <div style={{
              background: 'var(--red-l)', borderRadius: 8, padding: '10px 14px',
              fontSize: 12, color: 'var(--red)',
            }}>
              ⚠ {parseError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={reset} style={{
              flex: 1, border: '1.5px solid var(--border)', background: 'none',
              color: 'var(--text3)', padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              ← Changer le fichier
            </button>
            <button onClick={handleImport} disabled={loading} style={{
              flex: 2, background: loading ? 'var(--text5)' : 'var(--navy)',
              color: 'white', border: 'none', padding: 11, borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Import en cours...
                </>
              ) : (
                `Importer ${rows.length} BC`
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : Résultat ── */}
      {etape === 'resultat' && resultat && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#16A34A' }}>{resultat.crees}</div>
              <div style={{ fontSize: 11, color: '#15803D', fontWeight: 600, marginTop: 2 }}>Créés ✓</div>
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#D97706' }}>{resultat.doublons}</div>
              <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600, marginTop: 2 }}>Doublons</div>
            </div>
            <div style={{ background: resultat.erreurs > 0 ? '#FEF2F2' : 'var(--bg)', border: `1px solid ${resultat.erreurs > 0 ? '#FCA5A5' : 'var(--border)'}`, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: resultat.erreurs > 0 ? '#DC2626' : 'var(--text4)' }}>{resultat.erreurs}</div>
              <div style={{ fontSize: 11, color: resultat.erreurs > 0 ? '#B91C1C' : 'var(--text4)', fontWeight: 600, marginTop: 2 }}>Erreurs</div>
            </div>
          </div>

          {(resultat.doublons > 0 || resultat.erreurs > 0) && (
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}>
              {resultat.resultats
                .filter((r) => r.statut !== 'ok')
                .map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '8px 12px',
                    borderBottom: '1px solid var(--border2)',
                    background: r.statut === 'doublon' ? '#FFFBEB' : '#FEF2F2',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 120 }}>{r.numero}</span>
                    <span style={{ color: r.statut === 'doublon' ? '#D97706' : '#DC2626' }}>{r.message}</span>
                  </div>
                ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={reset} style={{
              flex: 1, border: '1.5px solid var(--border)', background: 'none',
              color: 'var(--text3)', padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Nouvel import
            </button>
            <button onClick={handleClose} style={{
              flex: 2, background: 'var(--navy)', color: 'white', border: 'none',
              padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}
