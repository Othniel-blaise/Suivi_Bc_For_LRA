import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.js';
import { useBonsCommande } from '../../src/hooks/useBonsCommande.js';
import BCCard from '../../src/components/BCCard.jsx';

export default function ListeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: bcs = [], isLoading, refetch, isRefetching } = useBonsCommande();

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

      {/* Liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={bcs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>{bcs.length} bon{bcs.length > 1 ? 's' : ''} de commande</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun bon de commande</Text>
            </View>
          }
          renderItem={({ item }) => (
            <BCCard
              bc={item}
              onPress={() => router.push(`/(app)/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#0F172A"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  decoBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  decoText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  list: { padding: 14 },
  count: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});
