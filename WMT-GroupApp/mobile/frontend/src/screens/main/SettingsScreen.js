import React from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import * as Linking from 'expo-linking';
import { ChevronRight, Moon, Sun, Bell, Shield, FileText, ExternalLink, Heart } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card } from '../../components/ui';
import { API_URL, APP_NAME } from '../../services/config';

export default function SettingsScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <ScreenContainer>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
          Appearance
        </Text>
        <Card style={{ marginBottom: space.lg, flexDirection: 'row', alignItems: 'center' }}>
          {scheme === 'dark' ? <Moon size={16} color={theme.accent} /> : <Sun size={16} color={theme.accent} />}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>
              {scheme === 'dark' ? 'Dark mode' : 'Light mode'}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
              Follows your device · change in iOS Settings
            </Text>
          </View>
        </Card>

        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
          Notifications
        </Text>
        <Card style={{ marginBottom: space.lg, flexDirection: 'row', alignItems: 'center' }}>
          <Bell size={16} color={theme.accent} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>Reservation reminders</Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
              You'll be reminded 2 hours before each booking.
            </Text>
          </View>
        </Card>

        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
          About
        </Text>
        <Row icon={<Shield size={16} color={theme.text} />} label="Privacy Policy" onPress={() => Linking.openURL('https://example.com/privacy')} />
        <Row icon={<FileText size={16} color={theme.text} />} label="Terms of Service" onPress={() => Linking.openURL('https://example.com/terms')} />
        <Row icon={<Heart size={16} color={theme.text} />} label="Send feedback" onPress={() => Linking.openURL('mailto:hello@maison.app')} />

        <View style={{ marginTop: space.xl, alignItems: 'center' }}>
          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
            {APP_NAME} · v1.0.0 · {API_URL.replace('/api', '')}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const Row = ({ icon, label, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8,
      backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.surfaceLine
    }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ flex: 1, marginLeft: 12, color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>{label}</Text>
      <ChevronRight size={16} color={theme.textMuted} />
    </Pressable>
  );
};
