import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, radius, fontSize } from '../../theme';

export default function Stepper({ value = 1, onChange, min = 1, max = 20 }) {
  const theme = useTheme();

  const tick = (delta) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onChange?.(next);
    }
  };

  const Btn = ({ Icon, onPress, disabled }) => (
    <Pressable
      onPress={onPress} disabled={disabled} hitSlop={6}
      style={{
        width: 44, height: 44, borderRadius: radius.full,
        backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine,
        alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1
      }}
    >
      <Icon size={18} color={theme.text} />
    </Pressable>
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Btn Icon={Minus} onPress={() => tick(-1)} disabled={value <= min} />
      <Text style={{
        marginHorizontal: 24, color: theme.text,
        fontSize: fontSize.xxl, fontWeight: '800', minWidth: 48, textAlign: 'center'
      }}>{value}</Text>
      <Btn Icon={Plus} onPress={() => tick(1)} disabled={value >= max} />
    </View>
  );
}
