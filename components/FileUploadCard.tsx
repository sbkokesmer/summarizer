import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { UploadCloud, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/context/ThemeContext';

export interface SelectedFile {
  name: string;
  base64: string;
  mimeType: string;
  blob?: Blob;
}

interface FileUploadCardProps {
  file: SelectedFile | null;
  onFileSelected: (file: SelectedFile) => void;
  onRemoveFile: () => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export function FileUploadCard({ file, onFileSelected, onRemoveFile, disabled, title, description }: FileUploadCardProps) {
  const { colors } = useTheme();

  const handlePick = async () => {
    if (disabled) return;

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.pdf,.doc,.docx';
      input.onchange = async (e: Event) => {
        const fileInput = e.target as HTMLInputElement;
        const pickedFile = fileInput.files?.[0];
        if (!pickedFile) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          onFileSelected({
            name: pickedFile.name,
            base64,
            mimeType: pickedFile.type || 'application/octet-stream',
            blob: pickedFile,
          });
        };
        reader.readAsDataURL(pickedFile);
      };
      input.click();
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
    onFileSelected({ name: asset.name, base64, mimeType: asset.mimeType || 'application/octet-stream' });
  };

  if (file) {
    return (
      <View style={[styles.container, styles.selectedContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.fileInfo}>
          <FileText size={24} color={colors.text} strokeWidth={1.5} />
          <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
        <TouchableOpacity onPress={onRemoveFile} disabled={disabled} style={styles.removeButton}>
          <Text style={[styles.removeText, { color: colors.textSecondary }]}>Remove file</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, styles.uploadContainer, { backgroundColor: colors.card, borderColor: colors.border }, disabled && styles.disabled]}
      onPress={handlePick}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <UploadCloud size={32} color={colors.textSecondary} strokeWidth={1.5} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{title || 'Tap to Upload'}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{description || 'PDF, DOCX, TXT supported'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    height: 140,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadContainer: { borderWidth: 1, borderStyle: 'dashed' },
  selectedContainer: { borderWidth: 1, borderStyle: 'solid' },
  disabled: { opacity: 0.5 },
  icon: { marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  subtitle: { fontSize: 13, fontWeight: '400' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '100%', justifyContent: 'center' },
  fileName: { fontSize: 15, fontWeight: '500', marginLeft: 12, flexShrink: 1 },
  removeButton: { paddingVertical: 6, paddingHorizontal: 12 },
  removeText: { fontSize: 14, fontWeight: '400' },
});
