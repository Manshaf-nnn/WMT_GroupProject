import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme, fontSize, space, radius, palette } from '../../theme';
import { setOnboarded } from '../../services/storage';
import { Button } from '../../components/ui';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Curated, never crowded.',
    subtitle: 'A handpicked selection of the city\'s most exceptional tables.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    eyebrow: 'Welcome to Maison'
  },
  {
    title: 'Reserved in seconds.',
    subtitle: 'Pick a table, choose your time, confirm with a tap. We\'ll handle the rest.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
    eyebrow: 'Effortless Booking'
  },
  {
    title: 'Earn your seat at the top.',
    subtitle: 'Every meal builds your status — Bronze to Platinum, with perks at every tier.',
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1200&q=80',
    eyebrow: 'Loyalty Has Its Rewards'
  }
];

export default function OnboardingScreen({ navigation }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef(null);

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await setOnboarded();
    navigation.replace('Login');
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const renderSlide = ({ item }) => (
    <View style={{ width: W, height: H, justifyContent: 'flex-end' }}>
      <ExpoImage
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={420}
      />
      <LinearGradient
        colors={['rgba(14,14,16,0.0)', 'rgba(14,14,16,0.6)', 'rgba(14,14,16,0.95)']}
        style={[StyleSheet.absoluteFillObject, { top: '30%' }]}
      />
      <View style={{ padding: space.xxl, paddingBottom: 160 }}>
        <Text style={{ color: palette.gold, letterSpacing: 2, textTransform: 'uppercase', fontSize: fontSize.xs, fontWeight: '700', marginBottom: 14 }}>
          {item.eyebrow}
        </Text>
        <Text style={{ color: '#fff', fontSize: fontSize.display, fontWeight: '900', lineHeight: 50, marginBottom: 16 }}>
          {item.title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: fontSize.md, lineHeight: 24 }}>
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.charcoal }}>
      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={renderSlide}
      />
      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, paddingHorizontal: space.xxl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: space.lg }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width: i === index ? 26 : 6, height: 6, borderRadius: 3,
              marginHorizontal: 4,
              backgroundColor: i === index ? palette.gold : 'rgba(255,255,255,0.3)'
            }} />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? 'Begin' : 'Continue'}
          onPress={next}
          variant="primary"
          size="lg"
        />
        <Pressable onPress={finish} style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: fontSize.sm, fontWeight: '600' }}>
            Skip
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
