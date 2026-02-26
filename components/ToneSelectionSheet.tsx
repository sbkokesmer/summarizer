import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Pressable, 
  Platform,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TONES = [
  { id: 'standard', label: 'Standard', icon: '📝', description: 'Clear and natural' },
  { id: 'professional', label: 'Professional', icon: '💼', description: 'Formal, for business' },
  { id: 'academic', label: 'Academic', icon: '🎓', description: 'Scholarly and detailed' },
  { id: 'casual', label: 'Casual', icon: '☕️', description: 'Friendly and relaxed' },
  { id: 'bullets', label: 'Bullet Points', icon: '📋', description: 'Key takeaways only' },
  { id: 'genz', label: 'Gen-Z', icon: '📱', description: 'Short, punchy, modern' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (toneId: string) => void;
  selectedId: string;
}

export function ToneSelectionSheet({ visible, onClose, onSelect, selectedId }: Props) {
  const insets = useSafeAreaInsets();

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <BlurView 
          intensity={Platform.OS === 'ios' ? 80 : 100} 
          tint="dark" 
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 24) }
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Tone of Voice</Text>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.listContainer}>
              {TONES.map((tone, index) => {
                const isSelected = selectedId === tone.id;
                return (
                  <React.Fragment key={tone.id}>
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => handleSelect(tone.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.leftContent}>
                        <Text style={styles.icon}>{tone.icon}</Text>
                        <View>
                          <Text style={[
                            styles.label,
                            isSelected && styles.labelSelected
                          ]}>
                            {tone.label}
                          </Text>
                          <Text style={styles.description}>{tone.description}</Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                    {index < TONES.length - 1 && (
                      <View style={styles.separator} />
                    )}
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
    marginLeft: 52,
  },
});
