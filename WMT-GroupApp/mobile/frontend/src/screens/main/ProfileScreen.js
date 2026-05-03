import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  Heart, MapPin, CreditCard, Receipt, Star, Settings as SettingsIcon, ShieldCheck,
  ChevronRight, LogOut, Edit2, Award
} from 'lucide-react-native';
import { useTheme, fontSize, space, radius, formatCurrency } from '../../theme';
import { ScreenContainer, Avatar, Card, LoyaltyRing, Tag } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { user, signOut, reload } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { reload?.(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    try { await reload?.(); } finally { setRefreshing(false); }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); await signOut(); } }
    ]);
  };

  if (!user) return <ScreenContainer><View /></ScreenContainer>;

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, alignItems: 'center' }}>
          <Avatar uri={user.profileImage} name={user.name} size={88} />
          <Text style={{ marginTop: 14, color: theme.text, fontSize: fontSize.xxl, fontWeight: '900' }}>{user.name}</Text>
          <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginTop: 4 }}>{user.email}</Text>
          {user.role === 'admin' ? (
            <View style={{ marginTop: 8 }}>
              <Tag label="ADMIN" variant="gold" icon={<ShieldCheck size={10} color={theme.accent} />} />
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
          <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700' }}>MAISON LOYALTY</Text>
            <View style={{ marginTop: 14 }}>
              <LoyaltyRing tier={user.loyaltyTier} spend={user.totalSpend} />
            </View>
            <View style={{ flexDirection: 'row', marginTop: space.lg, gap: 28 }}>
              <Stat label="Reservations" value={user.totalBookings || 0} />
              <Stat label="Lifetime" value={formatCurrency(user.totalSpend || 0)} />
              <Stat label="Tier" value={user.loyaltyTier} />
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: space.lg }}>
          <SectionTitle>Account</SectionTitle>
          <NavRow icon={<Edit2 size={16} color={theme.text} />} label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <NavRow icon={<Heart size={16} color={theme.text} />} label="Favorites" sub={`${user.favorites?.length || 0} saved`} onPress={() => navigation.navigate('Favorites')} />
          <NavRow icon={<MapPin size={16} color={theme.text} />} label="Address book" sub={`${user.addresses?.length || 0} saved`} onPress={() => navigation.navigate('Addresses')} />
          <NavRow icon={<CreditCard size={16} color={theme.text} />} label="Payment methods" sub={`${user.paymentMethods?.length || 0} cards`} onPress={() => navigation.navigate('PaymentMethods')} />

          <SectionTitle>History</SectionTitle>
          <NavRow icon={<Receipt size={16} color={theme.text} />} label="Billing & receipts" onPress={() => navigation.navigate('PaymentHistory')} />
          <NavRow icon={<Star size={16} color={theme.text} />} label="My reviews" onPress={() => navigation.navigate('MyReviews')} />

          {user.role === 'admin' ? (
            <>
              <SectionTitle>Admin</SectionTitle>
              <NavRow icon={<Award size={16} color={theme.accent} />} label="Open admin dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
            </>
          ) : null}

          <SectionTitle>Settings</SectionTitle>
          <NavRow icon={<SettingsIcon size={16} color={theme.text} />} label="App settings" onPress={() => navigation.navigate('Settings')} />

          <View style={{ marginTop: space.xl }}>
            <Pressable
              onPress={confirmSignOut}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                padding: 16, backgroundColor: theme.surface, borderRadius: radius.md,
                borderWidth: 1, borderColor: theme.danger
              }}
            >
              <LogOut size={16} color={theme.danger} />
              <Text style={{ marginLeft: 8, color: theme.danger, fontSize: fontSize.md, fontWeight: '800' }}>Sign Out</Text>
            </Pressable>
          </View>

          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: 18 }}>
            Maison · v1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const Stat = ({ label, value }) => {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginTop: 2 }}>{(label || '').toUpperCase()}</Text>
    </View>
  );
};

const SectionTitle = ({ children }) => {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginTop: space.xl, marginBottom: 8 }}>
      {children}
    </Text>
  );
};

const NavRow = ({ icon, label, sub, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', padding: 14,
        backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.surfaceLine,
        marginBottom: 8
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10, backgroundColor: theme.surfaceMuted,
        alignItems: 'center', justifyContent: 'center'
      }}>{icon}</View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>{label}</Text>
        {sub ? <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      <ChevronRight size={16} color={theme.textMuted} />
    </Pressable>
  );
};
