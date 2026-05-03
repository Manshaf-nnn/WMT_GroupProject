import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, space, fontSize, radius } from '../../theme';

export default function EmptyState({ icon, title, message, action }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: space.xxl }}>
      {icon ? (
        <View style={{
          width: 88, height: 88, borderRadius: radius.full,
          backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center',
          marginBottom: space.lg, borderWidth: 1, borderColor: theme.surfaceLine
        }}>{icon}</View>
      ) : null}
      <Text style={{
        color: theme.text, fontSize: fontSize.xl, fontWeight: '700',
        textAlign: 'center', marginBottom: 6
      }}>{title}</Text>
      {message ? (
        <Text style={{
          color: theme.textMuted, fontSize: fontSize.md, textAlign: 'center',
          maxWidth: 320, lineHeight: 22
        }}>{message}</Text>
      ) : null}
      {action ? <View style={{ marginTop: space.lg, width: '100%', maxWidth: 280 }}>{action}</View> : null}
    </View>
  );
}
