import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Button, Tag, Skeleton, EmptyState } from '../../components/ui';
import { bookingApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const FILTERS = ['all', 'pending', 'approved', 'cancelled', 'completed'];

const STATUS_TONE = {
  pending: '#D4A437', approved: '#2F9E6E', rejected: '#D45A5A',
  cancelled: '#9aa0a6', completed: '#4d6cb0', waitlist: '#D4A437'
};

export default function ManageBookingsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await bookingApi.all()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = filter === 'all' ? items : items.filter((b) => b.status === filter);

  const setStatus = async (b, status) => {
    try {
      await bookingApi.adminUpdate(b._id, { status });
      toast.show(`Marked ${status}`, 'success'); load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  return (
    <ScreenContainer>
      <Header title="Bookings" subtitle={`${items.length} total`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: space.lg, marginBottom: space.md }}>
        {FILTERS.map((f) => (
          <Tag key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: 8 }} />
          <Skeleton height={140} br={radius.lg} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={28} color={theme.textMuted} />} title={`No ${filter} bookings`} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{
                  color: STATUS_TONE[item.status] || theme.textMuted,
                  fontSize: 10, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase'
                }}>{item.status}</Text>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }} numberOfLines={1}>
                {item.restaurant?.name}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                {item.user?.name} · {item.user?.email}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Calendar size={11} color={theme.textMuted} />
                <Text style={{ marginLeft: 4, color: theme.textSoft, fontSize: fontSize.xs }}>
                  {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Clock size={11} color={theme.textMuted} style={{ marginLeft: 12 }} />
                <Text style={{ marginLeft: 4, color: theme.textSoft, fontSize: fontSize.xs }}>{item.time}</Text>
                <Text style={{ color: theme.textMuted, marginHorizontal: 6 }}>·</Text>
                <Text style={{ color: theme.textSoft, fontSize: fontSize.xs }}>{item.guests} guests</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
                {item.status === 'pending' || item.status === 'waitlist' ? (
                  <>
                    <Button label="Approve" variant="primary" size="sm" fullWidth={false} icon={<CheckCircle2 size={12} color={theme.textInverse} />} onPress={() => setStatus(item, 'approved')} style={{ flex: 1 }} />
                    <Button label="Reject" variant="outline" size="sm" fullWidth={false} icon={<XCircle size={12} color={theme.danger} />} onPress={() => setStatus(item, 'rejected')} style={{ flex: 1, borderColor: theme.danger }} />
                  </>
                ) : item.status === 'approved' ? (
                  <Button label="Mark Completed" variant="outline" size="sm" onPress={() => setStatus(item, 'completed')} />
                ) : null}
              </View>
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}
