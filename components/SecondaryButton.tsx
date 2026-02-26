import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SecondaryButton({ title, onPress, disabled }: SecondaryButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: borderColor },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 20, // Increased softness
    backgroundColor: 'transparent', // Transparent background
    borderWidth: 1, // Thin border
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24, // Increased spacing
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '400', // Lighter weight
    letterSpacing: -0.2,
  },
});
