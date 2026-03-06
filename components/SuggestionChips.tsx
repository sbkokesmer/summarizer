import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { FileText, Link as LinkIcon, Type } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface SuggestionChipsProps {
  onSelect: (type: 'file' | 'url' | 'text') => void;
  disabled?: boolean;
  title?: string;
  labels?: string[];
}

export function SuggestionChips({ onSelect, disabled, title, labels }: SuggestionChipsProps) {
  const { colors } = useTheme();

  const defaultLabels = ["Meeting Notes", "Financial Report", "Tech Article"];
  const displayLabels = labels || defaultLabels;

  const suggestions = [
    { id: 'text', icon: Type, label: displayLabels[0], type: 'text' as const },
    { id: 'file', icon: FileText, label: displayLabels[1], type: 'file' as const },
    { id: 'url', icon: LinkIcon, label: displayLabels[2], type: 'url' as const },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title || "Try an example:"}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: disabled ? 0.5 : 1
                }
              ]}
              onPress={() => onSelect(item.type)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Icon size={14} color={colors.textSecondary} />
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 20,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
