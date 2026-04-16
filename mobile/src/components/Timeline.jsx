import { View, Text, StyleSheet } from 'react-native';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Timeline({ dateTransmission, dateReception, statut }) {
  const isLivre = statut === 'LIVRE';
  return (
    <View>
      {/* Étape 1 */}
      <View style={styles.step}>
        <View style={styles.stepLeft}>
          <View style={[styles.circle, styles.circleActive]}>
            <Text style={[styles.circleText, styles.circleTextActive]}>1</Text>
          </View>
          <View style={[styles.line, isLivre ? styles.lineActive : styles.lineInactive]} />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Transmis au fournisseur</Text>
          <Text style={styles.stepDate}>{fmtDate(dateTransmission)}</Text>
        </View>
      </View>

      {/* Étape 2 */}
      <View style={[styles.step, { marginBottom: 0 }]}>
        <View style={styles.stepLeft}>
          <View style={[styles.circle, isLivre ? styles.circleActiveLivre : styles.circleInactive]}>
            <Text style={[styles.circleText, isLivre ? styles.circleTextLivre : styles.circleTextInactive]}>
              2
            </Text>
          </View>
        </View>
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, !isLivre && styles.stepTitleInactive]}>Réceptionné</Text>
          <Text style={[styles.stepDate, !isLivre && styles.stepDateInactive]}>
            {isLivre ? fmtDate(dateReception) : 'En attente de livraison'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  stepLeft: {
    alignItems: 'center',
    width: 30,
    flexShrink: 0,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: '#DBEAFE' },
  circleActiveLivre: { backgroundColor: '#DCFCE7' },
  circleInactive: { backgroundColor: '#F1F5F9' },
  circleText: { fontSize: 13, fontWeight: '800' },
  circleTextActive: { color: '#1D4ED8' },
  circleTextLivre: { color: '#15803D' },
  circleTextInactive: { color: '#94A3B8' },
  line: {
    width: 2,
    height: 24,
    marginVertical: 3,
  },
  lineActive: { backgroundColor: '#3B82F6' },
  lineInactive: { backgroundColor: '#E2E8F0' },
  stepContent: {
    flex: 1,
    paddingTop: 6,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepTitleInactive: { color: '#94A3B8' },
  stepDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stepDateInactive: { color: '#CBD5E1' },
});
