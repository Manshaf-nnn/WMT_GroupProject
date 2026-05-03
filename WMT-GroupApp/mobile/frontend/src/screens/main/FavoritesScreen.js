import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, space, radius } from '../../theme';
import { ScreenContainer, Header, Skeleton, EmptyState, Button } from '../../components/ui';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { restaurantApi, authApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../store/AuthContext';

export default function FavoritesScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { user, setUser, reload } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await restaurantApi.list();
      const ids = (user?.favorites || []).map((f) => f._id || f);
      setRestaurants(all.filter((r) => ids.includes(r._id)));
    } catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user?.favorites]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { reload?.(); }, []));

  const toggleFavorite = async (id) => {
    setUser((u) => ({ ...u, favorites: u.favorites.filter((f) => (f._id || f) !== id) }));
    try { await authApi.toggleFavorite(id); }
    catch { toast.show('Could not update', 'error'); reload?.(); }
  };

  return (
    <ScreenContainer>
      <Header title="Favorites" subtitle={`${restaurants.length} saved`} />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
          <Skeleton height={140} br={radius.lg} />
        </View>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} color={theme.textMuted} />}
          title="No favorites yet"
          message="Tap the heart on any restaurant to save it here."
          action={<Button label="Discover Restaurants" onPress={() => navigation.navigate('Home')} />}
        />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          renderItem={({ item, index }) => (
            <RestaurantCard
              restaurant={item}
              index={index}
              favorited={true}
              onToggleFavorite={() => toggleFavorite(item._id)}
              onPress={() => navigation.navigate('RestaurantDetail', { id: item._id })}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
