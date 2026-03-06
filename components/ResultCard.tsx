import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Share, Check, FileDown } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { exportToPdf } from '@/services/pdfExport';

interface ResultCardProps {
  result: string;
}

// A lightweight custom markdown renderer for bold text and bullet points
const renderInlineText = (line: string, textColor: string) => {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, partIndex) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={partIndex} style={{ fontWeight: '700', color: textColor }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={partIndex}>{part}</Text>;
  });
};

const renderSmartText = (text: string, textColor: string) => {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    if (line.startsWith('# ')) {
      return (
        <Text key={lineIndex} style={[styles.h1Text, { color: textColor }]}>
          {line.slice(2)}
        </Text>
      );
    }

    if (line.startsWith('## ')) {
      return (
        <Text key={lineIndex} style={[styles.sectionHeader, { color: textColor }]}>
          {line.slice(3)}
        </Text>
      );
    }

    if (line.startsWith('### ')) {
      return (
        <Text key={lineIndex} style={[styles.headerText, { color: textColor }]}>
          {line.slice(4)}
        </Text>
      );
    }

    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    if (isBullet) {
      const cleanLine = line.trim().slice(2);
      return (
        <View key={lineIndex} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: textColor }]} />
          <Text style={[styles.text, { color: textColor, flex: 1 }]}>
            {renderInlineText(cleanLine, textColor)}
          </Text>
        </View>
      );
    }

    return (
      <Text key={lineIndex} style={[styles.text, { color: textColor, marginBottom: 8 }]}>
        {renderInlineText(line, textColor)}
      </Text>
    );
  });
};

export function ResultCard({ result }: ResultCardProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!result) return null;

  const plainText = result
    .replace(/^#{1,3}\s/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s/gm, '- ');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (Platform.OS === 'web' && navigator.share) {
      try {
        await navigator.share({ text: plainText });
      } catch {}
      return;
    }
    await Clipboard.setStringAsync(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportToPdf(result);
    } catch {}
    setExporting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Result</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.6} onPress={handleCopy}>
            {copied ? (
              <Check size={18} color="#34C759" strokeWidth={1.5} />
            ) : (
              <Copy size={18} color={colors.textSecondary} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.6} onPress={handleExportPdf} disabled={exporting}>
            <FileDown size={18} color={exporting ? colors.border : colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.6} onPress={handleShare}>
            <Share size={18} color={colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {renderSmartText(result, colors.text)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    flex: 1,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 12,
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  h1Text: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    marginRight: 12,
    opacity: 0.5,
  },
});
