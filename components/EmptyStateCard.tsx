import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface EmptyStateCardProps {
  title?: string;
  description?: string;
}

export function EmptyStateCard({ title, description }: EmptyStateCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Sparkles size={24} color={colors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title || "Ready to Process"}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description || "Select an input method above and configure your desired output to get started."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
