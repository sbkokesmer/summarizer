import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
  Animated,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Check, Wand2 } from 'lucide-react-native';
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
  customFocus: string;
  onCustomFocusChange: (text: string) => void;
}

export function SummaryStyleSheet({ visible, onClose, onSelect, selectedId, customFocus, onCustomFocusChange }: Props) {
  const insets = useSafeAreaInsets();
  const focusAnim = useRef(new Animated.Value(customFocus.length > 0 ? 1 : 0)).current;
  const [focusExpanded, setFocusExpanded] = React.useState(customFocus.length > 0);
  const inputRef = useRef<TextInput>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  const toggleFocus = () => {
    if (focusExpanded) {
      Keyboard.dismiss();
      onCustomFocusChange('');
      Animated.timing(focusAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => {
        setFocusExpanded(false);
      });
    } else {
      setFocusExpanded(true);
      Animated.timing(focusAnim, { toValue: 1, duration: 260, useNativeDriver: false }).start(() => {
        inputRef.current?.focus();
      });
    }
  };

  useEffect(() => {
    if (customFocus.length > 0 && !focusExpanded) {
      setFocusExpanded(true);
      focusAnim.setValue(1);
    }
  }, []);

  const inputHeight = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 90] });
  const inputOpacity = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => { Keyboard.dismiss(); onClose(); }} />

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
            keyboardShouldPersistTaps="handled"
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

            <TouchableOpacity
              style={[styles.customFocusToggle, focusExpanded && styles.customFocusToggleActive]}
              onPress={toggleFocus}
              activeOpacity={0.7}
            >
              <Wand2 size={16} color={focusExpanded ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} strokeWidth={2} />
              <Text style={[styles.customFocusToggleLabel, focusExpanded && styles.customFocusToggleLabelActive]}>
                {focusExpanded ? 'Remove Custom Focus' : 'Add Custom Focus'}
              </Text>
              {customFocus.length > 0 && !focusExpanded && (
                <View style={styles.dot} />
              )}
            </TouchableOpacity>

            <Animated.View style={[styles.customFocusContainer, { height: inputHeight, opacity: inputOpacity, overflow: 'hidden' }]}>
              <View style={styles.customFocusInner}>
                <TextInput
                  ref={inputRef}
                  style={styles.customFocusInput}
                  value={customFocus}
                  onChangeText={onCustomFocusChange}
                  placeholder="e.g. Only extract the reasons lawsuits were filed"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  maxLength={200}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.charCount}>{customFocus.length}/200</Text>
              </View>
            </Animated.View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => { Keyboard.dismiss(); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonLabel}>Done</Text>
            </TouchableOpacity>
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
    maxHeight: '85%',
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
    marginBottom: 12,
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
  customFocusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  customFocusToggleActive: {
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'solid',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  customFocusToggleLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    flex: 1,
  },
  customFocusToggleLabelActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  customFocusContainer: {
    marginBottom: 12,
  },
  customFocusInner: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flex: 1,
  },
  customFocusInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'right',
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  doneButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
