import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, FlatList } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { ChevronLeft, Heart, Share2, Star, Clock, MapPin, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, fontSize, space, radius, formatCurrency } from '../../theme';
import { Skeleton, Tag, Button, Stars, Avatar, EmptyState } from '../../components/ui';
import { restaurantApi, reviewApi, authApi, friendlyError } from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/ui/Toast';
import SommelierModal from '../../components/SommelierModal';

const { width: W } = Dimensions.get('window');
const TABS = ['Overview', 'Menu', 'Reviews', 'Hours'];

export default function RestaurantDetailScreen({ route, navigation }) {
  const theme = useTheme();
  const { id } = route.params || {};
  const { user, setUser, reload } = useAuth();
  const toast = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sommelierOpen, setSommelierOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, rs] = await Promise.all([restaurantApi.get(id), reviewApi.list(id)]);
      setRestaurant(r); setReviews(rs);
    } catch (err) {
      toast.show(friendlyError(err, 'Could not load restaurant'), 'error');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isFavorite = user?.favorites?.some((f) => (f._id || f) === id);

  const toggleFavorite = async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setUser((u) => ({
      ...u,
      favorites: isFavorite ? u.favorites.filter((f) => (f._id || f) !== id) : [...(u.favorites || []), id]
    }));
    try { await authApi.toggleFavorite(id); }
    catch { toast.show('Could not save favorite', 'error'); reload?.(); }
  };

  const openMaps = () => {
    if (!restaurant) return;
    const q = encodeURIComponent(`${restaurant.address || restaurant.location} ${restaurant.city || ''}`);
    Linking.openURL(`https://maps.apple.com/?q=${q}`).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${q}`)
    );
  };

  if (loading || !restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Skeleton height={360} />
        <View style={{ padding: space.lg }}>
          <Skeleton height={28} width={'70%'} style={{ marginBottom: 12 }} />
          <Skeleton height={16} width={'40%'} style={{ marginBottom: 24 }} />
          <Skeleton height={120} br={radius.lg} />
        </View>
      </View>
    );
  }

  const images = restaurant.images?.length ? restaurant.images : [restaurant.heroImage].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: 380 }}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={images}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
            renderItem={({ item }) => (
              <ExpoImage source={{ uri: item }} style={{ width: W, height: 380 }} contentFit="cover" transition={300} />
            )}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {images.length > 1 ? (
            <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
              {images.map((_, i) => (
                <View key={i} style={{
                  width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 3, marginHorizontal: 3,
                  backgroundColor: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.4)'
                }} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={{
          backgroundColor: theme.bg, marginTop: -28,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingTop: space.xl, paddingHorizontal: space.lg, minHeight: 600
        }}>
          <Text style={{ color: theme.accent, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {restaurant.cuisine}
          </Text>
          <Text style={{ color: theme.text, fontSize: fontSize.xxxl, fontWeight: '900', marginTop: 4 }}>
            {restaurant.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md, flexWrap: 'wrap' }}>
            <Star size={13} color={theme.accent} fill={theme.accent} />
            <Text style={{ color: theme.text, fontSize: fontSize.sm, marginLeft: 4, fontWeight: '700' }}>
              {restaurant.averageRating?.toFixed(1) || '—'}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginLeft: 4 }}>
              ({restaurant.numReviews || 0})
            </Text>
            <Text style={{ color: theme.surfaceLine, marginHorizontal: 8 }}>•</Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.sm }}>{restaurant.priceRange}</Text>
            <Text style={{ color: theme.surfaceLine, marginHorizontal: 8 }}>•</Text>
            <MapPin size={12} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginLeft: 4 }}>{restaurant.location}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
            <Button label="Reserve" variant="primary" onPress={() => navigation.navigate('Booking', { restaurantId: id })} fullWidth={false} style={{ flex: 1 }} />
            <Button
              label=""
              variant="outline"
              fullWidth={false}
              icon={<Heart size={18} color={isFavorite ? theme.accent : theme.text} fill={isFavorite ? theme.accent : 'transparent'} />}
              onPress={toggleFavorite}
              style={{ width: 56 }}
            />
            <Button
              label=""
              variant="outline"
              fullWidth={false}
              icon={<Sparkles size={18} color={theme.accent} />}
              onPress={() => setSommelierOpen(true)}
              style={{ width: 56 }}
            />
          </View>

          <View style={{ flexDirection: 'row', marginTop: space.xl, marginBottom: space.lg }}>
            {TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setTab(t); }}
                style={{ marginRight: 18 }}
                hitSlop={6}
              >
                <Text style={{
                  color: tab === t ? theme.text : theme.textMuted,
                  fontSize: fontSize.md, fontWeight: '700'
                }}>{t}</Text>
                {tab === t ? (
                  <View style={{ height: 2, backgroundColor: theme.accent, marginTop: 6, borderRadius: 1 }} />
                ) : null}
              </Pressable>
            ))}
          </View>

          {tab === 'Overview' ? (
            <View style={{ paddingBottom: 120 }}>
              <Text style={{ color: theme.textSoft, fontSize: fontSize.md, lineHeight: 24 }}>
                {restaurant.description}
              </Text>

              {restaurant.tags?.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.lg }}>
                  {restaurant.tags.slice(0, 8).map((t) => <Tag key={t} label={t} variant="gold" />)}
                </View>
              ) : null}

              <Pressable onPress={openMaps} style={{
                marginTop: space.xl, padding: space.lg, borderRadius: radius.lg,
                backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine,
                flexDirection: 'row', alignItems: 'center'
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center'
                }}>
                  <MapPin size={18} color={theme.accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>{restaurant.address || restaurant.location}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                    {restaurant.city} · Tap to open in Maps
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          {tab === 'Menu' ? (
            <View style={{ paddingBottom: 120 }}>
              {(restaurant.menu || []).map((section) => (
                <View key={section._id || section.title} style={{ marginBottom: space.xl }}>
                  <Text style={{ color: theme.accent, fontSize: fontSize.xs, letterSpacing: 1.8, fontWeight: '700', textTransform: 'uppercase', marginBottom: space.md }}>
                    {section.title}
                  </Text>
                  {section.items.map((item) => (
                    <View key={item._id || item.name} style={{ marginBottom: space.md, flexDirection: 'row', alignItems: 'center' }}>
                      {item.image ? (
                        <ExpoImage source={{ uri: item.image }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" />
                      ) : null}
                      <View style={{ flex: 1, marginLeft: item.image ? 12 : 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                        {item.description ? (
                          <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginTop: 4 }} numberOfLines={2}>
                            {item.description}
                          </Text>
                        ) : null}
                        {item.tags?.length ? (
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                            {item.tags.slice(0, 2).map((t) => (
                              <View key={t} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(200,164,92,0.15)', borderWidth: 1, borderColor: 'rgba(200,164,92,0.4)' }}>
                                <Text style={{ color: theme.accent, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {tab === 'Reviews' ? (
            <View style={{ paddingBottom: 120 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md }}>
                <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>{reviews.length} reviews</Text>
                <Pressable onPress={() => navigation.navigate('Review', { restaurantId: id })}>
                  <Text style={{ color: theme.accent, fontSize: fontSize.sm, fontWeight: '700' }}>Write a review</Text>
                </Pressable>
              </View>
              {reviews.length === 0 ? (
                <EmptyState
                  icon={<Star size={28} color={theme.textMuted} />}
                  title="Be the first"
                  message="Share your experience with the Maison community."
                  action={<Button label="Write a review" onPress={() => navigation.navigate('Review', { restaurantId: id })} />}
                />
              ) : (
                reviews.map((r) => (
                  <View key={r._id} style={{ marginBottom: space.lg, paddingBottom: space.lg, borderBottomWidth: 1, borderBottomColor: theme.surfaceLine }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Avatar uri={r.user?.profileImage} name={r.user?.name} size={36} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>{r.user?.name || 'Guest'}</Text>
                        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Stars value={r.rating} size={14} />
                    </View>
                    <Text style={{ color: theme.textSoft, fontSize: fontSize.sm, lineHeight: 22 }}>{r.comment}</Text>
                    {r.tags?.length ? (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                        {r.tags.map((t) => <Tag key={t} label={t} />)}
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          ) : null}

          {tab === 'Hours' ? (
            <View style={{ paddingBottom: 120 }}>
              {(restaurant.hours || []).map((h) => (
                <View key={h.day} style={{
                  flexDirection: 'row', justifyContent: 'space-between',
                  paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.surfaceLine
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={{ marginLeft: 8, color: theme.text, fontSize: fontSize.md, fontWeight: '600' }}>{h.day}</Text>
                  </View>
                  <Text style={{ color: theme.textSoft, fontSize: fontSize.md }}>
                    {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.md }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(`https://maison.app/r/${id}`)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Share2 size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      <SommelierModal visible={sommelierOpen} onClose={() => setSommelierOpen(false)} restaurant={restaurant} />
    </View>
  );
}
