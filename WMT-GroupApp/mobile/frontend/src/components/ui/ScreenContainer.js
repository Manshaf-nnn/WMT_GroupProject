import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme';

export default function ScreenContainer({ children, edges = ['top'], padded = false, scrollable = false, kbAvoid = false }) {
  const theme = useTheme();
  const Inner = (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingHorizontal: padded ? 16 : 0 }}>
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      {kbAvoid ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {Inner}
        </KeyboardAvoidingView>
      ) : Inner}
    </SafeAreaView>
  );
}
