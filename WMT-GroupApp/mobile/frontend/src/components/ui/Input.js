import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme, radius, space, fontSize } from '../../theme';

export default function Input({
  label, value, onChangeText, placeholder, secureTextEntry, error, leftIcon, rightIcon,
  keyboardType = 'default', autoCapitalize = 'none', autoCorrect = false, multiline = false,
  numberOfLines, returnKeyType, onSubmitEditing, editable = true, maxLength
}) {
  const theme = useTheme();
  const [focus, setFocus] = useState(false);
  const [hide, setHide] = useState(!!secureTextEntry);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      shake.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const borderColor = error ? theme.danger : focus ? theme.accent : theme.surfaceLine;

  return (
    <Animated.View style={[{ width: '100%', marginBottom: space.lg }, animStyle]}>
      {label ? (
        <Text style={{
          color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700',
          letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6
        }}>{label}</Text>
      ) : null}
      <View style={[styles.wrap, { borderColor, backgroundColor: theme.surface }]}>
        {leftIcon ? <View style={{ marginRight: space.sm }}>{leftIcon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={hide}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, color: theme.text, fontSize: fontSize.md,
            paddingVertical: multiline ? 8 : 0,
            minHeight: multiline ? 96 : undefined,
            textAlignVertical: multiline ? 'top' : 'center'
          }}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHide((h) => !h)} hitSlop={8}>
            {hide ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
          </Pressable>
        ) : rightIcon || null}
      </View>
      {error ? (
        <Text style={{ color: theme.danger, fontSize: fontSize.xs, marginTop: 6 }}>{error}</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center'
  }
});
