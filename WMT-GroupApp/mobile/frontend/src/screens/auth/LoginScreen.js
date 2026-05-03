import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Fingerprint } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, fontSize, space, palette, radius } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { friendlyError } from '../../services/api';
import { APP_NAME } from '../../services/config';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const { signIn } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const u = await signIn(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show(`Welcome back, ${u.name.split(' ')[0]}.`, 'success');
    } catch (err) {
      toast.show(friendlyError(err, 'Could not sign in'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const tryBiometric = async () => {
    try {
      const has = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!has || !enrolled) return toast.show('Biometric not available on this device', 'info');
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: `Sign in to ${APP_NAME}` });
      if (r.success) {
        if (!email || !password) {
          toast.show('Sign in once with email & password to enable biometrics.', 'info', 3200);
          return;
        }
        await onSubmit();
      }
    } catch {
      toast.show('Biometric unavailable', 'error');
    }
  };

  const fillDemo = (kind) => {
    if (kind === 'guest') { setEmail('guest@maison.com'); setPassword('guest1234'); }
    else { setEmail('admin@luxury.com'); setPassword('admin1234'); }
    setErrors({});
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.charcoal }}>
      <StatusBar style="light" />
      <ExpoImage
        source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80' }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }}
        contentFit="cover"
        transition={400}
      />
      <LinearGradient
        colors={['rgba(14,14,16,0.55)', 'rgba(14,14,16,0.95)', '#0E0E10']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }}
      />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: space.xxl, paddingTop: space.xxl + 8, paddingBottom: 36 }}>
              <Text style={{ color: palette.gold, fontSize: fontSize.xs, letterSpacing: 3, fontWeight: '700' }}>
                MAISON
              </Text>
              <Text style={{ color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 8, lineHeight: 44 }}>
                A reservation{'\n'}worth keeping.
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.md, marginTop: 10, maxWidth: 320 }}>
                Sign in to discover the city's most extraordinary tables.
              </Text>
            </View>

            <View style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: space.xxl, paddingTop: space.xl,
              minHeight: 460
            }}>
              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 2, fontWeight: '700', marginBottom: space.lg }}>
                SIGN IN
              </Text>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                leftIcon={<Mail size={16} color={theme.textMuted} />}
                error={errors.email}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                leftIcon={<Lock size={16} color={theme.textMuted} />}
                error={errors.password}
              />

              <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={6} style={{ alignSelf: 'flex-end', marginBottom: space.lg }}>
                <Text style={{ color: theme.accent, fontSize: fontSize.sm, fontWeight: '700' }}>Forgot password?</Text>
              </Pressable>

              <Button label={loading ? 'Signing in…' : 'Sign In'} onPress={onSubmit} loading={loading} variant="dark" size="lg" />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: space.lg }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.surfaceLine }} />
                <Text style={{ marginHorizontal: 12, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.4, fontWeight: '700' }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.surfaceLine }} />
              </View>

              <Button
                label="Use Face ID / Touch ID"
                onPress={tryBiometric}
                variant="outline"
                icon={<Fingerprint size={16} color={theme.text} />}
              />

              <View style={{ marginTop: space.xl, padding: space.md, backgroundColor: theme.surfaceMuted, borderRadius: radius.md, borderWidth: 1, borderColor: theme.surfaceLine }}>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                  Demo accounts
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable onPress={() => fillDemo('guest')} style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: theme.surface }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.sm, fontWeight: '700' }}>Guest</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>guest@maison.com</Text>
                  </Pressable>
                  <Pressable onPress={() => fillDemo('admin')} style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: theme.surface }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.sm, fontWeight: '700' }}>Admin</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>admin@luxury.com</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable onPress={() => navigation.navigate('Register')} style={{ alignSelf: 'center', marginTop: space.xl }}>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.md }}>
                  New to Maison?{' '}
                  <Text style={{ color: theme.accent, fontWeight: '800' }}>Create an account</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
