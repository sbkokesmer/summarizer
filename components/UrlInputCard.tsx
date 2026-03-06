import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface UrlInputCardProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

export function UrlInputCard({ value, onChangeText, disabled }: UrlInputCardProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Paste article URL..."
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>
      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        We will extract and summarize the article.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24, // Reduced slightly to accommodate chips
  },
  container: {
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '400',
    height: '100%',
  },
  helperText: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 8,
    marginLeft: 8,
  },
});
