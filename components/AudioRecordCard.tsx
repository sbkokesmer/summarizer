import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface AudioRecordCardProps {
  onRecordingChange?: (hasRecording: boolean, durationLabel: string) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

type RecordState = 'idle' | 'recording' | 'recorded' | 'playing';

export function AudioRecordCard({
  onRecordingChange,
  disabled,
  title = 'Record Audio',
  description = 'Tap to start recording your voice or meeting',
}: AudioRecordCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [state, setState] = useState<RecordState>('idle');
  const [elapsed, setElapsed] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.3))
  ).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const waveRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseRef.current?.stop();
      waveRef.current?.stop();
    };
  }, []);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    pulseRef.current?.stop();
    Animated.spring(pulseAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const startWaves = () => {
    waveRef.current = Animated.loop(
      Animated.stagger(
        80,
        waveAnims.map((anim, i) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + (i % 3) * 0.25 + Math.random() * 0.2,
              duration: 300 + i * 40,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300 + i * 40,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    waveRef.current.start();
  };

  const stopWaves = () => {
    waveRef.current?.stop();
    waveAnims.forEach((anim) =>
      Animated.spring(anim, { toValue: 0.3, useNativeDriver: true }).start()
    );
  };

  const handleRecord = () => {
    if (state === 'idle') {
      setState('recording');
      setElapsed(0);
      startPulse();
      startWaves();
      timerRef.current = setInterval(() => {
        setElapsed((p) => p + 1);
      }, 1000);
    } else if (state === 'recording') {
      if (timerRef.current) clearInterval(timerRef.current);
      stopPulse();
      stopWaves();
      setState('recorded');
      onRecordingChange?.(true, formatTime(elapsed));
    }
  };

  const handleDiscard = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopPulse();
    stopWaves();
    setState('idle');
    setElapsed(0);
    onRecordingChange?.(false, '');
  };

  const handlePlayPause = () => {
    setState((prev) => (prev === 'playing' ? 'recorded' : 'playing'));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const accentColor = colors.text;
  const isRecording = state === 'recording';
  const hasRecording = state === 'recorded' || state === 'playing';

  if (hasRecording || state === 'playing') {
    return (
      <View
        style={[
          styles.container,
          styles.recordedContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.playbackRow}>
          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.playButton, { backgroundColor: accentColor }]}
          >
            {state === 'playing' ? (
              <Pause size={18} color={colors.background} fill={colors.background} />
            ) : (
              <Play size={18} color={colors.background} fill={colors.background} />
            )}
          </TouchableOpacity>
          <View style={styles.playbackInfo}>
            <Text style={[styles.recordingLabel, { color: colors.text }]}>
              Recording ready
            </Text>
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>
              {formatTime(elapsed)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDiscard}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.discardButton}
          >
            <Trash2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.waveformStatic}>
          {Array.from({ length: 28 }).map((_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 0.8 + 1.2) * 20);
            return (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor:
                      i < 14
                        ? accentColor
                        : isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.1)',
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isRecording ? accentColor : colors.border,
          borderWidth: isRecording ? 1.5 : 1,
          borderStyle: isRecording ? 'solid' : 'dashed',
        },
      ]}
    >
      {isRecording ? (
        <View style={styles.recordingContent}>
          <View style={styles.waveRow}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.liveBar,
                  {
                    backgroundColor: accentColor,
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.timerText, { color: colors.text }]}>
            {formatTime(elapsed)}
          </Text>
          <Text style={[styles.recordingHint, { color: colors.textSecondary }]}>
            Recording... tap to stop
          </Text>
          <TouchableOpacity
            onPress={handleRecord}
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.stopButton, { borderColor: accentColor }]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Square size={22} color={accentColor} fill={accentColor} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.idleContent}>
          <TouchableOpacity
            onPress={handleRecord}
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.micButton, { backgroundColor: accentColor }]}
          >
            <Mic size={28} color={colors.background} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={[styles.idleTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordedContainer: {
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 16,
    minHeight: 100,
  },
  idleContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 10,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  idleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  idleDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  recordingContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    width: '100%',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    marginBottom: 4,
  },
  liveBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  recordingHint: {
    fontSize: 13,
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackInfo: {
    flex: 1,
  },
  recordingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 13,
    marginTop: 2,
  },
  discardButton: {
    padding: 8,
  },
  waveformStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
    width: '100%',
    paddingHorizontal: 4,
  },
  waveBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 3,
  },
});
