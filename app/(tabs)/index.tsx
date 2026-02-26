import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, LayoutAnimation, UIManager, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, ChevronDown, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { AppIdentityBadge } from '@/components/AppIdentityBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { InputCard } from '@/components/InputCard';
import { FileUploadCard } from '@/components/FileUploadCard';
import { UrlInputCard } from '@/components/UrlInputCard';
import { AudioRecordCard } from '@/components/AudioRecordCard';
import { CameraScanCard } from '@/components/CameraScanCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ResultCard } from '@/components/ResultCard';
import { FadeInView } from '@/components/FadeInView';
import { SuggestionChips } from '@/components/SuggestionChips';
import { EmptyStateCard } from '@/components/EmptyStateCard';
import { LanguageSelectionSheet, LANGUAGES } from '@/components/LanguageSelectionSheet';
import { ToneSelectionSheet, TONES } from '@/components/ToneSelectionSheet';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { callOpenAI } from '@/services/openai';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SummarizeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;

  const INPUT_TYPES = [
    t('summarize.text'),
    t('summarize.file'),
    t('summarize.url'),
    t('summarize.audio'),
    t('summarize.camera'),
  ];

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

  const [targetLangId, setTargetLangId] = useState('auto');
  const [isLangSheetVisible, setIsLangSheetVisible] = useState(false);

  const [toneId, setToneId] = useState('standard');
  const [isToneSheetVisible, setIsToneSheetVisible] = useState(false);

  const selectedLang = LANGUAGES.find(l => l.id === targetLangId) || LANGUAGES[0];
  const selectedTone = TONES.find(t => t.id === toneId) || TONES[0];
  const isTranslating = targetLangId !== 'auto';

  const handleInputTypeChange = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInputTypeIndex(index);
  };

  const handleSimulateFileSelect = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFile('Q3_Financial_Report.pdf');
  };

  const handleRemoveFile = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFile(null);
  };

  const handleSuggestionSelect = (type: 'file' | 'url' | 'text') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (type === 'file') {
      setInputTypeIndex(1);
      setSelectedFile('Q4_Strategy_Deck.pdf');
    } else if (type === 'url') {
      setInputTypeIndex(2);
      setUrl('https://techcrunch.com/ai-future-trends');
    } else if (type === 'text') {
      setInputTypeIndex(0);
      setText('Meeting Notes: Discussed Q4 roadmap. Key deliverables include the new UI polish, performance improvements, and the launch of the translation feature. Action items assigned to the mobile team.');
    }
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

  const executeAction = async () => {
    if (!checkInput()) {
      Alert.alert(t('summarize.missing_input'), t('summarize.missing_input_desc'));
      return;
    }

    setIsLoading(true);
    setError(null);

    if (result) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setResult('');
    }

    try {
      const inputText = getInputText();
      const action = isTranslating ? 'summarize_translate' : 'summarize';

      const response = await callOpenAI({
        action,
        text: inputText,
        targetLanguage: isTranslating ? selectedLang.label : undefined,
        tone: toneId,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuggestions = inputTypeIndex <= 2;
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
          <AppIdentityBadge title={t('summarize.title')} />

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
                <InputCard value={text} onChangeText={setText} editable={!isLoading} placeholder={t('components.input_placeholder')} />
              )}
              {inputTypeIndex === 1 && (
                <FileUploadCard
                  fileName={selectedFile}
                  onSelectFile={handleSimulateFileSelect}
                  onRemoveFile={handleRemoveFile}
                  disabled={isLoading}
                  title={t('components.upload_title')}
                  description={t('components.upload_desc')}
                />
              )}
              {inputTypeIndex === 2 && (
                <UrlInputCard value={url} onChangeText={setUrl} disabled={isLoading} placeholder={t('components.url_placeholder')} />
              )}
              {inputTypeIndex === 3 && (
                <AudioRecordCard
                  onRecordingChange={handleAudioChange}
                  disabled={isLoading}
                  title={t('components.audio_title')}
                  description={t('components.audio_desc')}
                />
              )}
              {inputTypeIndex === 4 && (
                <CameraScanCard
                  onScanChange={handleScanChange}
                  disabled={isLoading}
                  title={t('components.camera_title')}
                  description={t('components.camera_desc')}
                />
              )}
            </FadeInView>
          </View>

          {showSuggestions && (
            <SuggestionChips
              onSelect={handleSuggestionSelect}
              disabled={isLoading}
              title={t('components.try_example')}
              labels={[t('components.ex_meeting'), t('components.ex_report'), t('components.ex_article')]}
            />
          )}

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
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>{t('summarize.output')}</Text>
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
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>{t('summarize.tone')}</Text>
                </View>
                <View style={styles.configValueRow}>
                  <Text style={[styles.configValue, { color: colors.text }]} numberOfLines={1}>
                    {selectedTone.icon} {selectedTone.label}
                  </Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title={isTranslating ? t('summarize.btn_summarize_translate') : t('summarize.btn_summarize')}
              onPress={executeAction}
              isLoading={isLoading}
            />

            <PrivacyBadge title={t('components.privacy_title')} description={t('components.privacy_desc')} />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: '#FF3B30' }]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {!result && !isLoading && !error ? (
              <FadeInView>
                <EmptyStateCard title={t('components.empty_title')} description={t('components.empty_desc')} />
              </FadeInView>
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
        showAutoOption={true}
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
