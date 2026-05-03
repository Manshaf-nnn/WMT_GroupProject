import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Stars, Tag, Skeleton, EmptyState, Button, Avatar } from '../../components/ui';
import { reviewApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function ManageReviewsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await reviewApi.all()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const hide = async (r) => {
    try { await reviewApi.hide(r._id); toast.show(r.hidden ? 'Visible' : 'Hidden', 'info'); load(); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const remove = (r) => {
    Alert.alert('Delete review?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await reviewApi.remove(r._id); toast.show('Deleted', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Reviews" subtitle={`${items.length} total`} />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={120} br={radius.lg} style={{ marginBottom: 8 }} />
          <Skeleton height={120} br={radius.lg} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState icon={<Star size={28} color={theme.textMuted} />} title="No reviews" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          renderItem={({ item }) => (
            <Card style={{ opacity: item.hidden ? 0.55 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Avatar uri={item.user?.profileImage} name={item.user?.name} size={36} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>{item.user?.name}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
                    on {item.restaurant?.name} · {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Stars value={item.rating} size={13} />
              </View>
              <Text style={{ color: theme.textSoft, fontSize: fontSize.sm, lineHeight: 20 }}>{item.comment}</Text>
              {item.tags?.length ? (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                  {item.tags.map((t) => <Tag key={t} label={t} />)}
                </View>
              ) : null}
              {item.reportCount > 0 ? (
                <Text style={{ color: theme.warning, fontSize: 11, marginTop: 6, fontWeight: '700' }}>
                  Reported {item.reportCount}×{item.hidden ? ' · auto-hidden' : ''}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
                <Button
                  label={item.hidden ? 'Show' : 'Hide'} variant="outline" size="sm" fullWidth={false}
                  icon={item.hidden ? <Eye size={11} color={theme.text} /> : <EyeOff size={11} color={theme.text} />}
                  onPress={() => hide(item)} style={{ flex: 1 }}
                />
                <Button
                  label="Delete" variant="outline" size="sm" fullWidth={false}
                  icon={<Trash2 size={11} color={theme.danger} />}
                  onPress={() => remove(item)} style={{ flex: 1, borderColor: theme.danger }}
                />
              </View>
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}
