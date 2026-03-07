import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Crown,
  ChevronRight,
  Bell,
  Moon,
  Globe,
  Shield,
  CircleHelp,
  LogOut,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePurchases } from '@/context/PurchasesContext';

const APP_LANGUAGES = [
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

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isPro } = usePurchases();
  const insets = useSafeAreaInsets();

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);

  const selectLanguage = (langId: string) => {
    i18n.changeLanguage(langId);
    setLanguageSheetVisible(false);
  };

  const toggleDarkMode = () => {
    if (isDark) {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {!isPro ? (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <View style={styles.premiumContent}>
              <Crown size={24} color="#FFFFFF" />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>{t('settings.upgrade')}</Text>
                <Text style={styles.premiumSubtitle}>{t('settings.upgrade_desc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.premiumBanner, styles.proBanner]}>
            <View style={styles.premiumContent}>
              <Crown size={24} color="#FFD700" />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>Pro Active</Text>
                <Text style={styles.premiumSubtitle}>You have access to all premium features.</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.preferences')}
          </Text>
          <View style={[styles.group, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => setLanguageSheetVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <Globe size={20} color={colors.text} />
                </View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('settings.language')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {APP_LANGUAGES.find(l => l.id === i18n.language)?.label || 'English'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <Moon size={20} color={colors.text} />
                </View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('settings.dark_mode')}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <Bell size={20} color={colors.text} />
                </View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('settings.notifications')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.support')}
          </Text>
          <View style={[styles.group, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/help-center')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <CircleHelp size={20} color={colors.text} />
                </View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('settings.help_center')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <Shield size={20} color={colors.text} />
                </View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('settings.privacy_policy')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.group, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                  <LogOut size={20} color="#FF3B30" />
                </View>
                <Text style={[styles.rowTitle, { color: '#FF3B30' }]}>
                  {t('settings.logout')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          {t('settings.version')} 1.0.0
        </Text>
      </ScrollView>

      <Modal
        visible={languageSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageSheetVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setLanguageSheetVisible(false)} />
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint="dark"
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <Text style={styles.sheetTitle}>
              {t('settings.language')}
            </Text>

            <ScrollView style={styles.langScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.langList}>
                {APP_LANGUAGES.map((lang, index) => {
                  const isSelected = i18n.language === lang.id;
                  return (
                    <React.Fragment key={lang.id}>
                      <TouchableOpacity
                        style={styles.langRow}
                        onPress={() => selectLanguage(lang.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.langLeft}>
                          <Text style={styles.langIcon}>{lang.icon}</Text>
                          <Text
                            style={[
                              styles.langLabel,
                              isSelected && styles.langLabelSelected,
                            ]}
                          >
                            {lang.label}
                          </Text>
                        </View>
                        {isSelected && <Check size={20} color="#FFFFFF" strokeWidth={2.5} />}
                      </TouchableOpacity>
                      {index < APP_LANGUAGES.length - 1 && <View style={styles.langSeparator} />}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  proBanner: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 12,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 15,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 40,
  },
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
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  langScroll: {
    maxHeight: 420,
  },
  langList: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
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
    fontSize: 22,
  },
  langLabel: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  langLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  langSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 60,
  },
});
