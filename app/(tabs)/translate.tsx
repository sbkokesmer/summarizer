import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, LayoutAnimation, UIManager, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, ChevronDown, Sparkles, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { usePurchases } from '@/context/PurchasesContext';
import { FREE_LIMIT } from '@/services/usageStore';
import { AppIdentityBadge } from '@/components/AppIdentityBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { InputCard } from '@/components/InputCard';
import { FileUploadCard, SelectedFile } from '@/components/FileUploadCard';
import { UrlInputCard } from '@/components/UrlInputCard';
import { AudioRecordCard, SelectedAudio } from '@/components/AudioRecordCard';
import { CameraScanCard, ScannedImage } from '@/components/CameraScanCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { ResultCard } from '@/components/ResultCard';
import { FadeInView } from '@/components/FadeInView';
import { LanguageSelectionSheet, LANGUAGES } from '@/components/LanguageSelectionSheet';
import { ToneSelectionSheet, TONES } from '@/components/ToneSelectionSheet';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { callOpenAI } from '@/services/openai';
import { saveHistoryItem, InputType } from '@/services/historyStore';
import { notifySummaryReady } from '@/services/notifications';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TranslateScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, remainingFreeUses, canUse, consumeUsage } = usePurchases();

  const scrollY = useRef(new Animated.Value(0)).current;

  const INPUT_TYPES = [
    t('translate.text'),
    t('translate.file'),
    t('translate.url'),
    t('translate.audio'),
    t('translate.camera'),
  ];

  const [inputTypeIndex, setInputTypeIndex] = useState(0);
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [url, setUrl] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [audioData, setAudioData] = useState<SelectedAudio | undefined>(undefined);
  const [hasScan, setHasScan] = useState(false);
  const [scanImage, setScanImage] = useState<ScannedImage | undefined>(undefined);

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

  const handleRemoveFile = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFile(null);
  };

  const handleAudioChange = (hasRecording: boolean, duration: string, audio?: SelectedAudio) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHasAudio(hasRecording);
    setAudioData(audio);
  };

  const handleScanChange = (hasResult: boolean, image?: ScannedImage) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHasScan(hasResult);
    setScanImage(image);
  };

  const checkInput = () => {
    if (inputTypeIndex === 0 && text.trim()) return true;
    if (inputTypeIndex === 1 && selectedFile) return true;
    if (inputTypeIndex === 2 && url.trim()) return true;
    if (inputTypeIndex === 3 && hasAudio) return true;
    if (inputTypeIndex === 4 && hasScan) return true;
    return false;
  };

  const executeAction = async (actionType: 'translate' | 'both') => {
    if (!checkInput()) {
      Alert.alert(t('translate.missing_input'), t('translate.missing_input_desc'));
      return;
    }

    if (!canUse) {
      router.push('/paywall');
      return;
    }

    const allowed = await consumeUsage();
    if (!allowed) {
      router.push('/paywall');
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
      const action = actionType === 'both' ? 'summarize_translate' : 'translate';
      let params: Parameters<typeof callOpenAI>[0] = { action, targetLanguage: selectedLang.label, tone: toneId };

      if (inputTypeIndex === 0) {
        params.text = text;
        if (keepOriginal) params.text = text;
      } else if (inputTypeIndex === 1 && selectedFile) {
        if (selectedFile.blob) {
          params.fileBlob = selectedFile.blob;
        } else {
          params.fileBase64 = selectedFile.base64;
        }
        params.fileMimeType = selectedFile.mimeType;
        params.fileName = selectedFile.name;
      } else if (inputTypeIndex === 2) {
        params.url = url;
      } else if (inputTypeIndex === 3 && audioData) {
        params.audioBase64 = audioData.base64;
        params.audioMimeType = audioData.mimeType;
        params.fileName = audioData.name;
      } else if (inputTypeIndex === 4 && scanImage) {
        params.imageBase64 = scanImage.base64;
      }

      let response = await callOpenAI(params);

      if (keepOriginal && inputTypeIndex === 0 && text) {
        response += `\n\n### Original Text\n${text}`;
      }

      const inputTypeMap: InputType[] = ['text', 'file', 'url', 'audio', 'camera'];
      let title = '';
      if (inputTypeIndex === 0) title = text.trim().slice(0, 60) || 'Text input';
      else if (inputTypeIndex === 1) title = selectedFile?.name || 'File';
      else if (inputTypeIndex === 2) title = url.trim().slice(0, 60) || 'URL';
      else if (inputTypeIndex === 3) title = audioData?.name || 'Audio recording';
      else if (inputTypeIndex === 4) title = 'Camera scan';

      const actionLabel = actionType === 'both'
        ? `Summarized & Translated (${selectedLang.label})`
        : `Translated to ${selectedLang.label}`;

      saveHistoryItem({
        inputType: inputTypeMap[inputTypeIndex],
        title,
        result: response,
        action: actionLabel,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setResult(response);
      notifySummaryReady(
        actionLabel,
        response.replace(/[#*_`]/g, '').slice(0, 120)
      );
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
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          <AppIdentityBadge title={t('translate.title')} />

          {!isPro && (
            <View style={styles.paddingHorizontal}>
              <TouchableOpacity
                style={[styles.usageBanner, { backgroundColor: remainingFreeUses === 0 ? '#FF3B3015' : colors.card, borderColor: remainingFreeUses === 0 ? '#FF3B30' : colors.border }]}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.8}
              >
                <Zap size={14} color={remainingFreeUses === 0 ? '#FF3B30' : colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.usageBannerText, { color: remainingFreeUses === 0 ? '#FF3B30' : colors.textSecondary }]}>
                  {remainingFreeUses === 0
                    ? 'Free limit reached — Upgrade to Pro for unlimited use'
                    : `${remainingFreeUses} of ${FREE_LIMIT} free uses remaining`}
                </Text>
                {remainingFreeUses > 0 && (
                  <View style={styles.usageDots}>
                    {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                      <View key={i} style={[styles.usageDot, { backgroundColor: i < remainingFreeUses ? '#34C759' : colors.border }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.paddingHorizontal}>
            <SegmentedControl options={INPUT_TYPES} selectedIndex={inputTypeIndex} onChange={handleInputTypeChange} disabled={isLoading} />
          </View>

          <View style={styles.paddingHorizontal}>
            <FadeInView key={`input-${inputTypeIndex}`}>
              {inputTypeIndex === 0 && (
                <InputCard value={text} onChangeText={setText} editable={!isLoading} />
              )}
              {inputTypeIndex === 1 && (
                <FileUploadCard
                  file={selectedFile}
                  onFileSelected={(f) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setSelectedFile(f); }}
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
                  title={t('translate.audio_title')}
                  description={t('translate.audio_desc')}
                />
              )}
              {inputTypeIndex === 4 && (
                <CameraScanCard
                  onScanChange={handleScanChange}
                  disabled={isLoading}
                  title={t('translate.camera_title')}
                  description={t('translate.camera_desc')}
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
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>{t('translate.translate_to')}</Text>
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
                  <Text style={[styles.configLabel, { color: colors.textSecondary }]}>{t('translate.tone')}</Text>
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
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>{t('translate.keep_original')}</Text>
              <Switch
                value={keepOriginal}
                onValueChange={setKeepOriginal}
                trackColor={{ false: colors.border, true: '#34C759' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>

            <PrimaryButton
              title={t('translate.btn_translate', { lang: selectedLang.label })}
              onPress={() => executeAction('translate')}
              isLoading={isLoading && pendingAction === 'translate'}
            />

            <SecondaryButton
              title={t('translate.btn_translate_summarize')}
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
  configGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  configButton: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  configHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  configLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  configValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  configValue: { fontSize: 15, fontWeight: '600', flex: 1 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 20 },
  toggleText: { fontSize: 14 },
  resultSection: { marginTop: 24 },
  divider: { height: StyleSheet.hairlineWidth, width: '100%', marginBottom: 24 },
  errorBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12 },
  errorText: { color: '#FF3B30', fontSize: 14, lineHeight: 20 },
  usageBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  usageBannerText: { fontSize: 13, flex: 1, fontWeight: '500' },
  usageDots: { flexDirection: 'row', gap: 4 },
  usageDot: { width: 8, height: 8, borderRadius: 4 },
});
