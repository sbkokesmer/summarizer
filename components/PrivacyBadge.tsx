import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PrivacyBadgeProps {
  title?: string;
  description?: string;
}

export function PrivacyBadge({ title, description }: PrivacyBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <ShieldCheck size={16} color="#34C759" />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title || "Zero-Data Retention"}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description || "Your files are processed securely and never stored."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
    paddingHorizontal: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
});
