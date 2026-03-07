import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.88, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      const stagger = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.delay(600 - delay),
          ])
        );

      stagger(dotAnim1, 0).start();
      stagger(dotAnim2, 200).start();
      stagger(dotAnim3, 400).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      dotAnim1.stopAnimation();
      dotAnim1.setValue(0.3);
      dotAnim2.stopAnimation();
      dotAnim2.setValue(0.3);
      dotAnim3.stopAnimation();
      dotAnim3.setValue(0.3);
    }
  }, [isLoading]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 16 }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: bgColor },
          (disabled || isLoading) && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <Text style={[styles.text, { color: textColor }]}>
            {loadingTitle ?? title}
            {'  '}
            <Animated.Text style={{ opacity: dotAnim1, color: textColor }}>•</Animated.Text>
            <Animated.Text style={{ opacity: dotAnim2, color: textColor }}>•</Animated.Text>
            <Animated.Text style={{ opacity: dotAnim3, color: textColor }}>•</Animated.Text>
          </Text>
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
