import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { 
  Crown, 
  ChevronRight, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  CircleHelp,
  LogOut
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const SettingRow = ({ icon: Icon, title, value, onPress, isSwitch = false, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: colors.card, borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={isSwitch && !onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDestructive ? 'rgba(255,59,48,0.1)' : colors.background }]}>
          <Icon size={20} color={isDestructive ? '#FF3B30' : colors.text} />
        </View>
        <Text style={[styles.rowTitle, { color: isDestructive ? '#FF3B30' : colors.text }]}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>}
        {isSwitch ? (
          <Switch value={isDark} disabled trackColor={{ true: '#34C759' }} />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* Premium Banner */}
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

      {/* Settings Groups */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.preferences')}</Text>
        <View style={[styles.group, { backgroundColor: colors.card }]}>
          <SettingRow 
            icon={Globe} 
            title={t('settings.language')} 
            value={i18n.language === 'en' ? 'English' : 'Türkçe'} 
            onPress={toggleLanguage}
          />
          <SettingRow icon={Moon} title={t('settings.dark_mode')} isSwitch />
          <SettingRow icon={Bell} title={t('settings.notifications')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.support')}</Text>
        <View style={[styles.group, { backgroundColor: colors.card }]}>
          <SettingRow icon={CircleHelp} title={t('settings.help_center')} />
          <SettingRow icon={Shield} title={t('settings.privacy_policy')} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.group, { backgroundColor: colors.card }]}>
          <SettingRow 
            icon={LogOut} 
            title={t('settings.logout')} 
            isDestructive 
            onPress={() => router.push('/login')}
          />
        </View>
      </View>

      <Text style={[styles.version, { color: colors.textSecondary }]}>{t('settings.version')} 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  premiumBanner: { margin: 20, padding: 20, borderRadius: 20, backgroundColor: '#000000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  premiumContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  premiumTextContainer: { flex: 1 },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  premiumSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 12 },
  group: { borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontSize: 15 },
  version: { textAlign: 'center', fontSize: 13, marginBottom: 40 },
});
