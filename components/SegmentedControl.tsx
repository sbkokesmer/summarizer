import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
}

export function SegmentedControl({ options, selectedIndex, onChange, disabled }: SegmentedControlProps) {
  const { isDark } = useTheme();
  
  // Lower contrast colors
  const containerBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const selectedBg = isDark ? 'rgba(255,255,255,0.12)' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const textSecondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }, disabled && styles.disabled]}>
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.segment,
              isSelected && { backgroundColor: selectedBg }
            ]}
            onPress={() => onChange(index)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                { color: isSelected ? textColor : textSecondaryColor },
                isSelected && styles.textSelected
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20, // True pill shape
    padding: 3, // Thinner padding
    marginBottom: 32, // Increased vertical spacing
  },
  disabled: {
    opacity: 0.5,
  },
  segment: {
    flex: 1,
    paddingVertical: 6, // Thinner height
    alignItems: 'center',
    borderRadius: 18, // Inner pill shape
  },
  text: {
    fontSize: 13,
    fontWeight: '400', // Lighter weight
  },
  textSelected: {
    fontWeight: '500',
  },
});
