import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export function Header() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <BlurView 
      intensity={isDark ? 10 : 15} // Extremely low opacity blur
      tint={isDark ? 'dark' : 'light'}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Summarize</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI Document Tool</Text>
      </View>
      
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
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    // Removed solid background color to merge with main background
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  proButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  proText: {
    fontSize: 15,
    fontWeight: '400',
  },
  iconButton: {
    padding: 4,
  },
});
