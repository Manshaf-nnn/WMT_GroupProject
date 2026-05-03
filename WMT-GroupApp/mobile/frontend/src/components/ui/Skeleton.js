import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme, radius } from '../../theme';

export default function Skeleton({ width = '100%', height = 16, style, br = radius.sm }) {
  const theme = useTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[
      { width, height, borderRadius: br, backgroundColor: theme.surfaceMuted },
      aStyle, style
    ]} />
  );
}
