import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.js';
import api from '../../src/api/client.js';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Veuillez renseigner vos identifiants');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username: username.trim(), password });
      await setAuth(data.token, data.user);
      router.replace('/(app)/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>📦</Text>
            </View>
            <Text style={styles.title}>Espace Réceptionniste</Text>
            <Text style={styles.subtitle}>Suivi des livraisons</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Identifiant</Text>
              <TextInput
                style={styles.input}
                placeholder="aminata"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Version */}
          <View style={styles.demo}>
            <Text style={styles.demoText}>Blaise_Système · </Text>
            <Text style={styles.demoCreds}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 56,
    height: 56,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 24 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
  },
  form: { gap: 12 },
  inputGroup: { gap: 5 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    padding: 11,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
  },
  errorText: { fontSize: 12, color: '#DC2626' },
  btn: {
    backgroundColor: '#0F172A',
    borderRadius: 11,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: '#CBD5E1' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  demo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
  },
  demoText: { fontSize: 11, color: '#94A3B8' },
  demoCreds: { fontSize: 11, color: '#64748B', fontWeight: '700' },
});
