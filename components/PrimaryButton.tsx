import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ title, onPress, isLoading, disabled }: PrimaryButtonProps) {
  const { isDark } = useTheme();
  
  // Solid high-contrast background
  const bgColor = isDark ? '#FFFFFF' : '#000000';
  const textColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        (disabled || isLoading) && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 20, // Increased softness
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16, // Increased spacing
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '500', // Lighter weight
    letterSpacing: -0.3,
  },
});
