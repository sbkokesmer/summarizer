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
import { Camera, ScanLine, RefreshCw, CheckCircle, Upload, ImageIcon, FileImage, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface CameraScanCardProps {
  onScanChange?: (hasResult: boolean, preview?: string, fileName?: string) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

type CameraMode = 'camera' | 'upload';
type ScanState = 'idle' | 'scanning' | 'scanned';

const MOCK_IMAGE_FILES = [
  'document_scan_001.jpg',
  'invoice_march.png',
  'contract_signed.pdf',
  'whiteboard_photo.jpeg',
];

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
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [previewText, setPreviewText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startScanAnimation = () => {
    scanLineAnim.setValue(0);
    scanLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoopRef.current.start();
  };

  const stopScanAnimation = () => {
    scanLoopRef.current?.stop();
    scanLineAnim.setValue(0);
  };

  const simulateScan = () => {
    if (disabled) return;
    setScanState('scanning');
    startScanAnimation();
    fadeAnim.setValue(0);

    setTimeout(() => {
      stopScanAnimation();
      const mockText =
        'Quarterly Report — Q3 2024\n\nRevenue increased by 24% compared to the previous quarter. Key drivers include new product launches and expanded distribution channels across APAC markets.';
      setPreviewText(mockText);
      setScanState('scanned');
      onScanChange?.(true, mockText);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2200);
  };

  const handleRetake = () => {
    setScanState('idle');
    setPreviewText('');
    setUploadedFile(null);
    onScanChange?.(false, '');
  };

  const handleUpload = () => {
    if (disabled) return;
    const randomFile = MOCK_IMAGE_FILES[Math.floor(Math.random() * MOCK_IMAGE_FILES.length)];
    setUploadedFile(randomFile);
    fadeAnim.setValue(0);

    const mockText =
      'Invoice #2024-0391\n\nDate: March 14, 2024\nAmount Due: $3,450.00\nDue Date: April 1, 2024\n\nServices rendered for Q1 design and development sprint.';
    setPreviewText(mockText);
    onScanChange?.(true, mockText, randomFile);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleRemoveUpload = () => {
    setUploadedFile(null);
    setPreviewText('');
    onScanChange?.(false, '');
  };

  const switchMode = (newMode: CameraMode) => {
    if (newMode === mode) return;
    setScanState('idle');
    setPreviewText('');
    setUploadedFile(null);
    onScanChange?.(false, '');
    setMode(newMode);
  };

  const getFileExt = (name: string) => name.split('.').pop()?.toUpperCase() || 'IMG';

  const accentColor = colors.text;
  const isScanned = scanState === 'scanned';
  const isScanning = scanState === 'scanning';
  const showResult = isScanned || (uploadedFile && previewText);

  if (isScanning) {
    const translateY = scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 96],
    });

    return (
      <View style={[styles.container, styles.scanningContainer, { backgroundColor: colors.card, borderColor: accentColor }]}>
        <View style={[styles.scanFrame, { borderColor: accentColor }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: accentColor }]} />
          <Animated.View style={[styles.scanLine, { backgroundColor: accentColor, transform: [{ translateY }] }]} />
        </View>
        <Text style={[styles.scanningText, { color: colors.textSecondary }]}>
          Scanning document...
        </Text>
      </View>
    );
  }

  if (showResult) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: fadeAnim }]}>
        <View style={styles.scannedHeader}>
          <View style={styles.scannedTitleRow}>
            <CheckCircle size={18} color={accentColor} strokeWidth={2} />
            <Text style={[styles.scannedTitle, { color: colors.text }]}>
              {uploadedFile ? uploadedFile : 'Text extracted'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={uploadedFile ? handleRemoveUpload : handleRetake}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.retakeButton}
          >
            {uploadedFile ? (
              <Trash2 size={16} color={colors.textSecondary} />
            ) : (
              <RefreshCw size={16} color={colors.textSecondary} />
            )}
            <Text style={[styles.retakeText, { color: colors.textSecondary }]}>
              {uploadedFile ? 'Remove' : 'Retake'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.previewBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={4}>
            {previewText}
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
          <TouchableOpacity
            onPress={simulateScan}
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: accentColor }]}
          >
            <Camera size={28} color={colors.background} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={[styles.idleTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      )}

      {mode === 'upload' && (
        <TouchableOpacity
          style={styles.idleContent}
          onPress={handleUpload}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={[styles.actionButton, { backgroundColor: accentColor }]}>
            <FileImage size={26} color={colors.background} strokeWidth={1.8} />
          </View>
          <Text style={[styles.idleTitle, { color: colors.text }]}>Upload Image</Text>
          <Text style={[styles.idleDesc, { color: colors.textSecondary }]}>
            JPG, PNG, PDF, HEIC supported
          </Text>
        </TouchableOpacity>
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
  scanningContainer: {
    borderWidth: 1.5,
    borderStyle: 'solid',
    minHeight: 180,
  },
  modeTabs: {
    flexDirection: 'row',
    margin: 8,
    padding: 3,
    borderRadius: 14,
    backgroundColor: 'transparent',
    gap: 2,
    alignSelf: 'stretch',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 11,
  },
  modeTabText: {
    fontSize: 13,
  },
  idleContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 10,
  },
  actionButton: {
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
  scanFrame: {
    width: 200,
    height: 120,
    borderWidth: 0,
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'transparent',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  scanningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 10,
  },
  scannedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  scannedTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    paddingHorizontal: 28,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
