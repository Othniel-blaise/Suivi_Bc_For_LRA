import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ statut }) {
  const isLivre = statut === 'LIVRE';
  return (
    <View style={[styles.badge, isLivre ? styles.livre : styles.transmis]}>
      <View style={[styles.dot, isLivre ? styles.dotLivre : styles.dotTransmis]} />
      <Text style={[styles.text, isLivre ? styles.textLivre : styles.textTransmis]}>
        {isLivre ? 'Livré' : 'Transmis'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 5,
  },
  transmis: { backgroundColor: '#FEF3C7' },
  livre: { backgroundColor: '#DCFCE7' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotTransmis: { backgroundColor: '#F59E0B' },
  dotLivre: { backgroundColor: '#22C55E' },
  text: { fontSize: 11, fontWeight: '700' },
  textTransmis: { color: '#92400E' },
  textLivre: { color: '#166534' },
});
