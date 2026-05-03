import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';

export default function Divider({ vertical = false, style }) {
  const theme = useTheme();
  return (
    <View style={[
      vertical
        ? { width: 1, alignSelf: 'stretch', backgroundColor: theme.surfaceLine }
        : { height: 1, alignSelf: 'stretch', backgroundColor: theme.surfaceLine },
      style
    ]} />
  );
}
