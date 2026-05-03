import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import { COLORS } from '../theme/colors';

const CustomButton = ({ title, onPress, loading, variant = 'primary', style }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variant === 'secondary' ? styles.secondary : styles.primary,
        style
      ]} 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.background : COLORS.primary} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'secondary' ? styles.textSecondary : styles.textPrimary
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  textPrimary: {
    color: COLORS.background,
  },
  textSecondary: {
    color: COLORS.primary,
  },
});

export default CustomButton;
