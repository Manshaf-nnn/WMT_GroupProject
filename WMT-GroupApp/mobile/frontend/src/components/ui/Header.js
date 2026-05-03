import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, space, fontSize } from '../../theme';

export default function Header({ title, subtitle, back = true, right, transparent = false, onBack }) {
  const theme = useTheme();
  const nav = useNavigation();

  return (
    <View style={{
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      backgroundColor: transparent ? 'transparent' : theme.bg,
      flexDirection: 'row', alignItems: 'center'
    }}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (onBack ? onBack() : nav.canGoBack() && nav.goBack())}
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: theme.surface,
            borderWidth: 1, borderColor: theme.surfaceLine,
            alignItems: 'center', justifyContent: 'center', marginRight: space.md
          }}
        >
          <ChevronLeft size={20} color={theme.text} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        {title ? (
          <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
        ) : null}
        {subtitle ? (
          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={{ marginLeft: space.md }}>{right}</View> : null}
    </View>
  );
}
