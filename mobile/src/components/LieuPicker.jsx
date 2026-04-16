import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LIEUX_RECEPTION } from '../constants/lieux.js';

export default function LieuPicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = LIEUX_RECEPTION.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  function select(lieu) {
    onChange(lieu);
    setOpen(false);
    setSearch('');
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          style={[styles.triggerText, !value && styles.placeholder]}
          numberOfLines={1}
        >
          {value || 'Sélectionner un lieu de réception'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lieu de réception</Text>
            <TouchableOpacity
              onPress={() => { setOpen(false); setSearch(''); }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeTxt}>Fermer</Text>
            </TouchableOpacity>
          </View>

          {/* Champ de recherche */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍  Rechercher un lieu..."
              value={search}
              onChangeText={setSearch}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          <Text style={styles.count}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </Text>

          {/* Liste */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => select(item)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[styles.itemText, isSelected && styles.itemTextSelected]}
                    numberOfLines={2}
                  >
                    {item}
                  </Text>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucun lieu trouvé</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    padding: 11,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  triggerDisabled: { opacity: 0.5 },
  triggerText: {
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  placeholder: { color: '#94A3B8' },
  arrow: { fontSize: 10, color: '#94A3B8' },

  modal: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  closeTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  searchBox: { padding: 12, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#0F172A',
  },

  count: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  itemSelected: { backgroundColor: '#EFF6FF' },
  itemText: { fontSize: 13, color: '#0F172A', flex: 1 },
  itemTextSelected: { color: '#1D4ED8', fontWeight: '700' },
  check: { fontSize: 16, color: '#1D4ED8', marginLeft: 8 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});
