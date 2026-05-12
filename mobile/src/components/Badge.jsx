import { View, Text, StyleSheet } from 'react-native';

const STATUT_CONFIG = {
  TRANSMIS:     { bg: '#FEF3C7', dotColor: '#F59E0B', textColor: '#92400E', label: 'Transmis' },
  RECU_BASE:    { bg: '#DBEAFE', dotColor: '#3B82F6', textColor: '#1D4ED8', label: 'Reçu base' },
  EN_LIVRAISON: { bg: '#EDE9FE', dotColor: '#7C3AED', textColor: '#5B21B6', label: 'En livraison' },
  LIVRE:        { bg: '#DCFCE7', dotColor: '#22C55E', textColor: '#166534', label: 'Livré' },
};

export default function Badge({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.TRANSMIS;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dotColor }]} />
      <Text style={[styles.text, { color: cfg.textColor }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 20, gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700' },
});
