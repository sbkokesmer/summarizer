import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Mic, Square, Trash2, Play, Pause, Upload, Music, ShieldCheck } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { useTheme } from '@/context/ThemeContext';

export interface SelectedAudio {
  name: string;
  base64: string;
  mimeType: string;
}

interface AudioRecordCardProps {
  onRecordingChange?: (hasRecording: boolean, durationLabel: string, audio?: SelectedAudio) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

type AudioMode = 'record' | 'upload';
type RecordState = 'idle' | 'recording' | 'recorded' | 'playing';

export function AudioRecordCard({
  onRecordingChange,
  disabled,
  title = 'Record Audio',
  description = 'Tap to start recording your voice or meeting',
}: AudioRecordCardProps) {
  const { colors, isDark } = useTheme();

  const [mode, setMode] = useState<AudioMode>('record');
  const [state, setState] = useState<RecordState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [uploadedAudio, setUploadedAudio] = useState<SelectedAudio | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordedUriRef = useRef<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const webAudioBlobRef = useRef<Blob | null>(null);
  const elapsedRef = useRef(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const waveRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseRef.current?.stop();
      waveRef.current?.stop();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
    };
  }, []);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    pulseRef.current?.stop();
    Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const startWaves = () => {
    waveRef.current = Animated.loop(
      Animated.stagger(80, waveAnims.map((anim, i) =>
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.3 + (i % 3) * 0.25 + 0.1, duration: 300 + i * 40, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 300 + i * 40, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ))
    );
    waveRef.current.start();
  };

  const stopWaves = () => {
    waveRef.current?.stop();
    waveAnims.forEach((anim) => Animated.spring(anim, { toValue: 0.3, useNativeDriver: true }).start());
  };

  const startTimer = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRecordPress = () => {
    if (state === 'idle') {
      setShowPermissionDialog(true);
      return;
    }
    handleRecord();
  };

  const handlePermissionAccept = () => {
    setShowPermissionDialog(false);
    handleRecord();
  };

  const handleRecord = async () => {
    if (state === 'idle') {
      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioChunksRef.current = [];
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg';
          const mediaRecorder = new MediaRecorder(stream, { mimeType });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.start(100);
          setState('recording');
          startTimer();
          startPulse();
          startWaves();
        } catch {
          return;
        }
        return;
      }

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setState('recording');
      startTimer();
      startPulse();
      startWaves();

    } else if (state === 'recording') {
      stopTimer();
      stopPulse();
      stopWaves();

      if (Platform.OS === 'web') {
        const mr = mediaRecorderRef.current;
        if (!mr) return;

        mr.onstop = async () => {
          const mimeType = mr.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          webAudioBlobRef.current = blob;

          mr.stream.getTracks().forEach((t) => t.stop());

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
            const audio: SelectedAudio = { name: `recording.${ext}`, base64, mimeType };
            setState('recorded');
            onRecordingChange?.(true, formatTime(elapsedRef.current), audio);
          };
          reader.readAsDataURL(blob);
        };

        mr.stop();
        return;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordedUriRef.current = uri || null;
        recordingRef.current = null;
        if (uri) {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          const audio: SelectedAudio = { name: 'recording.m4a', base64, mimeType: 'audio/m4a' };
          setState('recorded');
          onRecordingChange?.(true, formatTime(elapsed), audio);
          return;
        }
      }
      setState('recorded');
      onRecordingChange?.(true, formatTime(elapsed));
    }
  };

  const handleDiscard = async () => {
    stopTimer();
    stopPulse();
    stopWaves();

    if (Platform.OS === 'web') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      webAudioBlobRef.current = null;
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
    } else {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      recordedUriRef.current = null;
    }

    setState('idle');
    setElapsed(0);
    setUploadedAudio(null);
    onRecordingChange?.(false, '');
  };

  const handlePlayPause = async () => {
    if (Platform.OS === 'web') {
      if (!webAudioBlobRef.current) return;
      if (state === 'playing') {
        webAudioRef.current?.pause();
        setState('recorded');
      } else {
        if (!webAudioRef.current) {
          const url = URL.createObjectURL(webAudioBlobRef.current);
          const audio = new window.Audio(url);
          audio.onended = () => {
            setState('recorded');
          };
          webAudioRef.current = audio;
        } else {
          webAudioRef.current.currentTime = 0;
        }
        try {
          await webAudioRef.current.play();
          setState('playing');
        } catch {
          const url = URL.createObjectURL(webAudioBlobRef.current);
          const audio = new window.Audio(url);
          audio.onended = () => setState('recorded');
          webAudioRef.current = audio;
          await webAudioRef.current.play();
          setState('playing');
        }
      }
      return;
    }

    if (!recordedUriRef.current) return;

    if (state === 'playing') {
      await soundRef.current?.pauseAsync();
      setState('recorded');
    } else {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (soundRef.current) {
        await soundRef.current.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: recordedUriRef.current });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) setState('recorded');
        });
        await sound.playAsync();
      }
      setState('playing');
    }
  };

  const handleUpload = async () => {
    if (disabled) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'video/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    let base64: string;

    if (Platform.OS === 'web') {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });
    } else {
      base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
    }

    const audio: SelectedAudio = { name: asset.name, base64, mimeType: asset.mimeType || 'audio/mpeg' };
    setUploadedAudio(audio);
    onRecordingChange?.(true, '--:--', audio);
  };

  const handleRemoveUpload = () => {
    setUploadedAudio(null);
    onRecordingChange?.(false, '');
  };

  const switchMode = (newMode: AudioMode) => {
    if (newMode === mode) return;
    handleDiscard();
    setMode(newMode);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '00')}`;
  };

  const getFileExt = (name: string) => name.split('.').pop()?.toUpperCase() || 'AUDIO';

  const accentColor = colors.text;
  const isRecording = state === 'recording';
  const hasRecording = state === 'recorded' || state === 'playing';

  return (
    <>
    <Modal visible={showPermissionDialog} transparent animationType="fade" onRequestClose={() => setShowPermissionDialog(false)}>
      <Pressable style={permStyles.backdrop} onPress={() => setShowPermissionDialog(false)}>
        <Pressable style={[permStyles.dialog, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]} onPress={(e) => e.stopPropagation()}>
          <View style={[permStyles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <ShieldCheck size={28} color={isDark ? '#FFFFFF' : '#000000'} />
          </View>
          <Text style={[permStyles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Microphone Access</Text>
          <Text style={[permStyles.body, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
            SummaLingua needs access to your microphone to record audio for summarization and translation. Audio recordings are stored only on your device and are sent securely for processing. They are never stored on our servers.
          </Text>
          <View style={permStyles.actions}>
            <TouchableOpacity style={[permStyles.btn, permStyles.btnSecondary, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} onPress={() => setShowPermissionDialog(false)} activeOpacity={0.7}>
              <Text style={[permStyles.btnText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>Not Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[permStyles.btn, permStyles.btnPrimary, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} onPress={handlePermissionAccept} activeOpacity={0.7}>
              <Text style={[permStyles.btnText, { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '600' }]}>Allow</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    <View style={[styles.wrapper, { backgroundColor: colors.card, borderColor: isRecording ? accentColor : colors.border, borderWidth: isRecording ? 1.5 : 1, borderStyle: hasRecording || uploadedAudio ? 'solid' : isRecording ? 'solid' : 'dashed' }]}>

      {!hasRecording && !uploadedAudio && (
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'record' && { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)' }]}
            onPress={() => switchMode('record')}
            activeOpacity={0.7}
          >
            <Mic size={13} color={mode === 'record' ? colors.text : colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.modeTabText, { color: mode === 'record' ? colors.text : colors.textSecondary, fontWeight: mode === 'record' ? '600' : '400' }]}>
              Record
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'upload' && { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)' }]}
            onPress={() => switchMode('upload')}
            activeOpacity={0.7}
          >
            <Upload size={13} color={mode === 'upload' ? colors.text : colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.modeTabText, { color: mode === 'upload' ? colors.text : colors.textSecondary, fontWeight: mode === 'upload' ? '600' : '400' }]}>
              Upload
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'record' && !hasRecording && (
        isRecording ? (
          <View style={styles.recordingContent}>
            <View style={styles.waveRow}>
              {waveAnims.map((anim, i) => (
                <Animated.View key={i} style={[styles.liveBar, { backgroundColor: accentColor, transform: [{ scaleY: anim }] }]} />
              ))}
            </View>
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(elapsed)}</Text>
            <Text style={[styles.recordingHint, { color: colors.textSecondary }]}>Recording... tap to stop</Text>
            <TouchableOpacity onPress={handleRecord} disabled={disabled} activeOpacity={0.7} style={[styles.stopButton, { borderColor: accentColor }]}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Square size={22} color={accentColor} fill={accentColor} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.idleContent}>
            <TouchableOpacity onPress={handleRecordPress} disabled={disabled} activeOpacity={0.7} style={[styles.actionButton, { backgroundColor: accentColor }]}>
              <Mic size={28} color={colors.background} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={[styles.idleTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>{description}</Text>
          </View>
        )
      )}

      {mode === 'upload' && !uploadedAudio && (
        <TouchableOpacity style={styles.idleContent} onPress={handleUpload} disabled={disabled} activeOpacity={0.7}>
          <View style={[styles.actionButton, { backgroundColor: accentColor }]}>
            <Upload size={26} color={colors.background} strokeWidth={1.8} />
          </View>
          <Text style={[styles.idleTitle, { color: colors.text }]}>Upload Audio File</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>MP3, M4A, WAV, AAC, MP4 supported</Text>
        </TouchableOpacity>
      )}

      {uploadedAudio && (
        <View style={styles.fileReadyContent}>
          <View style={[styles.fileIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Music size={22} color={accentColor} strokeWidth={1.8} />
            <Text style={[styles.fileExtBadge, { color: accentColor }]}>{getFileExt(uploadedAudio.name)}</Text>
          </View>
          <View style={styles.fileInfoCol}>
            <Text style={[styles.recordingLabel, { color: colors.text }]} numberOfLines={1}>{uploadedAudio.name}</Text>
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>Ready to process</Text>
          </View>
          <TouchableOpacity onPress={handleRemoveUpload} disabled={disabled} activeOpacity={0.7} style={styles.discardButton}>
            <Trash2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {hasRecording && (
        <View style={styles.recordedWrapper}>
          <View style={styles.playbackRow}>
            <TouchableOpacity onPress={handlePlayPause} disabled={disabled} activeOpacity={0.7} style={[styles.playButton, { backgroundColor: accentColor }]}>
              {state === 'playing' ? (
                <Pause size={18} color={colors.background} fill={colors.background} />
              ) : (
                <Play size={18} color={colors.background} fill={colors.background} />
              )}
            </TouchableOpacity>
            <View style={styles.playbackInfo}>
              <Text style={[styles.recordingLabel, { color: colors.text }]}>Recording ready</Text>
              <Text style={[styles.durationText, { color: colors.textSecondary }]}>{formatTime(elapsed)}</Text>
            </View>
            <TouchableOpacity onPress={handleDiscard} disabled={disabled} activeOpacity={0.7} style={styles.discardButton}>
              <Trash2 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.waveformStatic}>
            {Array.from({ length: 28 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.8 + 1.2) * 20);
              return <View key={i} style={[styles.waveBar, { height: h, backgroundColor: i < 14 ? accentColor : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />;
            })}
          </View>
        </View>
      )}
    </View>
    </>
  );
}

const permStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dialog: {
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondary: {},
  btnPrimary: {},
  btnText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  wrapper: { borderRadius: 20, marginBottom: 24, overflow: 'hidden' },
  modeTabs: { flexDirection: 'row', margin: 8, padding: 3, borderRadius: 14, backgroundColor: 'transparent', gap: 2 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 7, borderRadius: 11 },
  modeTabText: { fontSize: 13 },
  idleContent: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, gap: 10 },
  actionButton: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  idleTitle: { fontSize: 15, fontWeight: '600' },
  idleDesc: { fontSize: 13, textAlign: 'center' },
  recordingContent: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, gap: 8, width: '100%' },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, marginBottom: 4 },
  liveBar: { width: 4, height: 32, borderRadius: 2 },
  timerText: { fontSize: 28, fontWeight: '300', letterSpacing: 2, fontVariant: ['tabular-nums'] },
  recordingHint: { fontSize: 13 },
  stopButton: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  fileReadyContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  fileIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 2 },
  fileExtBadge: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  fileInfoCol: { flex: 1 },
  recordedWrapper: { padding: 16 },
  playbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 12 },
  playButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playbackInfo: { flex: 1 },
  recordingLabel: { fontSize: 15, fontWeight: '600' },
  durationText: { fontSize: 13, marginTop: 2 },
  discardButton: { padding: 8 },
  waveformStatic: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 28, width: '100%', paddingHorizontal: 4 },
  waveBar: { flex: 1, borderRadius: 2, minHeight: 3 },
});
