import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Input, Button, Card } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { authApi, friendlyError } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const r = await authApi.forgotPassword(email.trim().toLowerCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (r.tempPassword) {
        setTempPassword(r.tempPassword);
        toast.show('Temporary password generated.', 'success');
      } else {
        toast.show(r.message || 'If the email exists, a reset has been sent.', 'info');
      }
    } catch (err) {
      toast.show(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Forgot Password" subtitle="We'll get you back in" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: space.md }}>
          <Text style={{ color: theme.textSoft, fontSize: fontSize.md, lineHeight: 22, marginBottom: space.xl }}>
            Enter the email tied to your Maison account. We'll generate a temporary password you can use to sign in and reset.
          </Text>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            leftIcon={<Mail size={16} color={theme.textMuted} />}
          />
          <Button label={loading ? 'Sending…' : 'Reset Password'} onPress={submit} loading={loading} variant="dark" size="lg" />

          {tempPassword ? (
            <Card style={{ marginTop: space.xl, borderColor: theme.accent }}>
              <Text style={{ color: theme.accent, letterSpacing: 1.4, fontSize: fontSize.xs, fontWeight: '700', textTransform: 'uppercase' }}>
                Temporary Password
              </Text>
              <Text selectable style={{
                color: theme.text, fontSize: fontSize.xxl, fontWeight: '900',
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                marginTop: 6, letterSpacing: 1
              }}>
                {tempPassword}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginTop: 8, lineHeight: 20 }}>
                Use this to sign in once, then change your password from your Profile.
              </Text>
              <Button
                label="Back to Sign In"
                onPress={() => navigation.goBack()}
                variant="primary"
                style={{ marginTop: space.lg }}
              />
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
