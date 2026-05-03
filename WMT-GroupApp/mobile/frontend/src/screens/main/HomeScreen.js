import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell, MapPin, Sparkles, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, fontSize, space, palette, radius, shadow } from '../../theme';
import { ScreenContainer, Skeleton, Tag, Avatar } from '../../components/ui';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { restaurantApi, authApi, friendlyError } from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { CITY } from '../../services/config';

const { width: W } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { user, reload, setUser } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, cs] = await Promise.all([restaurantApi.list(), restaurantApi.cuisines()]);
      setRestaurants(list);
      setCuisines(['All', ...cs]);
    } catch (err) {
      toast.show(friendlyError(err, 'Could not load home feed'), 'error');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { reload?.(); }, []));

  const featured = useMemo(() => restaurants.filter((r) => r.featured), [restaurants]);
  const filtered = useMemo(() => activeCuisine === 'All' ? restaurants : restaurants.filter((r) => r.cuisine === activeCuisine), [restaurants, activeCuisine]);

  const recommendations = useMemo(() => {
    if (!user?.favoriteCuisines?.length) return restaurants.slice(0, 6);
    const matches = restaurants.filter((r) => user.favoriteCuisines.includes(r.cuisine));
    if (matches.length >= 3) return matches.slice(0, 6);
    return [...matches, ...restaurants.filter((r) => !matches.includes(r))].slice(0, 6);
  }, [restaurants, user?.favoriteCuisines]);

  const isFavorite = (id) => user?.favorites?.some((f) => (f._id || f) === id);

  const toggleFavorite = async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const wasFav = isFavorite(id);
    setUser((u) => ({
      ...u,
      favorites: wasFav ? u.favorites.filter((f) => (f._id || f) !== id) : [...(u.favorites || []), id]
    }));
    try { await authApi.toggleFavorite(id); }
    catch { toast.show('Could not save favorite', 'error'); reload?.(); }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={theme.accent}
          />
        }
      >
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={12} color={theme.accent} />
              <Text style={{ marginLeft: 4, color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                {CITY}
              </Text>
            </View>
            <Text style={{ color: theme.text, fontSize: fontSize.xxl, fontWeight: '900', marginTop: 2 }}>
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Hello'}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8} accessibilityLabel="Open profile">
            <Avatar uri={user?.profileImage} name={user?.name} size={42} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('SearchModal')}
          accessibilityRole="button"
          style={{ marginHorizontal: space.lg, marginBottom: space.lg }}
        >
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: theme.surface, paddingHorizontal: space.lg, paddingVertical: 14,
            borderRadius: radius.full, borderWidth: 1, borderColor: theme.surfaceLine
          }}>
            <Search size={16} color={theme.textMuted} />
            <Text style={{ marginLeft: 10, color: theme.textMuted, fontSize: fontSize.md, flex: 1 }}>
              Search restaurants, cuisines…
            </Text>
            <Sparkles size={14} color={theme.accent} />
          </View>
        </Pressable>

        {loading ? (
          <View style={{ paddingHorizontal: space.lg }}>
            <Skeleton height={380} br={radius.xl} style={{ marginBottom: space.lg }} />
            <Skeleton height={32} width={'60%'} style={{ marginBottom: space.lg }} />
            <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
            <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
          </View>
        ) : (
          <>
            {featured.length > 0 ? (
              <View style={{ marginBottom: space.xxl }}>
                <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
                  <Text style={{ color: theme.accent, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 2 }}>FEATURED TONIGHT</Text>
                  <Text style={{ color: theme.text, fontSize: fontSize.xxl, fontWeight: '900', marginTop: 2 }}>
                    Tables of distinction
                  </Text>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featured}
                  keyExtractor={(it) => it._id}
                  contentContainerStyle={{ paddingHorizontal: space.lg }}
                  ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  snapToAlignment="start"
                  snapToInterval={W - 32 + 16}
                  decelerationRate="fast"
                  renderItem={({ item, index }) => (
                    <RestaurantCard
                      restaurant={item}
                      variant="hero"
                      index={index}
                      favorited={isFavorite(item._id)}
                      onToggleFavorite={() => toggleFavorite(item._id)}
                      onPress={() => navigation.navigate('RestaurantDetail', { id: item._id })}
                    />
                  )}
                />
              </View>
            ) : null}

            <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={cuisines}
                keyExtractor={(it) => it}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                renderItem={({ item }) => (
                  <Tag
                    label={item}
                    active={activeCuisine === item}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setActiveCuisine(item);
                    }}
                  />
                )}
              />
            </View>

            {recommendations.length > 0 && activeCuisine === 'All' ? (
              <View style={{ marginBottom: space.xxl }}>
                <View style={{ paddingHorizontal: space.lg, marginBottom: space.md, flexDirection: 'row', alignItems: 'center' }}>
                  <Sparkles size={14} color={theme.accent} />
                  <Text style={{ marginLeft: 6, color: theme.text, fontSize: fontSize.lg, fontWeight: '800' }}>
                    Picked for you
                  </Text>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={recommendations}
                  keyExtractor={(it) => it._id}
                  contentContainerStyle={{ paddingHorizontal: space.lg }}
                  renderItem={({ item, index }) => (
                    <RestaurantCard
                      restaurant={item}
                      variant="compact"
                      index={index}
                      onPress={() => navigation.navigate('RestaurantDetail', { id: item._id })}
                    />
                  )}
                />
              </View>
            ) : null}

            <View style={{ paddingHorizontal: space.lg, paddingBottom: 120 }}>
              <View style={{ marginBottom: space.lg, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '800' }}>
                  {activeCuisine === 'All' ? 'All restaurants' : activeCuisine}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>{filtered.length} places</Text>
              </View>
              {filtered.map((item, idx) => (
                <RestaurantCard
                  key={item._id}
                  restaurant={item}
                  index={idx}
                  favorited={isFavorite(item._id)}
                  onToggleFavorite={() => toggleFavorite(item._id)}
                  onPress={() => navigation.navigate('RestaurantDetail', { id: item._id })}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
