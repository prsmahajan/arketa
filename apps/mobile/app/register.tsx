import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'member' | 'creator'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) return;
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.header}>
          <View style={s.logo}>
            <Text style={s.logoText}>A</Text>
          </View>
          <Text style={s.title}>Create account</Text>
        </View>

        <View style={s.form}>
          {error ? <Text style={s.error}>{error}</Text> : null}

          <View style={s.roleRow}>
            <TouchableOpacity style={[s.roleBtn, role === 'member' && s.roleActive]} onPress={() => setRole('member')}>
              <Text style={[s.roleLabel, role === 'member' && s.roleLabelActive]}>Join</Text>
              <Text style={s.roleDesc}>Participate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.roleBtn, role === 'creator' && s.roleActive]} onPress={() => setRole('creator')}>
              <Text style={[s.roleLabel, role === 'creator' && s.roleLabelActive]}>Create</Text>
              <Text style={s.roleDesc}>Run a community</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName} placeholderTextColor="#9ca3af" />
          <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
          <TextInput style={s.input} placeholder="Password (min 8 chars)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#9ca3af" />

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Creating...' : 'Create account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/login" style={s.link}>Sign in</Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', color: '#111' },
  form: { gap: 12 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, padding: 14 },
  roleActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  roleLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },
  roleLabelActive: { color: '#059669' },
  roleDesc: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111', backgroundColor: '#fafafa' },
  btn: { backgroundColor: '#059669', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 13, textAlign: 'center', backgroundColor: '#fef2f2', padding: 10, borderRadius: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6b7280', fontSize: 14 },
  link: { color: '#059669', fontSize: 14, fontWeight: '600' },
});
