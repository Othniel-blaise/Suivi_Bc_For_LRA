import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Badge from './Badge.jsx';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BCCard({ bc, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.numero}>{bc.numero}</Text>
        <Badge statut={bc.statut} />
      </View>
      <Text style={styles.fournisseur}>{bc.fournisseur}</Text>
      <Text style={styles.objet}>{bc.imputation}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Transmis le {fmtDate(bc.dateTransmission)}</Text>
        {bc.statut === 'LIVRE' && bc.dateReception && (
          <Text style={styles.receptionDate}>
            · Réceptionné le {fmtDate(bc.dateReception)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  numero: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  fournisseur: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 2,
  },
  objet: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  receptionDate: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '700',
  },
});
