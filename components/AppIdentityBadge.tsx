import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { FileText, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface Props {
  title: string;
}

export function AppIdentityBadge({ title }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Blurred Floating Capsule */}
        <View style={styles.capsuleWrapper}>
          <BlurView
            intensity={isDark ? 20 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.capsule,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
            ]}
          >
            <FileText size={14} color={colors.text} strokeWidth={2.5} />
            <Text style={[styles.capsuleText, { color: colors.text }]}>{title}</Text>
          </BlurView>
        </View>
        
        {/* Subtitle Identity */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          AI Document Tool
        </Text>
      </View>

      {/* Right Actions (Preserved from previous header) */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.proButton}
          onPress={() => router.push('/paywall')}
        >
          <Text style={[styles.proText, { color: colors.textSecondary }]}>Go Pro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={22} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 8,
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  capsuleWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  capsuleText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingLeft: 4,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 2,
  },
  proButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  proText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconButton: {
    padding: 4,
  },
});
