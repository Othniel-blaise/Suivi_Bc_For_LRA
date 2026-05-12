import { View, Text, StyleSheet } from 'react-native';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STEPS = [
  { key: 'TRANSMIS',     label: 'Transmis',      circleColor: '#DBEAFE', textColor: '#1D4ED8' },
  { key: 'RECU_BASE',    label: 'Reçu base',      circleColor: '#DBEAFE', textColor: '#1D4ED8' },
  { key: 'EN_LIVRAISON', label: 'En livraison',   circleColor: '#EDE9FE', textColor: '#6D28D9' },
  { key: 'LIVRE',        label: 'Livré',           circleColor: '#DCFCE7', textColor: '#15803D' },
];
const ORDER = STEPS.map((s) => s.key);

export default function Timeline({ dateTransmission, dateReceptionBase, dateLivraison, dateReception, statut }) {
  const currentIdx = ORDER.indexOf(statut);
  const dates = [dateTransmission, dateReceptionBase, dateLivraison, dateReception];

  return (
    <View>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === STEPS.length - 1;
        return (
          <View key={step.key} style={[styles.step, isLast && { marginBottom: 0 }]}>
            <View style={styles.stepLeft}>
              <View style={[styles.circle, done ? { backgroundColor: step.circleColor } : styles.circleInactive]}>
                <Text style={[styles.circleText, done ? { color: step.textColor } : styles.circleTextInactive]}>
                  {i + 1}
                </Text>
              </View>
              {!isLast && (
                <View style={[styles.line, done && i < currentIdx ? styles.lineActive : styles.lineInactive]} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, !done && styles.stepTitleInactive]}>{step.label}</Text>
              <Text style={[styles.stepDate, !done && styles.stepDateInactive]}>
                {done && dates[i] ? fmtDate(dates[i]) : !done ? 'En attente' : ''}
              </Text>
            </View>
          </View>
        );
      })}
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
