import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SUMMARY_STYLES = [
  {
    id: 'standard',
    label: 'Standard',
    icon: '📄',
    description: 'Balanced summary with key sections',
  },
  {
    id: 'detailed',
    label: 'Detailed',
    icon: '🔍',
    description: 'In-depth breakdown, nothing skipped',
  },
  {
    id: 'concise',
    label: 'Concise',
    icon: '⚡',
    description: 'Short and to the point',
  },
  {
    id: 'bullets',
    label: 'Bullets Only',
    icon: '•',
    description: 'Pure bullet-point takeaways',
  },
  {
    id: 'curt',
    label: 'Curt',
    icon: '🎯',
    description: '3 sentences max, no fluff',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (styleId: string) => void;
  selectedId: string;
}

export function SummaryStyleSheet({ visible, onClose, onSelect, selectedId }: Props) {
  const insets = useSafeAreaInsets();

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint="dark"
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Summary Style</Text>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.listContainer}>
              {SUMMARY_STYLES.map((style, index) => {
                const isSelected = selectedId === style.id;
                return (
                  <React.Fragment key={style.id}>
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => handleSelect(style.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.leftContent}>
                        <Text style={styles.icon}>{style.icon}</Text>
                        <View>
                          <Text style={[styles.label, isSelected && styles.labelSelected]}>
                            {style.label}
                          </Text>
                          <Text style={styles.description}>{style.description}</Text>
                        </View>
                      </View>
                      {isSelected && <Check size={20} color="#FFFFFF" strokeWidth={2.5} />}
                    </TouchableOpacity>
                    {index < SUMMARY_STYLES.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                );
              })}
            </View>
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
    backgroundColor: Platform.OS === 'android' ? 'rgba(28,28,30,0.95)' : 'transparent',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  scrollContainer: {
    maxHeight: '100%',
  },
  listContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 58,
  },
});
