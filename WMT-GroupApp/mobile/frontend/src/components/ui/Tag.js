import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme, radius, fontSize } from '../../theme';

export default function Tag({ label, active = false, onPress, variant = 'default', icon }) {
  const theme = useTheme();
  const bg = active
    ? theme.accent
    : variant === 'gold'
      ? 'rgba(200,164,92,0.12)'
      : theme.surfaceMuted;
  const fg = active ? theme.textInverse : variant === 'gold' ? theme.accent : theme.text;
  const border = active ? theme.accent : variant === 'gold' ? 'rgba(200,164,92,0.4)' : theme.surfaceLine;

  const content = (
    <View style={{
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
      backgroundColor: bg, borderWidth: 1, borderColor: border,
      flexDirection: 'row', alignItems: 'center'
    }}>
      {icon ? <View style={{ marginRight: 6 }}>{icon}</View> : null}
      <Text style={{ color: fg, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}
