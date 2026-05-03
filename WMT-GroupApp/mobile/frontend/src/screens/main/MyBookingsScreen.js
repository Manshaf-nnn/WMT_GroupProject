import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Calendar, ChevronRight, MapPin, Clock } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Skeleton, EmptyState, Button } from '../../components/ui';
import { bookingApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const STATUS_TONE = {
  pending: '#D4A437', approved: '#2F9E6E', rejected: '#D45A5A',
  cancelled: '#9aa0a6', completed: '#4d6cb0', waitlist: '#D4A437'
};

const tabs = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' }
];

export default function MyBookingsScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setBookings(await bookingApi.myBookings()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const now = Date.now();
  const filtered = bookings.filter((b) => {
    const isPast = new Date(b.date).getTime() < now - 24 * 3600 * 1000 || ['completed', 'cancelled', 'rejected'].includes(b.status);
    return tab === 'upcoming' ? !isPast : isPast;
  });

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm }}>
        <Text style={{ color: theme.accent, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700' }}>RESERVATIONS</Text>
        <Text style={{ color: theme.text, fontSize: fontSize.xxl, fontWeight: '900', marginTop: 2 }}>
          Your tables
        </Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: space.lg, marginBottom: space.md }}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{ marginRight: 18 }}
            hitSlop={6}
          >
            <Text style={{
              color: tab === t.key ? theme.text : theme.textMuted,
              fontSize: fontSize.md, fontWeight: '700'
            }}>{t.label}</Text>
            {tab === t.key ? (
              <View style={{ height: 2, backgroundColor: theme.accent, marginTop: 6, borderRadius: 1 }} />
            ) : null}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={120} br={radius.lg} style={{ marginBottom: space.md }} />
          <Skeleton height={120} br={radius.lg} style={{ marginBottom: space.md }} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} color={theme.textMuted} />}
          title={tab === 'upcoming' ? 'No upcoming tables' : 'No past visits yet'}
          message={tab === 'upcoming' ? 'Reserve your next experience.' : 'Your dining history will appear here.'}
          action={tab === 'upcoming' ? <Button label="Discover Restaurants" onPress={() => navigation.navigate('Home')} /> : null}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 140 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('BookingDetail', { id: item._id })}>
              <View style={{
                backgroundColor: theme.surface, borderRadius: radius.lg,
                borderWidth: 1, borderColor: theme.surfaceLine,
                overflow: 'hidden', flexDirection: 'row'
              }}>
                <ExpoImage source={{ uri: item.restaurant?.heroImage || item.restaurant?.images?.[0] }} style={{ width: 110, height: 130 }} contentFit="cover" />
                <View style={{ flex: 1, padding: space.md, justifyContent: 'space-between' }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{
                        color: STATUS_TONE[item.status] || theme.textMuted,
                        fontSize: 10, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase'
                      }}>{item.status}</Text>
                      <ChevronRight size={14} color={theme.textMuted} />
                    </View>
                    <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginTop: 4 }} numberOfLines={1}>
                      {item.restaurant?.name || 'Restaurant'}
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Calendar size={11} color={theme.textMuted} />
                      <Text style={{ color: theme.textSoft, fontSize: fontSize.xs, marginLeft: 4 }}>
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                      <Clock size={11} color={theme.textMuted} style={{ marginLeft: 10 }} />
                      <Text style={{ color: theme.textSoft, fontSize: fontSize.xs, marginLeft: 4 }}>{item.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <MapPin size={11} color={theme.textMuted} />
                      <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginLeft: 4 }} numberOfLines={1}>
                        {item.guests} {item.guests === 1 ? 'guest' : 'guests'} · {item.restaurant?.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
}
