import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, LayoutAnimation, UIManager, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, ChevronDown, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { AppIdentityBadge } from '@/components/AppIdentityBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { InputCard } from '@/components/InputCard';
import { FileUploadCard } from '@/components/FileUploadCard';
import { UrlInputCard } from '@/components/UrlInputCard';
import { AudioRecordCard } from '@/components/AudioRecordCard';
import { CameraScanCard } from '@/components/CameraScanCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { ResultCard } from '@/components/ResultCard';
import { FadeInView } from '@/components/FadeInView';
import { LanguageSelectionSheet, LANGUAGES } from '@/components/LanguageSelectionSheet';
import { ToneSelectionSheet, TONES } from '@/components/ToneSelectionSheet';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { callOpenAI } from '@/services/openai';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INPUT_TYPES = ['Text', 'File', 'URL', 'Audio', 'Camera'];

export default function TranslateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;

  const [inputTypeIndex, setInputTypeIndex] = useState(0);
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState('');
  const [hasScan, setHasScan] = useState(false);
  const [scanText, setScanText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [targetLangId, setTargetLangId] = useState('en');
  const [isLangSheetVisible, setIsLangSheetVisible] = useState(false);

  const [toneId, setToneId] = useState('standard');
  const [isToneSheetVisible, setIsToneSheetVisible] = useState(false);

  const [keepOriginal, setKeepOriginal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'translate' | 'both' | null>(null);

  const selectedLang = LANGUAGES.find(l => l.id === targetLangId) || LANGUAGES[1];
  const selectedTone = TONES.find(t => t.id === toneId) || TONES[0];

  const handleInputTypeChange = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInputTypeIndex(index);
  };

  const handleFileSelect = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleRemoveFile = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFile(null);
  };

  const handleAudioChange = (hasRecording: boolean, duration: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHasAudio(hasRecording);
    setAudioDuration(duration);
  };

  const handleScanChange = (hasResult: boolean, preview?: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHasScan(hasResult);
    setScanText(preview || '');
  };

  const checkInput = () => {
    if (inputTypeIndex === 0 && text.trim()) return true;
    if (inputTypeIndex === 1 && selectedFile) return true;
    if (inputTypeIndex === 2 && url.trim()) return true;
    if (inputTypeIndex === 3 && hasAudio) return true;
    if (inputTypeIndex === 4 && hasScan) return true;
    return false;
  };

  const getInputText = () => {
    if (inputTypeIndex === 0) return text;
    if (inputTypeIndex === 1) return selectedFile || '';
    if (inputTypeIndex === 2) return url;
    if (inputTypeIndex === 3) return `[Audio recording: ${audioDuration}]`;
    if (inputTypeIndex === 4) return scanText;
    return '';
  };

  const executeAction = async (actionType: 'translate' | 'both') => {
    if (!checkInput()) {
      Alert.alert('Missing Input', 'Please provide content to process.');
      return;
    }

    setPendingAction(actionType);
    setIsLoading(true);
    setError(null);

    if (result) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setResult('');
    }

    try {
      const inputText = getInputText();
      const action = actionType === 'both' ? 'summarize_translate' : 'translate';

      const response = await callOpenAI({
        action,
        text: inputText,
        targetLanguage: selectedLang.label,
        tone: toneId,
      });

      let finalResult = response;
      if (keepOriginal) {
        finalResult += `\n\n### Original Text\n${inputText}`;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setResult(finalResult);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 140,
            }
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <AppIdentityBadge title="Translate" />

          <View style={styles.paddingHorizontal}>
            <SegmentedControl
              options={INPUT_TYPES}
              selectedIndex={inputTypeIndex}
              onChange={handleInputTypeChange}
              disabled={isLoading}
            />
          </View>

          <View style={styles.paddingHorizontal}>
            <FadeInView key={`input-${inputTypeIndex}`}>
              {inputTypeIndex === 0 && (
                <InputCard value={text} onChangeText={setText} editable={!isLoading} />
              )}
              {inputTypeIndex === 1 && (
                <FileUploadCard
                  fileName={selectedFile}
                  onSelectFile={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                  disabled={isLoading}
                />
              )}
              {inputTypeIndex === 2 && (
                <UrlInputCard value={url} onChangeText={setUrl} disabled={isLoading} />
              )}
              {inputTypeIndex === 3 && (
                <AudioRecordCard
                  onRecordingChange={handleAudioChange}
                  disabled={isLoading}
                  title="Record Audio"
                  description="Record speech or a meeting to translate it"
                />
              )}
              {inputTypeIndex === 4 && (
                <CameraScanCard
                  onScanChange={handleScanChange}
                  disabled={isLoading}
                  title="Scan & Translate"
                  description="Point your camera at text to translate it instantly"
                />
              )}
            </FadeInView>
          </View>

          <View style={styles.paddingHorizontal}>
            <View style={styles.configGrid}>
              <TouchableOpacity
                style={[styles.configButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsLangSheetVisible(true)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.configHeader}>
                  <Globe size={14} color={colors.textSecondary} />
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Translate To</Text>
                </View>
                <View style={styles.configValueRow}>
                  <Text style={[styles.configValue, { color: colors.text }]} numberOfLines={1}>
                    {selectedLang.icon} {selectedLang.label}
                  </Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.configButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsToneSheetVisible(true)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.configHeader}>
                  <Sparkles size={14} color={colors.textSecondary} />
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Tone</Text>
                </View>
                <View style={styles.configValueRow}>
                  <Text style={[styles.configValue, { color: colors.text }]} numberOfLines={1}>
                    {selectedTone.icon} {selectedTone.label}
                  </Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>Keep original text in result</Text>
              <Switch
                value={keepOriginal}
                onValueChange={setKeepOriginal}
                trackColor={{ false: colors.border, true: '#34C759' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>

            <PrimaryButton
              title={`Translate to ${selectedLang.label}`}
              onPress={() => executeAction('translate')}
              isLoading={isLoading && pendingAction === 'translate'}
            />

            <SecondaryButton
              title="Translate & Summarize"
              onPress={() => executeAction('both')}
              disabled={isLoading}
            />

            <PrivacyBadge />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: '#FF3B30' }]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {result ? (
              <FadeInView style={styles.resultSection}>
                <View style={[styles.divider, { backgroundColor: colors.separator }]} />
                <ResultCard result={result} />
              </FadeInView>
            ) : null}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <LanguageSelectionSheet
        visible={isLangSheetVisible}
        onClose={() => setIsLangSheetVisible(false)}
        onSelect={setTargetLangId}
        selectedId={targetLangId}
        showAutoOption={false}
      />

      <ToneSelectionSheet
        visible={isToneSheetVisible}
        onClose={() => setIsToneSheetVisible(false)}
        onSelect={setToneId}
        selectedId={toneId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: {},
  paddingHorizontal: { paddingHorizontal: 20 },
  configGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  configButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  configValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 14,
  },
  resultSection: {
    marginTop: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginBottom: 24,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    lineHeight: 20,
  },
});
