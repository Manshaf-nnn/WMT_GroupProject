import React from 'react';
import { View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useTheme, fontSize } from '../../theme';

export default function Avatar({ uri, name = '', size = 40 }) {
  const theme = useTheme();
  const initials = (name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  if (uri) {
    return (
      <ExpoImage
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: theme.surfaceLine
    }}>
      <Text style={{ color: theme.text, fontSize: size * 0.36, fontWeight: '700' }}>
        {initials || '?'}
      </Text>
    </View>
  );
}
