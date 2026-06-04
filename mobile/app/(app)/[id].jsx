import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBonCommande,
  useReceptionnerBase,
  useMettreEnLivraison,
  useLivraisonFinale,
} from '../../src/hooks/useBonsCommande.js';
import Badge from '../../src/components/Badge.jsx';
import Timeline from '../../src/components/Timeline.jsx';
import LieuPicker from '../../src/components/LieuPicker.jsx';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── Sélecteur TOTAL / PARTIEL ── */
function TypePicker({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
      {['TOTAL', 'PARTIEL'].map((v) => (
        <TouchableOpacity
          key={v} onPress={() => onChange(v)}
          style={[styles.typBtn, value === v && styles.typBtnActive]}
        >
          <Text style={[styles.typTxt, value === v && styles.typTxtActive]}>
            {v === 'TOTAL' ? '✅ Totale' : '⚠️ Partielle'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ══════════════════════════════════════════
   ÉTAPE 2 — Réception à la base
══════════════════════════════════════════ */
function FormulaireBase({ bcId, onDone }) {
  const mutation = useReceptionnerBase();
  const [lieuBase, setLieuBase] = useState('');
  const [typeReception, setTypeReception] = useState('TOTAL');
  const [observations, setObservations] = useState('');

  async function submit() {
    if (!lieuBase.trim()) return Alert.alert('Champ requis', 'Renseignez le lieu de réception');
    try {
      await mutation.mutateAsync({ id: bcId, lieuBase: lieuBase.trim(), typeReception, observations: observations.trim() || undefined });
      if (typeReception === 'PARTIEL') {
        Alert.alert('⚠️ Réception partielle', 'Enregistrée. Ce BC reste disponible pour compléter la réception.');
      } else {
        Alert.alert('✅ Enregistré', 'Réception à la base confirmée.', [{ text: 'OK', onPress: onDone }]);
      }
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Impossible d\'enregistrer');
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏠 Réception à la base</Text>

      <Text style={styles.label}>Lieu de réception *</Text>
      <LieuPicker value={lieuBase} onChange={setLieuBase} disabled={mutation.isPending} />

      <Text style={styles.label}>Type de réception *</Text>
      <TypePicker value={typeReception} onChange={setTypeReception} />

      <Text style={[styles.label, { marginTop: 12 }]}>Observations <Text style={styles.optional}>(optionnel)</Text></Text>
      <TextInput style={[styles.input, styles.textarea]} value={observations}
        onChangeText={setObservations} multiline numberOfLines={3}
        placeholder="Anomalies, manques..." placeholderTextColor="#64748B" textAlignVertical="top" />

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#3B82F6' }]}
        onPress={submit} disabled={mutation.isPending} activeOpacity={0.8}>
        {mutation.isPending
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnTxt}>Confirmer la réception base</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* ══════════════════════════════════════════
   ÉTAPE 3 — Mise en livraison
══════════════════════════════════════════ */
function FormulaireLivraison({ bcId, onDone }) {
  const mutation = useMettreEnLivraison();
  const [agentLivreur, setAgent] = useState('');
  const [lieuDestination, setDest] = useState('');

  async function submit() {
    if (!agentLivreur.trim()) return Alert.alert('Champ requis', 'Renseignez l\'agent livreur');
    if (!lieuDestination.trim()) return Alert.alert('Champ requis', 'Renseignez le lieu de destination');
    try {
      await mutation.mutateAsync({ id: bcId, agentLivreur: agentLivreur.trim(), lieuDestination: lieuDestination.trim() });
      Alert.alert('🚚 Mis en livraison', 'Le colis est en route.', [{ text: 'OK', onPress: onDone }]);
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Impossible d\'enregistrer');
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚚 Mise en livraison</Text>

      <Text style={styles.label}>Agent livreur *</Text>
      <TextInput style={styles.input} value={agentLivreur} onChangeText={setAgent}
        placeholder="Nom de l'agent" placeholderTextColor="#64748B" />

      <Text style={[styles.label, { marginTop: 12 }]}>Lieu de destination *</Text>
      <LieuPicker value={lieuDestination} onChange={setDest} disabled={mutation.isPending} />

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#7C3AED' }]}
        onPress={submit} disabled={mutation.isPending} activeOpacity={0.8}>
        {mutation.isPending
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnTxt}>Confirmer le départ</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* ══════════════════════════════════════════
   ÉTAPE 4 — Livraison finale au chantier
══════════════════════════════════════════ */
function FormulaireChantier({ bcId, onDone }) {
  const mutation = useLivraisonFinale();
  const [lieuReception, setLieu] = useState('');
  const [typeReception, setType] = useState('TOTAL');
  const [observations, setObs] = useState('');

  async function submit() {
    if (!lieuReception.trim()) return Alert.alert('Champ requis', 'Renseignez le lieu de réception');
    try {
      await mutation.mutateAsync({ id: bcId, lieuReception: lieuReception.trim(), typeReception, observations: observations.trim() || undefined });
      if (typeReception === 'PARTIEL') {
        Alert.alert('⚠️ Livraison partielle', 'Enregistrée. Ce BC reste disponible pour compléter la livraison.');
      } else {
        Alert.alert('✅ Livré !', 'Livraison confirmée au chantier.', [{ text: 'OK', onPress: onDone }]);
      }
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Impossible d\'enregistrer');
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Réception au chantier</Text>

      <Text style={styles.label}>Lieu de réception *</Text>
      <LieuPicker value={lieuReception} onChange={setLieu} disabled={mutation.isPending} />

      <Text style={styles.label}>Type de réception *</Text>
      <TypePicker value={typeReception} onChange={setType} />

      <Text style={[styles.label, { marginTop: 12 }]}>Observations <Text style={styles.optional}>(optionnel)</Text></Text>
      <TextInput style={[styles.input, styles.textarea]} value={observations}
        onChangeText={setObs} multiline numberOfLines={3}
        placeholder="Anomalies, manques..." placeholderTextColor="#64748B" textAlignVertical="top" />

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#15803D' }]}
        onPress={submit} disabled={mutation.isPending} activeOpacity={0.8}>
        {mutation.isPending
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnTxt}>Confirmer la livraison</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* ══════════════════════════════════════════
   ÉCRAN PRINCIPAL
══════════════════════════════════════════ */
export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: bc, isLoading } = useBonCommande(id);

  if (isLoading || !bc) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color="#0F172A" /></View>
      </SafeAreaView>
    );
  }

  function goBack() { router.back(); }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerNumero}>{bc.numero}</Text>
          <Text style={styles.headerFourn} numberOfLines={1}>{bc.fournisseur}</Text>
        </View>
        <Badge statut={bc.statut} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Détails du BC */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du BC</Text>
          {[
            ['N° BC', bc.numero, true],
            ['Fournisseur', bc.fournisseur, false],
            ['Imputation', bc.imputation, false],
            ['Transmis le', fmtDate(bc.dateTransmission), false],
          ].map(([k, v, mono], i, a) => (
            <View key={k} style={[styles.detailRow, i === a.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.detailKey}>{k}</Text>
              <Text style={[styles.detailValue, mono && styles.mono]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Suivi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivi du parcours</Text>
          <Timeline
            dateTransmission={bc.dateTransmission}
            dateReceptionBase={bc.dateReceptionBase}
            dateLivraison={bc.dateLivraison}
            dateReception={bc.dateReception}
            statut={bc.statut}
          />
        </View>

        {/* Formulaire selon statut */}
        {bc.statut === 'TRANSMIS'     && <FormulaireBase      bcId={bc.id} onDone={goBack} />}
        {bc.statut === 'RECU_BASE'    && <FormulaireLivraison bcId={bc.id} onDone={goBack} />}
        {bc.statut === 'EN_LIVRAISON' && <FormulaireChantier  bcId={bc.id} onDone={goBack} />}

        {/* Résumé si livré */}
        {bc.statut === 'LIVRE' && (
          <View style={styles.livreBanner}>
            <Text style={styles.livreTitle}>✅ Livraison complète</Text>
            {bc.lieuBase        && <Text style={styles.livreLine}>🏠 Base : {bc.lieuBase}</Text>}
            {bc.agentLivreur    && <Text style={styles.livreLine}>🚚 Agent : {bc.agentLivreur}</Text>}
            {bc.lieuDestination && <Text style={styles.livreLine}>📍 Destination : {bc.lieuDestination}</Text>}
            {bc.lieuReception   && <Text style={styles.livreLine}>📦 Réception : {bc.lieuReception}</Text>}
            {bc.receptionniste  && <Text style={styles.livreMeta}>Par {bc.receptionniste.nom} · {fmtDate(bc.dateReception)}</Text>}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: '#64748B' },
  headerInfo: { flex: 1, minWidth: 0 },
  headerNumero: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' },
  headerFourn: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  content: { padding: 14, gap: 14, paddingBottom: 40 },
  section: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 15,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  detailKey: { fontSize: 11, color: '#94A3B8' },
  detailValue: { fontSize: 12, fontWeight: '700', color: '#0F172A', textAlign: 'right', flex: 1, marginLeft: 12 },
  mono: { fontFamily: 'monospace' },
  label: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 5 },
  optional: { fontWeight: '400', color: '#94A3B8' },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 9,
    padding: 11, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC',
  },
  textarea: { minHeight: 80 },
  typBtn: {
    flex: 1, padding: 10, borderRadius: 8, borderWidth: 1.5,
    borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  typBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  typTxt: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  typTxtActive: { color: '#fff' },
  btn: {
    borderRadius: 11, padding: 14, alignItems: 'center', marginTop: 16,
  },
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  livreBanner: {
    backgroundColor: '#F0FDF4', borderRadius: 12,
    borderWidth: 1, borderColor: '#BBF7D0', padding: 16,
  },
  livreTitle: { fontSize: 13, fontWeight: '800', color: '#15803D', marginBottom: 10 },
  livreLine: { fontSize: 12, color: '#166534', marginBottom: 4 },
  livreMeta: { fontSize: 11, color: '#86EFAC', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#BBF7D0' },
});
