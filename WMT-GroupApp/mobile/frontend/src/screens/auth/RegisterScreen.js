import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, fontSize, space, palette } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { friendlyError } from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const { signUp } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Tell us your name';
    if (!email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const u = await signUp({ name: name.trim(), email: email.trim().toLowerCase(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show(`Welcome to Maison, ${u.name.split(' ')[0]}.`, 'success');
    } catch (err) {
      toast.show(friendlyError(err, 'Could not create account'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.charcoal }}>
      <StatusBar style="light" />
      <ExpoImage
        source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80' }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(14,14,16,0.55)', 'rgba(14,14,16,0.95)', '#0E0E10']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }}
      />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: space.xxl, paddingTop: space.lg, paddingBottom: 28 }}>
              <Text style={{ color: palette.gold, fontSize: fontSize.xs, letterSpacing: 3, fontWeight: '700' }}>
                MAISON
              </Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 8, lineHeight: 38 }}>
                Become a member.
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.md, marginTop: 8 }}>
                It takes a moment.
              </Text>
            </View>

            <View style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: space.xxl, paddingTop: space.xl
            }}>
              <Input label="Full Name" value={name} onChangeText={setName} placeholder="Olivia Carter" autoCapitalize="words" leftIcon={<User size={16} color={theme.textMuted} />} error={errors.name} />
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" leftIcon={<Mail size={16} color={theme.textMuted} />} error={errors.email} />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry leftIcon={<Lock size={16} color={theme.textMuted} />} error={errors.password} />
              <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Repeat password" secureTextEntry leftIcon={<Lock size={16} color={theme.textMuted} />} error={errors.confirm} />

              <Button label={loading ? 'Creating account…' : 'Create Account'} onPress={onSubmit} loading={loading} variant="dark" size="lg" />

              <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginTop: space.xl }}>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.md }}>
                  Already have an account?{' '}
                  <Text style={{ color: theme.accent, fontWeight: '800' }}>Sign in</Text>
                </Text>
              </Pressable>

              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: space.lg, lineHeight: 18 }}>
                By creating an account, you agree to our{'\n'}Terms of Service and Privacy Policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
