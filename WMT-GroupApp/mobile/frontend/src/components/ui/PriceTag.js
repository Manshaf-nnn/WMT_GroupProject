import React from 'react';
import { Text } from 'react-native';
import { useTheme, fontSize } from '../../theme';

export default function PriceTag({ value = '$$', size = fontSize.sm }) {
  const theme = useTheme();
  const total = 4;
  const filled = (value || '$').length;
  return (
    <Text style={{ color: theme.textMuted, fontSize: size, fontWeight: '700', letterSpacing: 1 }}>
      <Text style={{ color: theme.accent }}>{'$'.repeat(filled)}</Text>
      <Text style={{ color: theme.surfaceLine }}>{'$'.repeat(total - filled)}</Text>
    </Text>
  );
}
