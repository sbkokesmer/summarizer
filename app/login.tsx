import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  LayoutAnimation, 
  UIManager,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ChevronLeft, Check, Globe, ChevronDown, ShieldCheck } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // For Apple Logo
import { Colors } from '@/constants/Colors';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FadeInView } from '@/components/FadeInView';
import { LanguageSelectionSheet, LANGUAGES } from '@/components/LanguageSelectionSheet';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Step = 'welcome' | 'email' | 'onboarding';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [step, setStep] = useState<Step>('welcome');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding States
  const [selectedLangId, setSelectedLangId] = useState<string | null>(null);
  const [isLangSheetVisible, setIsLangSheetVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const selectedLang = LANGUAGES.find(l => l.id === selectedLangId);

  const changeStep = (newStep: Step) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(newStep);
  };

  const handleAppleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      changeStep('onboarding');
    }, 1000);
  };

  const handleEmailAuth = () => {
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      changeStep('onboarding');
    }, 1000);
  };

  const handleCompleteOnboarding = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, save language preference and auth token here
      router.replace('/(tabs)');
    }, 1000);
  };

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header / Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          {step !== 'welcome' && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => changeStep(step === 'email' ? 'welcome' : 'welcome')}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          
          {/* STEP 1: WELCOME */}
          {step === 'welcome' && (
            <FadeInView style={styles.stepContainer}>
              <View style={styles.heroContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Globe size={40} color={colors.text} strokeWidth={1.5} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Summarize & Translate</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Your personal AI language assistant. Fast, secure, and beautifully simple.
                </Text>
              </View>

              <View style={styles.actionContainer}>
                {/* Apple Button */}
                <TouchableOpacity 
                  style={[styles.appleButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                  onPress={handleAppleAuth}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="apple" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                  <Text style={[styles.appleButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

                {/* Email Button */}
                <TouchableOpacity 
                  style={[styles.emailButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => changeStep('email')}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Mail size={20} color={colors.text} />
                  <Text style={[styles.emailButtonText, { color: colors.text }]}>
                    Continue with Email
                  </Text>
                </TouchableOpacity>

                <View style={styles.privacyNote}>
                  <ShieldCheck size={14} color={colors.textSecondary} />
                  <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                    Zero-Data Retention. We don't store your inputs.
                  </Text>
                </View>
              </View>
            </FadeInView>
          )}

          {/* STEP 2: EMAIL AUTH */}
          {step === 'email' && (
            <FadeInView style={styles.stepContainer}>
              <View style={styles.heroContainer}>
                <Text style={[styles.title, { color: colors.text, textAlign: 'left' }]}>Welcome back</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'left' }]}>
                  Enter your details to continue.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <PrimaryButton 
                  title="Continue" 
                  onPress={handleEmailAuth}
                  isLoading={isLoading}
                  disabled={!email || !password}
                />
              </View>
            </FadeInView>
          )}

          {/* STEP 3: ONBOARDING (Language & T&C) */}
          {step === 'onboarding' && (
            <FadeInView style={styles.stepContainer}>
              <View style={styles.heroContainer}>
                <Text style={[styles.title, { color: colors.text, textAlign: 'left' }]}>One last step</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'left' }]}>
                  Personalize your experience before we begin.
                </Text>
              </View>

              <View style={styles.formContainer}>
                
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIMARY LANGUAGE</Text>
                <TouchableOpacity 
                  style={[styles.langSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setIsLangSheetVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langSelectorLeft}>
                    <Globe size={20} color={colors.textSecondary} />
                    <Text style={[styles.langSelectorText, { color: selectedLang ? colors.text : colors.textSecondary }]}>
                      {selectedLang ? `${selectedLang.icon} ${selectedLang.label}` : 'Select your language...'}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                  This will be the default language for the app interface and your translations.
                </Text>

                <View style={styles.spacer} />

                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.checkbox, 
                    { borderColor: agreedToTerms ? colors.text : colors.border },
                    agreedToTerms && { backgroundColor: colors.text }
                  ]}>
                    {agreedToTerms && <Check size={14} color={colors.background} strokeWidth={3} />}
                  </View>
                  <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                    I agree to the <Text style={{ color: colors.text, fontWeight: '600' }}>Terms of Service</Text> and <Text style={{ color: colors.text, fontWeight: '600' }}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>

                <PrimaryButton 
                  title="Get Started" 
                  onPress={handleCompleteOnboarding}
                  isLoading={isLoading}
                  disabled={!selectedLangId || !agreedToTerms}
                />
              </View>
            </FadeInView>
          )}

        </View>
      </KeyboardAvoidingView>

      <LanguageSelectionSheet 
        visible={isLangSheetVisible}
        onClose={() => setIsLangSheetVisible(false)}
        onSelect={setSelectedLangId}
        selectedId={selectedLangId || ''}
        showAutoOption={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionContainer: {
    gap: 16,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 20,
    gap: 10,
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  emailButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  privacyText: {
    fontSize: 13,
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    height: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: -8,
    marginTop: 8,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  langSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langSelectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  spacer: {
    height: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
