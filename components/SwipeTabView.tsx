import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useRouter, usePathname } from 'expo-router';

const TABS = ['/(tabs)/index', '/(tabs)/translate', '/(tabs)/history'];

interface Props {
  children: React.ReactNode;
}

export function SwipeTabView({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = TABS.findIndex((t) => {
    if (pathname === '/' || pathname === '/index') return t === '/(tabs)/index';
    return pathname.includes(t.replace('/(tabs)', ''));
  });

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .minDistance(40)
    .onEnd((e) => {
      const isHorizontal = Math.abs(e.velocityX) > Math.abs(e.velocityY) * 1.2;
      if (!isHorizontal) return;

      const idx = currentIndex < 0 ? 0 : currentIndex;

      if (e.velocityX < -400 && idx < TABS.length - 1) {
        router.push(TABS[idx + 1] as any);
      } else if (e.velocityX > 400 && idx > 0) {
        router.push(TABS[idx - 1] as any);
      }
    });

  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
