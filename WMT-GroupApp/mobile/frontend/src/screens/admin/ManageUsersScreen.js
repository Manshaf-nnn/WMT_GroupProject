import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, ShieldCheck, Pause, Play, Trash2 } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Tag, Avatar, Skeleton, EmptyState, Button } from '../../components/ui';
import { authApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function ManageUsersScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setUsers(await authApi.adminListUsers()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (u) => {
    try { await authApi.adminToggleSuspend(u._id); toast.show(u.suspended ? 'Reactivated' : 'Suspended', 'info'); load(); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const remove = (u) => {
    Alert.alert('Delete user?', `${u.email} will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await authApi.adminDeleteUser(u._id); toast.show('Deleted', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  const filtered = users.filter((u) => {
    if (!q.trim()) return true;
    const ql = q.toLowerCase();
    return u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql);
  });

  return (
    <ScreenContainer>
      <Header title="Users" subtitle={`${users.length} accounts`} />
      <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
          paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.full,
          borderWidth: 1, borderColor: theme.surfaceLine
        }}>
          <Search size={14} color={theme.textMuted} />
          <TextInput
            value={q} onChangeText={setQ}
            placeholder="Search name or email"
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, marginLeft: 8, color: theme.text, fontSize: fontSize.md }}
          />
        </View>
      </View>
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={70} br={radius.md} style={{ marginBottom: 8 }} />
          <Skeleton height={70} br={radius.md} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar uri={item.profileImage} name={item.name} size={40} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }} numberOfLines={1}>{item.name}</Text>
                    {item.role === 'admin' ? (
                      <View style={{ marginLeft: 6 }}>
                        <Tag label="ADMIN" variant="gold" icon={<ShieldCheck size={9} color={theme.accent} />} />
                      </View>
                    ) : null}
                    {item.suspended ? (
                      <Text style={{ marginLeft: 8, color: theme.danger, fontSize: 10, letterSpacing: 1, fontWeight: '700' }}>SUSPENDED</Text>
                    ) : null}
                  </View>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>{item.email} · {item.loyaltyTier}</Text>
                </View>
              </View>
              {item.role !== 'admin' ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
                  <Button
                    label={item.suspended ? 'Reactivate' : 'Suspend'}
                    variant="outline" fullWidth={false} size="sm"
                    icon={item.suspended ? <Play size={11} color={theme.text} /> : <Pause size={11} color={theme.text} />}
                    onPress={() => toggle(item)} style={{ flex: 1 }}
                  />
                  <Button
                    label="Delete" variant="outline" fullWidth={false} size="sm"
                    icon={<Trash2 size={11} color={theme.danger} />}
                    onPress={() => remove(item)} style={{ flex: 1, borderColor: theme.danger }}
                  />
                </View>
              ) : null}
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}
