import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  loadingTitle?: string;
}

export function PrimaryButton({ title, onPress, isLoading, disabled, loadingTitle }: PrimaryButtonProps) {
  const { isDark } = useTheme();

  const bgColor = isDark ? '#FFFFFF' : '#000000';
  const textColor = isDark ? '#000000' : '#FFFFFF';
  const spinnerColor = isDark ? '#00000066' : '#ffffff66';
  const spinnerTrackColor = isDark ? '#00000022' : '#ffffff22';

  const rotation = useSharedValue(0);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 900, easing: Easing.linear }),
        -1,
        false
      );
      dot1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 }),
          withTiming(0.3, { duration: 600 })
        ),
        -1,
        false
      );
      dot2.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 300 }),
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1,
        false
      );
      dot3.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600 }),
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
      rotation.value = 0;
      dot1.value = 0.3;
      dot2.value = 0.3;
      dot3.value = 0.3;
    }
  }, [isLoading]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor }, disabled && !isLoading && styles.disabledOpacity]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <Animated.View style={[styles.spinnerOuter, { borderColor: spinnerTrackColor }, spinnerStyle]}>
            <View style={[styles.spinnerDot, { backgroundColor: textColor }]} />
          </Animated.View>
          <Text style={[styles.text, { color: textColor, marginLeft: 10 }]}>
            {loadingTitle ?? title}
          </Text>
          <View style={styles.dotsRow}>
            <Animated.Text style={[styles.dot, { color: textColor }, dot1Style]}>•</Animated.Text>
            <Animated.Text style={[styles.dot, { color: textColor }, dot2Style]}>•</Animated.Text>
            <Animated.Text style={[styles.dot, { color: textColor }, dot3Style]}>•</Animated.Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinnerOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  spinnerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: -1,
  },
  dotsRow: {
    flexDirection: 'row',
    marginLeft: 6,
    gap: 2,
  },
  dot: {
    fontSize: 16,
    lineHeight: 20,
  },
});
