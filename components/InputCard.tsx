import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface InputCardProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function InputCard({ value, onChangeText, placeholder = "Paste or type your text...", editable = true }: InputCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    minHeight: 120,
    padding: 16,
    marginBottom: 24, // Reduced slightly to accommodate chips
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    minHeight: 88,
  },
});
