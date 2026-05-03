import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { Star, MapPin, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fontSize, radius, shadow, space } from '../../theme';
import PriceTag from '../ui/PriceTag';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RestaurantCard({
  restaurant, onPress, variant = 'default', favorited = false, onToggleFavorite, index = 0
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(index * 80, withTiming(1, { duration: 380 }));
  }, []);

  const press = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 14 }]
  }));

  const onIn = () => { scale.value = withSpring(0.98, { damping: 18, stiffness: 320 }); };
  const onOut = () => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); };

  const HeroImg = ({ size }) => (
    <ExpoImage
      source={{ uri: restaurant.heroImage || restaurant.images?.[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' }}
      style={size}
      contentFit="cover"
      transition={300}
    />
  );

  if (variant === 'hero') {
    const w = SCREEN_WIDTH - 32;
    return (
      <Animated.View style={[enterStyle, press, { width: w, height: 380, borderRadius: radius.xl, overflow: 'hidden' }, shadow(theme, 2)]}>
        <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress}>
          <HeroImg size={{ width: '100%', height: '100%' }} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(14,14,16,0.92)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: '40%' }}
          />
          {onToggleFavorite ? (
            <Pressable
              hitSlop={10}
              onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onToggleFavorite(); }}
              style={{
                position: 'absolute', top: 16, right: 16, width: 40, height: 40,
                borderRadius: 20, backgroundColor: 'rgba(14,14,16,0.55)',
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Heart size={18} color="#fff" fill={favorited ? '#fff' : 'transparent'} strokeWidth={1.7} />
            </Pressable>
          ) : null}
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
                backgroundColor: 'rgba(200,164,92,0.95)', marginRight: 8
              }}>
                <Text style={{ color: '#0E0E10', fontSize: fontSize.xs, fontWeight: '800', letterSpacing: 0.6 }}>
                  FEATURED
                </Text>
              </View>
              <Text style={{ color: '#F6F1E7', fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.6 }}>
                {restaurant.cuisine?.toUpperCase()}
              </Text>
            </View>
            <Text style={{ color: '#fff', fontSize: fontSize.xxl, fontWeight: '900', marginBottom: 8 }} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={14} color="#C8A45C" fill="#C8A45C" />
              <Text style={{ color: '#fff', fontSize: fontSize.sm, marginLeft: 4, fontWeight: '700' }}>
                {restaurant.averageRating?.toFixed(1) || '—'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, marginLeft: 4 }}>
                ({restaurant.numReviews || 0})
              </Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 }} />
              <PriceTag value={restaurant.priceRange} size={fontSize.sm} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm }} numberOfLines={1}>
                {restaurant.location}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'compact') {
    return (
      <Animated.View style={[enterStyle, press, { width: 220, marginRight: space.md }]}>
        <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress}>
          <View style={[{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine }, shadow(theme, 1)]}>
            <HeroImg size={{ width: '100%', height: 130 }} />
            <View style={{ padding: 12 }}>
              <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Star size={11} color={theme.accent} fill={theme.accent} />
                <Text style={{ color: theme.textSoft, fontSize: fontSize.xs, marginLeft: 4 }}>
                  {restaurant.averageRating?.toFixed(1) || '—'} · {restaurant.cuisine}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[enterStyle, press, { width: '100%', marginBottom: space.lg }]}>
      <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress}>
        <View style={[{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine }, shadow(theme, 1)]}>
          <View style={{ position: 'relative' }}>
            <HeroImg size={{ width: '100%', height: 200 }} />
            {onToggleFavorite ? (
              <Pressable
                hitSlop={10}
                onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onToggleFavorite(); }}
                style={{
                  position: 'absolute', top: 12, right: 12, width: 36, height: 36,
                  borderRadius: 18, backgroundColor: 'rgba(14,14,16,0.55)',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Heart size={16} color="#fff" fill={favorited ? '#fff' : 'transparent'} strokeWidth={1.7} />
              </Pressable>
            ) : null}
          </View>
          <View style={{ padding: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: theme.accent, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' }}>
                {restaurant.cuisine}
              </Text>
              <Text style={{ color: theme.surfaceLine, marginHorizontal: 8 }}>•</Text>
              <PriceTag value={restaurant.priceRange} size={fontSize.xs} />
            </View>
            <Text style={{ color: theme.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: 6 }} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={13} color={theme.accent} fill={theme.accent} />
              <Text style={{ color: theme.text, fontSize: fontSize.sm, marginLeft: 4, fontWeight: '700' }}>
                {restaurant.averageRating?.toFixed(1) || '—'}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginLeft: 4 }}>
                ({restaurant.numReviews || 0} reviews)
              </Text>
              <View style={{ flex: 1 }} />
              <MapPin size={13} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginLeft: 4 }} numberOfLines={1}>
                {restaurant.location}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
