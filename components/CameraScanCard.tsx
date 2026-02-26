import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { Camera, RefreshCw, CheckCircle, Upload, FileImage, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Colors } from '@/constants/Colors';

export interface ScannedImage {
  name: string;
  base64: string;
}

interface CameraScanCardProps {
  onScanChange?: (hasResult: boolean, image?: ScannedImage) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

type CameraMode = 'camera' | 'upload';

export function CameraScanCard({
  onScanChange,
  disabled,
  title = 'Scan Document',
  description = 'Point your camera at text to extract and process it',
}: CameraScanCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [mode, setMode] = useState<CameraMode>('camera');
  const [image, setImage] = useState<ScannedImage | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanAnimation = () => {
    scanLineAnim.setValue(0);
    scanLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    scanLoopRef.current.start();
  };

  const stopScanAnimation = () => {
    scanLoopRef.current?.stop();
    scanLineAnim.setValue(0);
  };

  const showResult = (scannedImage: ScannedImage) => {
    fadeAnim.setValue(0);
    setImage(scannedImage);
    onScanChange?.(true, scannedImage);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const handleCameraCapture = async () => {
    if (disabled) return;
    setIsScanning(true);
    startScanAnimation();
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      stopScanAnimation();
      setIsScanning(false);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    stopScanAnimation();
    setIsScanning(false);
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const base64 = asset.base64 || await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
    showResult({ name: 'camera_scan.jpg', base64 });
  };

  const handleUpload = async () => {
    if (disabled) return;
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const base64 = asset.base64 || await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
    const fileName = asset.fileName || `image_${Date.now()}.jpg`;
    showResult({ name: fileName, base64 });
  };

  const handleRemove = () => {
    setImage(null);
    onScanChange?.(false);
  };

  const switchMode = (newMode: CameraMode) => {
    if (newMode === mode) return;
    handleRemove();
    setMode(newMode);
  };

  const accentColor = colors.text;

  if (isScanning) {
    const translateY = scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 96] });
    return (
      <View style={[styles.container, styles.scanningContainer, { backgroundColor: colors.card, borderColor: accentColor }]}>
        <View style={[styles.scanFrame, { borderColor: accentColor }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: accentColor }]} />
          <Animated.View style={[styles.scanLine, { backgroundColor: accentColor, transform: [{ translateY }] }]} />
        </View>
        <Text style={[styles.scanningText, { color: colors.textSecondary }]}>Opening camera...</Text>
      </View>
    );
  }

  if (image) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: fadeAnim }]}>
        <View style={styles.scannedHeader}>
          <View style={styles.scannedTitleRow}>
            <CheckCircle size={18} color={accentColor} strokeWidth={2} />
            <Text style={[styles.scannedTitle, { color: colors.text }]} numberOfLines={1}>
              {image.name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRemove} disabled={disabled} activeOpacity={0.7} style={styles.retakeButton}>
            <Trash2 size={16} color={colors.textSecondary} />
            <Text style={[styles.retakeText, { color: colors.textSecondary }]}>Remove</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.previewBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            Image ready — will be processed with GPT-4o Vision
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed' }]}>
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'camera' && { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)' }]}
          onPress={() => switchMode('camera')}
          activeOpacity={0.7}
        >
          <Camera size={13} color={mode === 'camera' ? colors.text : colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.modeTabText, { color: mode === 'camera' ? colors.text : colors.textSecondary, fontWeight: mode === 'camera' ? '600' : '400' }]}>
            Camera
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

      {mode === 'camera' && (
        <View style={styles.idleContent}>
          <TouchableOpacity onPress={handleCameraCapture} disabled={disabled} activeOpacity={0.7} style={[styles.actionButton, { backgroundColor: accentColor }]}>
            <Camera size={28} color={colors.background} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={[styles.idleTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      )}

      {mode === 'upload' && (
        <TouchableOpacity style={styles.idleContent} onPress={handleUpload} disabled={disabled} activeOpacity={0.7}>
          <View style={[styles.actionButton, { backgroundColor: accentColor }]}>
            <FileImage size={26} color={colors.background} strokeWidth={1.8} />
          </View>
          <Text style={[styles.idleTitle, { color: colors.text }]}>Upload Image</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>JPG, PNG, HEIC supported</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 20, marginBottom: 24, overflow: 'hidden', minHeight: 140, justifyContent: 'center', alignItems: 'center' },
  scanningContainer: { borderWidth: 1.5, borderStyle: 'solid', minHeight: 180 },
  modeTabs: { flexDirection: 'row', margin: 8, padding: 3, borderRadius: 14, backgroundColor: 'transparent', gap: 2, alignSelf: 'stretch' },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 7, borderRadius: 11 },
  modeTabText: { fontSize: 13 },
  idleContent: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, gap: 10 },
  actionButton: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  idleTitle: { fontSize: 15, fontWeight: '600' },
  idleDesc: { fontSize: 13, textAlign: 'center' },
  scanFrame: { width: 200, height: 120, borderWidth: 0, position: 'relative', marginBottom: 16, overflow: 'hidden' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: 'transparent' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  scanLine: { position: 'absolute', left: 4, right: 4, height: 2, borderRadius: 1, opacity: 0.8 },
  scanningText: { fontSize: 13, fontWeight: '500' },
  scannedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, paddingTop: 16, marginBottom: 10 },
  scannedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  scannedTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  retakeButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  retakeText: { fontSize: 13, fontWeight: '500' },
  previewBox: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 12, width: '100%', paddingHorizontal: 28 },
  previewText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
