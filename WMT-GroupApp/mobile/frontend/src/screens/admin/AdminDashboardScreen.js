import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { Users, Calendar, Star, DollarSign, Building2, ChevronRight, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { useTheme, fontSize, space, radius, shadow, formatCurrency } from '../../theme';
import { ScreenContainer, Header, Card, Skeleton } from '../../components/ui';
import Sparkline from '../../components/admin/Sparkline';
import CountUp from '../../components/admin/CountUp';
import { adminApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function AdminDashboardScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setData(await adminApi.analytics()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const tiles = [
    { key: 'users', label: 'Users', value: data?.totals?.users, Icon: Users },
    { key: 'restaurants', label: 'Restaurants', value: data?.totals?.restaurants, Icon: Building2 },
    { key: 'today', label: 'Today\'s tables', value: data?.totals?.activeReservationsToday, Icon: Calendar },
    { key: 'reviews', label: 'Reviews', value: data?.totals?.reviews, Icon: Star }
  ];

  return (
    <ScreenContainer>
      <Header title="Admin" subtitle="Maison · system overview" />
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
      >
        {loading || !data ? (
          <>
            <Skeleton height={150} br={radius.lg} style={{ marginBottom: space.md }} />
            <Skeleton height={88} br={radius.md} style={{ marginBottom: space.md }} />
            <Skeleton height={88} br={radius.md} />
          </>
        ) : (
          <>
            <Card style={{ marginBottom: space.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DollarSign size={16} color={theme.accent} />
                <Text style={{ marginLeft: 8, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.4, fontWeight: '700' }}>REVENUE THIS MONTH</Text>
              </View>
              <CountUp
                to={data.totals.revenueThisMonth}
                style={{ color: theme.text, fontSize: 38, fontWeight: '900', marginTop: 6 }}
                format={(v) => formatCurrency(Math.round(v))}
              />
              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
                {formatCurrency(data.totals.revenueAllTime)} all-time
              </Text>
              <View style={{ marginTop: 14, alignItems: 'flex-start' }}>
                <Sparkline data={data.revenueLast7Days.map((d) => d.total)} width={300} height={70} />
                <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 4, letterSpacing: 1 }}>
                  LAST 7 DAYS
                </Text>
              </View>
            </Card>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: space.xl }}>
              {tiles.map((t) => (
                <View key={t.key} style={[{
                  flex: 1, minWidth: '47%',
                  backgroundColor: theme.surface, borderRadius: radius.lg,
                  borderWidth: 1, borderColor: theme.surfaceLine, padding: space.lg
                }, shadow(theme, 1)]}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surfaceMuted,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10
                  }}>
                    <t.Icon size={16} color={theme.accent} />
                  </View>
                  <CountUp to={t.value} style={{ color: theme.text, fontSize: fontSize.xxl, fontWeight: '900' }} />
                  <Text style={{ color: theme.textMuted, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>{t.label}</Text>
                </View>
              ))}
            </View>

            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
              Top restaurants
            </Text>
            <View style={{ marginBottom: space.xl }}>
              {data.topRestaurants.map((r, i) => (
                <View key={r._id} style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: theme.surface, padding: 12, borderRadius: radius.md,
                  borderWidth: 1, borderColor: theme.surfaceLine, marginBottom: 8
                }}>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', width: 22 }}>{i + 1}</Text>
                  <ExpoImage source={{ uri: r.heroImage }} style={{ width: 36, height: 36, borderRadius: 8 }} contentFit="cover" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }} numberOfLines={1}>{r.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Star size={11} color={theme.accent} fill={theme.accent} />
                      <Text style={{ marginLeft: 4, color: theme.textMuted, fontSize: fontSize.xs }}>
                        {r.averageRating?.toFixed(1)} · {r.numReviews} reviews
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
              Manage
            </Text>
            <NavRow icon={<Building2 size={16} color={theme.text} />} label="Restaurants" onPress={() => navigation.navigate('ManageRestaurants')} />
            <NavRow icon={<Calendar size={16} color={theme.text} />} label="Bookings" onPress={() => navigation.navigate('ManageBookings')} />
            <NavRow icon={<Users size={16} color={theme.text} />} label="Users" onPress={() => navigation.navigate('ManageUsers')} />
            <NavRow icon={<MessageSquare size={16} color={theme.text} />} label="Reviews" onPress={() => navigation.navigate('ManageReviews')} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const NavRow = ({ icon, label, onPress }) => {
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
