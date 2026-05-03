import React from 'react';
import { View } from 'react-native';
import { useTheme, radius, shadow, space } from '../../theme';

export default function Card({ children, style, padded = true, elevation = 1, onPress }) {
  const theme = useTheme();
  return (
    <View style={[
      {
        backgroundColor: theme.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: theme.surfaceLine,
        padding: padded ? space.lg : 0
      },
      shadow(theme, elevation),
      style
    ]}>
      {children}
    </View>
  );
}
