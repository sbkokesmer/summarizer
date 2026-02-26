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

export const LANGUAGES = [
  { id: 'auto', label: 'Original (No Translation)', icon: '✨' },
  { id: 'en', label: 'English', icon: '🇺🇸' },
  { id: 'es', label: 'Spanish', icon: '🇪🇸' },
  { id: 'fr', label: 'French', icon: '🇫🇷' },
  { id: 'de', label: 'German', icon: '🇩🇪' },
  { id: 'it', label: 'Italian', icon: '🇮🇹' },
  { id: 'tr', label: 'Turkish', icon: '🇹🇷' },
  { id: 'ja', label: 'Japanese', icon: '🇯🇵' },
  { id: 'ko', label: 'Korean', icon: '🇰🇷' },
  { id: 'zh', label: 'Chinese', icon: '🇨🇳' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (languageId: string) => void;
  selectedId: string;
  showAutoOption?: boolean;
}

export function LanguageSelectionSheet({ visible, onClose, onSelect, selectedId, showAutoOption = false }: Props) {
  const insets = useSafeAreaInsets();

  const displayLanguages = showAutoOption 
    ? LANGUAGES 
    : LANGUAGES.filter(l => l.id !== 'auto');

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose(); // Auto close on selection for faster UX
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

          <Text style={styles.title}>Select Language</Text>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.listContainer}>
              {displayLanguages.map((lang, index) => {
                const isSelected = selectedId === lang.id;
                return (
                  <React.Fragment key={lang.id}>
                    <TouchableOpacity
                      style={styles.langRow}
                      onPress={() => handleSelect(lang.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.langLeft}>
                        <Text style={styles.langIcon}>{lang.icon}</Text>
                        <Text style={[
                          styles.langText,
                          isSelected && styles.langTextSelected
                        ]}>
                          {lang.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                    {index < displayLanguages.length - 1 && (
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
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langIcon: {
    fontSize: 20,
  },
  langText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  langTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 48, // Align with text, skip icon
  },
});
