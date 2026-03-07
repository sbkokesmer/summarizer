import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

const TABS = ['/(tabs)/index', '/(tabs)/translate', '/(tabs)/history'];
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 300;

interface Props {
  children: React.ReactNode;
}

export function SwipeTabView({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isNavigating = useRef(false);

  const translateX = useSharedValue(0);

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
    setTimeout(() => {
      isNavigating.current = false;
    }, 400);
  };

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      const canGoLeft = idx > 0;
      const canGoRight = idx < TABS.length - 1;

      if (e.translationX > 0 && !canGoLeft) {
        translateX.value = e.translationX * 0.08;
      } else if (e.translationX < 0 && !canGoRight) {
        translateX.value = e.translationX * 0.08;
      } else {
        translateX.value = e.translationX * 0.15;
      }
    })
    .onEnd((e) => {
      const canGoLeft = idx > 0;
      const canGoRight = idx < TABS.length - 1;

      const shouldGoLeft =
        canGoLeft &&
        (e.translationX > SWIPE_THRESHOLD || e.velocityX > VELOCITY_THRESHOLD);

      const shouldGoRight =
        canGoRight &&
        (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -VELOCITY_THRESHOLD);

      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });

      if (shouldGoLeft) {
        runOnJS(navigate)(idx - 1);
      } else if (shouldGoRight) {
        runOnJS(navigate)(idx + 1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
