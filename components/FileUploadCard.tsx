import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { UploadCloud, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface FileUploadCardProps {
  fileName: string | null;
  onSelectFile: () => void;
  onRemoveFile: () => void;
  disabled?: boolean;
}

export function FileUploadCard({ fileName, onSelectFile, onRemoveFile, disabled }: FileUploadCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  if (fileName) {
    return (
      <View style={[styles.container, styles.selectedContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.fileInfo}>
          <FileText size={24} color={colors.text} strokeWidth={1.5} />
          <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
            {fileName}
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
      style={[
        styles.container, 
        styles.uploadContainer, 
        { backgroundColor: colors.card, borderColor: colors.border },
        disabled && styles.disabled
      ]}
      onPress={onSelectFile}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <UploadCloud size={32} color={colors.textSecondary} strokeWidth={1.5} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>Drag & Drop or Tap to Upload</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>PDF, DOCX, TXT supported</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    height: 140,
    marginBottom: 24, // Reduced slightly to accommodate chips
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  selectedContainer: {
    borderWidth: 1,
    borderStyle: 'solid',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flexShrink: 1,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
