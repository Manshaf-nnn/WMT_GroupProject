import React, { useRef } from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme, radius, space, fontSize, shadow } from '../../theme';

export default function Button({
  label, onPress, variant = 'primary', size = 'md', icon, iconRight,
  loading = false, disabled = false, style, fullWidth = true, haptic = 'light'
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = () => { scale.value = withSpring(0.97, { damping: 18, stiffness: 320 }); };
  const handleOut = () => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); };
  const handlePress = (e) => {
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (haptic === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onPress?.(e);
  };

  const palette = (() => {
    if (variant === 'primary') return { bg: theme.accent, fg: theme.textInverse, border: theme.accent };
    if (variant === 'dark') return { bg: theme.primary, fg: theme.textInverse, border: theme.primary };
    if (variant === 'outline') return { bg: 'transparent', fg: theme.text, border: theme.surfaceLine };
    if (variant === 'ghost') return { bg: 'transparent', fg: theme.text, border: 'transparent' };
    if (variant === 'danger') return { bg: theme.danger, fg: '#fff', border: theme.danger };
    if (variant === 'gold-outline') return { bg: 'transparent', fg: theme.accent, border: theme.accent };
    return { bg: theme.accent, fg: theme.textInverse, border: theme.accent };
  })();

  const sizing = (() => {
    if (size === 'sm') return { paddingV: 10, paddingH: 16, fontSize: fontSize.sm, iconSize: 14 };
    if (size === 'lg') return { paddingV: 18, paddingH: 22, fontSize: fontSize.lg, iconSize: 18 };
    return { paddingV: 14, paddingH: 18, fontSize: fontSize.md, iconSize: 16 };
  })();

  return (
    <Animated.View style={[fullWidth && { width: '100%' }, animStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled || loading}
        onPress={handlePress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        style={[
          styles.btn,
          { backgroundColor: palette.bg, borderColor: palette.border, paddingVertical: sizing.paddingV, paddingHorizontal: sizing.paddingH, opacity: disabled ? 0.55 : 1 },
          variant !== 'ghost' && shadow(theme, variant === 'outline' ? 0 : 1)
        ]}
      >
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {icon ? <View style={{ marginRight: space.sm }}>{icon}</View> : null}
            <Text style={{
              color: palette.fg, fontSize: sizing.fontSize, fontWeight: '700',
              letterSpacing: variant === 'gold-outline' ? 1.4 : 0.4,
              textTransform: variant === 'gold-outline' ? 'uppercase' : 'none'
            }}>{label}</Text>
            {iconRight ? <View style={{ marginLeft: space.sm }}>{iconRight}</View> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }
});
