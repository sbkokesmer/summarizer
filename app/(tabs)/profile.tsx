import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
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
  Trash2,
  User,
  Zap,
  Star,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePurchases } from '@/context/PurchasesContext';
import { loadHistory } from '@/services/historyStore';
import { getUsageCount, FREE_LIMIT } from '@/services/usageStore';
import { SwipeTabView } from '@/components/SwipeTabView';

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

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const { colors, isDark, setThemeMode } = useTheme();
  const { isPro, remainingFreeUses, usageCount } = usePurchases();
  const insets = useSafeAreaInsets();

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadHistory(user.id).then((items) => setHistoryCount(items.length));
      }
    }, [user])
  );

  const selectLanguage = (langId: string) => {
    i18n.changeLanguage(langId);
    setLanguageSheetVisible(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('settings.logout'),
      'Are you sure you want to sign out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setIsDeleting(false);
    } else {
      setDeleteSheetVisible(false);
    }
  };

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];
  const currentLang = APP_LANGUAGES.find(l => l.id === i18n.language) || APP_LANGUAGES[0];

  const avatarLabel = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <SwipeTabView>
      <View style={styles.root}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} pointerEvents="none" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

          <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
              <Text style={[styles.avatarLabel, { color: colors.text }]}>{avatarLabel}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.avatarEmail, { color: colors.text }]} numberOfLines={1}>
                {user?.email ?? 'Unknown'}
              </Text>
              <View style={styles.avatarMeta}>
                {isPro ? (
                  <View style={[styles.proBadge, { backgroundColor: '#FFD70020' }]}>
                    <Star size={11} color="#FFD700" strokeWidth={2.5} />
                    <Text style={styles.proBadgeText}>Pro</Text>
                  </View>
                ) : (
                  <View style={[styles.freeBadge, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                    <Text style={[styles.freeBadgeText, { color: colors.textSecondary }]}>Free</Text>
                  </View>
                )}
                <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
                  Joined {new Date(user?.created_at ?? Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>

          {!isPro && (
            <TouchableOpacity
              style={[styles.upgradeCard, { borderColor: 'rgba(255,200,0,0.3)' }]}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1A1A1A', '#0D0D0D']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.upgradeLeft}>
                <Crown size={22} color="#FFD700" />
                <View>
                  <Text style={styles.upgradeTitle}>{t('settings.upgrade')}</Text>
                  <Text style={styles.upgradeSubtitle}>{t('settings.upgrade_desc')}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}

          {!isPro && (
            <View style={[styles.statsRow, { gap: 12 }]}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Zap size={18} color="#007AFF" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>{usageCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Summaries used</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Crown size={18} color="#FFD700" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>{remainingFreeUses}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Free remaining</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <User size={18} color="#34C759" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>{historyCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved results</Text>
              </View>
            </View>
          )}

          {isPro && (
            <View style={[styles.statsRow, { gap: 12 }]}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Zap size={18} color="#007AFF" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>{usageCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total summaries</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Star size={18} color="#FFD700" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>∞</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Unlimited use</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <User size={18} color="#34C759" strokeWidth={2} />
                <Text style={[styles.statValue, { color: colors.text }]}>{historyCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved results</Text>
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.language')}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                    {currentLang.icon} {currentLang.label}
                  </Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                    <Moon size={20} color={colors.text} />
                  </View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.dark_mode')}</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.notifications')}</Text>
                </View>
                <View style={styles.rowRight}>
                  <ChevronRight size={18} color={colors.textSecondary} />
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.help_center')}</Text>
                </View>
                <View style={styles.rowRight}>
                  <ChevronRight size={18} color={colors.textSecondary} />
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.privacy_policy')}</Text>
                </View>
                <View style={styles.rowRight}>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Account
            </Text>
            <View style={[styles.group, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                    <LogOut size={20} color="#FF3B30" />
                  </View>
                  <Text style={[styles.rowTitle, { color: '#FF3B30' }]}>{t('settings.logout')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.row, { borderBottomWidth: 0 }]}
                onPress={() => { setDeleteError(null); setDeleteSheetVisible(true); }}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                    <Trash2 size={20} color="#FF3B30" />
                  </View>
                  <Text style={[styles.rowTitle, { color: '#FF3B30' }]}>Delete Account</Text>
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
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              <Text style={styles.sheetTitle}>{t('settings.language')}</Text>
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
                            <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
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

        <Modal
          visible={deleteSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => { if (!isDeleting) setDeleteSheetVisible(false); }}
        >
          <View style={styles.overlay}>
            <Pressable
              style={styles.backdrop}
              onPress={() => { if (!isDeleting) setDeleteSheetVisible(false); }}
            />
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 100}
              tint="dark"
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 32) }]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              <View style={styles.deleteIconWrap}>
                <View style={styles.deleteIconBg}>
                  <Trash2 size={28} color="#FF3B30" strokeWidth={2} />
                </View>
              </View>

              <Text style={styles.deleteTitle}>Delete Account</Text>
              <Text style={styles.deleteDesc}>
                This will permanently delete your account and all associated data — including your history and usage records. This action cannot be undone.
              </Text>

              {deleteError && (
                <View style={styles.deleteErrorBox}>
                  <Text style={styles.deleteErrorText}>{deleteError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.deleteConfirmBtn, isDeleting && styles.deleteConfirmBtnDisabled]}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                <Text style={styles.deleteConfirmText}>
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => { if (!isDeleting) setDeleteSheetVisible(false); }}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteCancelText, { color: isDeleting ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>
      </View>
    </SwipeTabView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -1, marginBottom: 20 },

  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarLabel: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  avatarInfo: { flex: 1, minWidth: 0 },
  avatarEmail: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3, marginBottom: 6 },
  avatarMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  proBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFD700', letterSpacing: 0.3 },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  freeBadgeText: { fontSize: 11, fontWeight: '600' },
  memberSince: { fontSize: 12 },

  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  upgradeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  upgradeTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  upgradeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  statsRow: { flexDirection: 'row', marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 12,
  },
  group: { borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 15 },
  version: { textAlign: 'center', fontSize: 13, marginTop: 8 },

  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Platform.OS === 'android' ? 'rgba(20,20,22,0.98)' : 'transparent',
  },
  handleContainer: { alignItems: 'center', marginBottom: 20 },
  handle: { width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16, letterSpacing: -0.4 },

  langScroll: { maxHeight: 420 },
  langList: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langIcon: { fontSize: 22 },
  langLabel: { fontSize: 17, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  langLabelSelected: { color: '#FFFFFF', fontWeight: '600' },
  langSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 60 },

  deleteIconWrap: { alignItems: 'center', marginBottom: 20 },
  deleteIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,59,48,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  deleteDesc: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  deleteErrorBox: {
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  deleteErrorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center' },
  deleteConfirmBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteConfirmBtnDisabled: { opacity: 0.5 },
  deleteConfirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteCancelBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteCancelText: { fontSize: 16, fontWeight: '500' },
});
