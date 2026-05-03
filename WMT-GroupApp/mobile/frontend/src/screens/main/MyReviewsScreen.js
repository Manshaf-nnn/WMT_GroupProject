import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { Star, Trash2, Edit2 } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Skeleton, EmptyState, Stars, Tag, Button } from '../../components/ui';
import { reviewApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function MyReviewsScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setReviews(await reviewApi.mine()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const remove = (id) => {
    Alert.alert('Delete review?', 'This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await reviewApi.remove(id); toast.show('Review deleted', 'success'); load(); }
          catch (err) { toast.show(friendlyError(err), 'error'); }
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Your reviews" />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
          <Skeleton height={140} br={radius.lg} />
        </View>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star size={28} color={theme.textMuted} />}
          title="No reviews yet"
          message="Your reviews appear here once you share an experience."
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.surfaceLine,
              padding: space.lg
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <ExpoImage source={{ uri: item.restaurant?.heroImage }} style={{ width: 44, height: 44, borderRadius: 10 }} contentFit="cover" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>{item.restaurant?.name || 'Restaurant'}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Stars value={item.rating} size={14} />
              </View>
              <Text style={{ color: theme.textSoft, fontSize: fontSize.sm, lineHeight: 20 }}>{item.comment}</Text>
              {item.tags?.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {item.tags.map((t) => <Tag key={t} label={t} />)}
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <Button
                  label="Edit"
                  variant="outline" fullWidth={false} size="sm"
                  icon={<Edit2 size={12} color={theme.text} />}
                  onPress={() => navigation.navigate('Review', { restaurantId: item.restaurant?._id, reviewId: item._id, initial: { rating: item.rating, comment: item.comment, tags: item.tags, photos: item.photos } })}
                />
                <Button
                  label="Delete"
                  variant="outline" fullWidth={false} size="sm"
                  icon={<Trash2 size={12} color={theme.danger} />}
                  onPress={() => remove(item._id)}
                  style={{ borderColor: theme.danger }}
                />
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
