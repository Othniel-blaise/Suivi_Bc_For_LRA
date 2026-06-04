import { View, Text, StyleSheet } from 'react-native';

function fmtDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

const STEPS = [
  { key: 'TRANSMIS',     label: 'Transmis',      circleColor: '#DBEAFE', textColor: '#1D4ED8' },
  { key: 'RECU_BASE',    label: 'Reçu (PK29) ',     circleColor: '#DBEAFE', textColor: '#1D4ED8' },
  { key: 'EN_LIVRAISON', label: 'Transfert',     circleColor: '#EDE9FE', textColor: '#6D28D9' },
  { key: 'LIVRE',        label: 'Reçu Chantier', circleColor: '#DCFCE7', textColor: '#15803D' },
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
        const isPartial = !done && !!dates[i];

        let circleStyle = styles.circleInactive;
        let circleTextStyle = styles.circleTextInactive;
        if (done) {
          circleStyle = { backgroundColor: step.circleColor };
          circleTextStyle = { color: step.textColor };
        } else if (isPartial) {
          circleStyle = { backgroundColor: '#FEF3C7' };
          circleTextStyle = { color: '#D97706' };
        }

        let dateLabel = 'En attente';
        let dateLabelStyle = styles.stepDateInactive;
        if (done && dates[i]) {
          dateLabel = fmtDateTime(dates[i]);
          dateLabelStyle = styles.stepDate;
        } else if (isPartial) {
          dateLabel = `⚠️ Partiel · ${fmtDateTime(dates[i])}`;
          dateLabelStyle = styles.stepDatePartial;
        }

        return (
          <View key={step.key} style={[styles.step, isLast && { marginBottom: 0 }]}>
            <View style={styles.stepLeft}>
              <View style={[styles.circle, circleStyle]}>
                <Text style={[styles.circleText, circleTextStyle]}>
                  {i + 1}
                </Text>
              </View>
              {!isLast && (
                <View style={[styles.line, done && i < currentIdx ? styles.lineActive : styles.lineInactive]} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, !done && !isPartial && styles.stepTitleInactive, isPartial && styles.stepTitlePartial]}>
                {step.label}
              </Text>
              <Text style={dateLabelStyle}>{dateLabel}</Text>
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
  circleInactive: { backgroundColor: '#F1F5F9' },
  circleText: { fontSize: 13, fontWeight: '800' },
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
  stepTitlePartial: { color: '#D97706' },
  stepDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stepDateInactive: { color: '#CBD5E1', fontSize: 11 },
  stepDatePartial: { fontSize: 11, color: '#D97706', fontWeight: '600' },
});
