import React, { useRef } from 'react';
import { StyleSheet, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

const TABS = ['/(tabs)/index', '/(tabs)/translate', '/(tabs)/history', '/(tabs)/profile'];
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.6;

interface Props {
  children: React.ReactNode;
}

export function SwipeTabView({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isNavigating = useRef(false);
  const translateX = useSharedValue(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const isLocked = useRef(false);

  const currentIndex = TABS.findIndex((t) => {
    if (pathname === '/' || pathname === '/index') return t === '/(tabs)/index';
    return pathname.includes(t.replace('/(tabs)', ''));
  });
  const idx = currentIndex < 0 ? 0 : currentIndex;

  const navigate = (targetIndex: number) => {
    if (isNavigating.current) return;
    if (targetIndex < 0 || targetIndex >= TABS.length) return;
    if (targetIndex === idx) return;
    isNavigating.current = true;
    router.replace(TABS[targetIndex] as any);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        if (isLocked.current) return false;
        const dx = Math.abs(g.dx);
        const dy = Math.abs(g.dy);
        if (dx < 10) return false;
        if (dy > dx * 0.5) {
          isLocked.current = true;
          return false;
        }
        return dx > dy * 1.5 && dx > 12;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (_, g) => {
        startX.current = g.x0;
        startY.current = g.y0;
        isHorizontal.current = null;
        isLocked.current = false;
      },
      onPanResponderMove: (_, g) => {
        const dx = Math.abs(g.dx);
        const dy = Math.abs(g.dy);
        if (isHorizontal.current === null) {
          if (dx < 10 && dy < 10) return;
          isHorizontal.current = dx > dy * 1.5;
          if (!isHorizontal.current) {
            isLocked.current = true;
            return;
          }
        }
        if (!isHorizontal.current) return;
        const canGoLeft = idx > 0;
        const canGoRight = idx < TABS.length - 1;
        const tx = g.dx;
        if (tx > 0 && !canGoLeft) {
          translateX.value = tx * 0.06;
        } else if (tx < 0 && !canGoRight) {
          translateX.value = tx * 0.06;
        } else {
          translateX.value = tx * 0.12;
        }
      },
      onPanResponderRelease: (_, g) => {
        isLocked.current = false;
        if (!isHorizontal.current) return;
        const canGoLeft = idx > 0;
        const canGoRight = idx < TABS.length - 1;
        const shouldGoLeft = canGoLeft && (g.dx > SWIPE_THRESHOLD || g.vx > VELOCITY_THRESHOLD);
        const shouldGoRight = canGoRight && (g.dx < -SWIPE_THRESHOLD || g.vx < -VELOCITY_THRESHOLD);
        translateX.value = withSpring(0, { damping: 20, stiffness: 200, mass: 0.5 });
        isHorizontal.current = null;
        if (shouldGoLeft) navigate(idx - 1);
        else if (shouldGoRight) navigate(idx + 1);
      },
      onPanResponderTerminate: () => {
        isLocked.current = false;
        translateX.value = withSpring(0, { damping: 20, stiffness: 200, mass: 0.5 });
        isHorizontal.current = null;
      },
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
