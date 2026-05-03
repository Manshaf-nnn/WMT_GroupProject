import React from 'react';
import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';

export default function Stars({ value = 0, size = 16, color, onChange, max = 5, gap = 2 }) {
  const theme = useTheme();
  const filled = color || theme.accent;
  const empty = theme.surfaceLine;

  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: max }).map((_, i) => {
        const starIdx = i + 1;
        const isFilled = value >= starIdx;
        const isHalf = !isFilled && value >= starIdx - 0.5;
        const node = (
          <Star
            size={size}
            color={isFilled || isHalf ? filled : empty}
            fill={isFilled ? filled : isHalf ? filled : 'transparent'}
            strokeWidth={1.5}
          />
        );
        if (!onChange) return <View key={i} style={{ marginRight: gap }}>{node}</View>;
        return (
          <Pressable
            key={i}
            hitSlop={6}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onChange(starIdx);
            }}
            style={{ marginRight: gap }}
          >{node}</Pressable>
        );
      })}
    </View>
  );
}
