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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ChevronLeft, Check, Globe, ChevronDown, ShieldCheck } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FadeInView } from '@/components/FadeInView';
import { LanguageSelectionSheet, LANGUAGES } from '@/components/LanguageSelectionSheet';
import { useAuth } from '@/context/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Step = 'welcome' | 'email' | 'onboarding';
type EmailMode = 'signin' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [step, setStep] = useState<Step>('welcome');
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [selectedLangId, setSelectedLangId] = useState<string | null>(null);
  const [isLangSheetVisible, setIsLangSheetVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const selectedLang = LANGUAGES.find(l => l.id === selectedLangId);

  const changeStep = (newStep: Step) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAuthError(null);
    setStep(newStep);
  };

  const handleAppleAuth = () => {
    setAuthError('Apple Sign In requires a native build. Please use email to continue.');
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    setAuthError(null);

    let result: { error: string | null };
    if (emailMode === 'signin') {
      result = await signInWithEmail(email.trim(), password);
    } else {
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      result = await signUpWithEmail(email.trim(), password);
    }

    setIsLoading(false);

    if (result.error) {
      setAuthError(result.error);
      return;
    }

    changeStep('onboarding');
  };

  const handleCompleteOnboarding = () => {
    router.replace('/(tabs)');
  };

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          {step !== 'welcome' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => changeStep('welcome')}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>

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
                <TouchableOpacity
                  style={[styles.appleButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                  onPress={handleAppleAuth}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="apple" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                  <Text style={[styles.appleButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emailButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => changeStep('email')}
                  activeOpacity={0.8}
                >
                  <Mail size={20} color={colors.text} />
                  <Text style={[styles.emailButtonText, { color: colors.text }]}>
                    Continue with Email
                  </Text>
                </TouchableOpacity>

                {authError && (
                  <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: '#FF3B30' }]}>
                    <Text style={styles.errorText}>{authError}</Text>
                  </View>
                )}

                <View style={styles.privacyNote}>
                  <ShieldCheck size={14} color={colors.textSecondary} />
                  <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                    Zero-Data Retention. We don't store your inputs.
                  </Text>
                </View>
              </View>
            </FadeInView>
          )}

          {step === 'email' && (
            <FadeInView style={styles.stepContainer}>
              <View style={styles.heroContainer}>
                <Text style={[styles.title, { color: colors.text, textAlign: 'left' }]}>
                  {emailMode === 'signin' ? 'Welcome back' : 'Create account'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'left' }]}>
                  {emailMode === 'signin'
                    ? 'Enter your details to continue.'
                    : 'Sign up to get started.'}
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

                {authError && (
                  <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: '#FF3B30' }]}>
                    <Text style={styles.errorText}>{authError}</Text>
                  </View>
                )}

                <PrimaryButton
                  title={emailMode === 'signin' ? 'Sign In' : 'Create Account'}
                  onPress={handleEmailAuth}
                  isLoading={isLoading}
                  disabled={!email.trim() || !password.trim()}
                />

                <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => {
                    setAuthError(null);
                    setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
                    {emailMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      {emailMode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeInView>
          )}

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
                    I agree to the{' '}
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>

                <PrimaryButton
                  title="Get Started"
                  onPress={handleCompleteOnboarding}
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
  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    lineHeight: 20,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchModeText: {
    fontSize: 14,
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
