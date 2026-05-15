import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.js';
import { useBonsCommande } from '../../src/hooks/useBonsCommande.js';
import BCCard from '../../src/components/BCCard.jsx';

const STATUTS = [
  { label: 'Tous',       value: '' },
  { label: 'Transmis',   value: 'TRANSMIS' },
  { label: 'Reçu Base',  value: 'RECU_BASE' },
  { label: 'Transfert',  value: 'EN_LIVRAISON' },
  { label: 'Chantier',   value: 'LIVRE' },
];

const STATUT_COLORS = {
  TRANSMIS:     '#F59E0B',
  RECU_BASE:    '#3B82F6',
  EN_LIVRAISON: '#7C3AED',
  LIVRE:        '#22C55E',
};

export default function ListeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: bcs = [], isLoading, refetch, isRefetching } = useBonsCommande();

  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bcs.filter((bc) => {
      const matchSearch = !q || [bc.numero, bc.fournisseur, bc.imputation]
        .filter(Boolean).some((f) => f.toLowerCase().includes(q));
      const matchStatut = !filtreStatut || bc.statut === filtreStatut;
      return matchSearch && matchStatut;
    });
  }, [bcs, search, filtreStatut]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bons de Commande</Text>
          <Text style={styles.headerSub}>Bonjour, {user?.nom || 'Réceptionniste'}</Text>
        </View>
        <TouchableOpacity style={styles.decoBtn} onPress={logout}>
          <Text style={styles.decoText}>Déco</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="N° BC, fournisseur, imputation..."
            placeholderTextColor="#94A3B8"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres statut */}
      <View style={styles.filtresRow}>
        {STATUTS.map((opt) => {
          const isActive = filtreStatut === opt.value;
          const dotColor = STATUT_COLORS[opt.value];
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setFiltreStatut(opt.value)}
              style={[styles.filtrePill, isActive && { backgroundColor: dotColor || '#0F172A', borderColor: 'transparent' }]}
              activeOpacity={0.7}
            >
              {dotColor && !isActive && (
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
              <Text style={[styles.filtreTxt, isActive && styles.filtreTxtActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={styles.count}>
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              {(search || filtreStatut) ? ` sur ${bcs.length}` : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun résultat</Text>
              {(search || filtreStatut) && (
                <TouchableOpacity onPress={() => { setSearch(''); setFiltreStatut(''); }}>
                  <Text style={styles.resetTxt}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <BCCard bc={item} onPress={() => router.push(`/(app)/${item.id}`)} />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0F172A" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  decoBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7 },
  decoText: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  searchContainer: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F1F5F9', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  clearBtn: { fontSize: 12, color: '#94A3B8', padding: 2 },

  filtresRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 14,
    paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    flexWrap: 'wrap',
  },
  filtrePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  filtreTxt: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  filtreTxtActive: { color: '#fff' },

  list: { padding: 14 },
  count: {
    fontSize: 10, color: '#94A3B8', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13, marginBottom: 10 },
  resetTxt: { fontSize: 12, color: '#3B82F6', fontWeight: '700' },
});
