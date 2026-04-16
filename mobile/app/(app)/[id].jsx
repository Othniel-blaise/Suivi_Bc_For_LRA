import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBonCommande, useConfirmerReception } from '../../src/hooks/useBonsCommande.js';
import Badge from '../../src/components/Badge.jsx';
import Timeline from '../../src/components/Timeline.jsx';
import LieuPicker from '../../src/components/LieuPicker.jsx';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: bc, isLoading } = useBonCommande(id);
  const confirmerReception = useConfirmerReception();

  const [articles, setArticles] = useState('');
  const [lieu, setLieu] = useState('');

  async function handleConfirm() {
    if (!articles.trim()) {
      Alert.alert('Champ requis', 'Veuillez renseigner les articles reçus');
      return;
    }
    if (!lieu.trim()) {
      Alert.alert('Champ requis', 'Veuillez renseigner le lieu de réception');
      return;
    }

    try {
      await confirmerReception.mutateAsync({
        id,
        articlesRecus: articles.trim(),
        lieuReception: lieu.trim(),
      });
      Alert.alert('✓ Réception confirmée', 'Le bon de commande a été mis à jour.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible de confirmer la réception');
    }
  }

  if (isLoading || !bc) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </SafeAreaView>
    );
  }

  const isLivre = bc.statut === 'LIVRE';
  const canSubmit = articles.trim() && lieu.trim() && !confirmerReception.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
            <View
              key={k}
              style={[styles.detailRow, i === a.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.detailKey}>{k}</Text>
              <Text style={[styles.detailValue, mono && styles.mono]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Suivi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivi</Text>
          <Timeline
            dateTransmission={bc.dateTransmission}
            dateReception={bc.dateReception}
            statut={bc.statut}
          />
        </View>

        {/* Formulaire réception (si TRANSMIS) */}
        {!isLivre && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmer la réception</Text>

            <Text style={styles.inputLabel}>Articles reçus *</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder={"Ex: Cartouches HP x10 — conforme\nPrécisez toute anomalie constatée"}
              value={articles}
              onChangeText={setArticles}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Lieu de réception *</Text>
            <LieuPicker
              value={lieu}
              onChange={setLieu}
              disabled={confirmerReception.isPending}
            />

            <TouchableOpacity
              style={[styles.confirmBtn, !canSubmit && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              {confirmerReception.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>✓ Confirmer la réception</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Réception confirmée (si LIVRE) */}
        {isLivre && (
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedTitle}>✓ Réception confirmée</Text>
            <Text style={styles.confirmedArticles}>{bc.articlesRecus}</Text>
            {bc.lieuReception && (
              <View style={styles.lieuBox}>
                <Text style={styles.lieuText}>📍 {bc.lieuReception}</Text>
              </View>
            )}
            <Text style={styles.confirmedMeta}>
              Par{' '}
              <Text style={styles.confirmedNom}>{bc.receptionniste?.nom}</Text>
              {' · '}
              {fmtDate(bc.dateReception)}
            </Text>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: '#64748B' },
  headerInfo: { flex: 1, minWidth: 0 },
  headerNumero: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' },
  headerFourn: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  content: { padding: 14, gap: 14, paddingBottom: 40 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailKey: { fontSize: 11, color: '#94A3B8' },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  mono: { fontFamily: 'monospace' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 4,
  },
  textarea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    padding: 11,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 90,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  confirmBtn: {
    backgroundColor: '#15803D',
    borderRadius: 11,
    padding: 14,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#CBD5E1' },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  confirmedBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 15,
  },
  confirmedTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  confirmedArticles: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 10,
  },
  lieuBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  lieuText: { fontSize: 12, color: '#1D4ED8', fontWeight: '700' },
  confirmedMeta: {
    fontSize: 11,
    color: '#86EFAC',
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    paddingTop: 9,
  },
  confirmedNom: { color: '#16A34A', fontWeight: '700' },
});
