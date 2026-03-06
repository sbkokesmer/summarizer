import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Bell, BellRing } from 'lucide-react-native';
import { requestPermission, getPermissionStatus } from '@/services/notifications';

const NOTIF_KEY = '@notification_prefs';

interface NotificationPrefs {
  summaryReady: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  summaryReady: true,
};

const TEXTS: Record<string, { heading: string; subtitle: string; summaryTitle: string; summaryDesc: string; permBanner: string; permBtn: string; permDenied: string; openSettings: string; footnote: string }> = {
  en: {
    heading: 'Notifications',
    subtitle: 'Manage how you receive notifications from SummaLingua.',
    summaryTitle: 'Summary Ready',
    summaryDesc: 'Get notified when your summary or translation is completed.',
    permBanner: 'Notifications are not enabled. Allow notifications to get alerts when your content is ready.',
    permBtn: 'Enable Notifications',
    permDenied: 'Notifications have been denied. Please enable them in your device settings.',
    openSettings: 'Open Settings',
    footnote: 'Notifications are delivered through your device. You can change permissions anytime in Settings.',
  },
  tr: {
    heading: 'Bildirimler',
    subtitle: 'SummaLingua bildirimlerini nasil alacaginizi yonetin.',
    summaryTitle: 'Ozet Hazir',
    summaryDesc: 'Ozetiniz veya ceviriniz tamamlandiginda bildirim alin.',
    permBanner: 'Bildirimler etkin degil. Icerik hazir oldugunda uyari almak icin bildirimlere izin verin.',
    permBtn: 'Bildirimleri Etkinlestir',
    permDenied: 'Bildirimler reddedildi. Lutfen cihaz ayarlarindan etkinlestirin.',
    openSettings: 'Ayarlari Ac',
    footnote: 'Bildirimler cihaziniz araciligiyla gonderilir. Izinleri istediginiz zaman Ayarlar\'dan degistirebilirsiniz.',
  },
  es: {
    heading: 'Notificaciones',
    subtitle: 'Gestione como recibe notificaciones de SummaLingua.',
    summaryTitle: 'Resumen listo',
    summaryDesc: 'Reciba una notificacion cuando su resumen o traduccion este completo.',
    permBanner: 'Las notificaciones no estan habilitadas. Permita las notificaciones para recibir alertas cuando su contenido este listo.',
    permBtn: 'Habilitar notificaciones',
    permDenied: 'Las notificaciones han sido denegadas. Habilitelas en la configuracion de su dispositivo.',
    openSettings: 'Abrir Ajustes',
    footnote: 'Las notificaciones se envian a traves de su dispositivo. Puede cambiar los permisos en cualquier momento en Ajustes.',
  },
  fr: {
    heading: 'Notifications',
    subtitle: 'Gerez la facon dont vous recevez les notifications de SummaLingua.',
    summaryTitle: 'Resume pret',
    summaryDesc: 'Soyez notifie lorsque votre resume ou traduction est termine.',
    permBanner: "Les notifications ne sont pas activees. Autorisez les notifications pour recevoir des alertes lorsque votre contenu est pret.",
    permBtn: 'Activer les notifications',
    permDenied: 'Les notifications ont ete refusees. Veuillez les activer dans les parametres de votre appareil.',
    openSettings: 'Ouvrir les Reglages',
    footnote: 'Les notifications sont envoyees via votre appareil. Vous pouvez modifier les permissions a tout moment dans les Reglages.',
  },
  de: {
    heading: 'Benachrichtigungen',
    subtitle: 'Verwalten Sie, wie Sie Benachrichtigungen von SummaLingua erhalten.',
    summaryTitle: 'Zusammenfassung fertig',
    summaryDesc: 'Erhalten Sie eine Benachrichtigung, wenn Ihre Zusammenfassung oder Ubersetzung fertig ist.',
    permBanner: 'Benachrichtigungen sind nicht aktiviert. Erlauben Sie Benachrichtigungen, um Alarme zu erhalten, wenn Ihr Inhalt fertig ist.',
    permBtn: 'Benachrichtigungen aktivieren',
    permDenied: 'Benachrichtigungen wurden abgelehnt. Bitte aktivieren Sie sie in den Gerateinstellungen.',
    openSettings: 'Einstellungen offnen',
    footnote: 'Benachrichtigungen werden uber Ihr Gerat zugestellt. Sie konnen die Berechtigungen jederzeit in den Einstellungen andern.',
  },
  it: {
    heading: 'Notifiche',
    subtitle: 'Gestisci come ricevi le notifiche da SummaLingua.',
    summaryTitle: 'Riassunto pronto',
    summaryDesc: 'Ricevi una notifica quando il tuo riassunto o traduzione e completo.',
    permBanner: 'Le notifiche non sono abilitate. Consenti le notifiche per ricevere avvisi quando il tuo contenuto e pronto.',
    permBtn: 'Abilita notifiche',
    permDenied: 'Le notifiche sono state negate. Abilitale nelle impostazioni del dispositivo.',
    openSettings: 'Apri Impostazioni',
    footnote: 'Le notifiche vengono inviate tramite il dispositivo. Puoi modificare i permessi in qualsiasi momento nelle Impostazioni.',
  },
  ja: {
    heading: '通知',
    subtitle: 'SummaLinguaからの通知の受け取り方法を管理します。',
    summaryTitle: '要約完了',
    summaryDesc: '要約または翻訳が完了したときに通知を受け取ります。',
    permBanner: '通知が有効になっていません。コンテンツの準備ができたときにアラートを受け取るには、通知を許可してください。',
    permBtn: '通知を有効にする',
    permDenied: '通知が拒否されました。デバイスの設定から有効にしてください。',
    openSettings: '設定を開く',
    footnote: '通知はデバイスを通じて配信されます。設定からいつでも権限を変更できます。',
  },
  ko: {
    heading: '알림',
    subtitle: 'SummaLingua에서 알림을 받는 방법을 관리합니다.',
    summaryTitle: '요약 완료',
    summaryDesc: '요약 또는 번역이 완료되면 알림을 받습니다.',
    permBanner: '알림이 활성화되지 않았습니다. 콘텐츠가 준비되면 알림을 받으려면 알림을 허용하세요.',
    permBtn: '알림 활성화',
    permDenied: '알림이 거부되었습니다. 기기 설정에서 활성화해 주세요.',
    openSettings: '설정 열기',
    footnote: '알림은 기기를 통해 전달됩니다. 설정에서 언제든지 권한을 변경할 수 있습니다.',
  },
  zh: {
    heading: '通知',
    subtitle: '管理您从 SummaLingua 接收通知的方式。',
    summaryTitle: '摘要完成',
    summaryDesc: '当您的摘要或翻译完成时收到通知。',
    permBanner: '通知未启用。允许通知以在内容准备好时收到提醒。',
    permBtn: '启用通知',
    permDenied: '通知已被拒绝。请在设备设置中启用。',
    openSettings: '打开设置',
    footnote: '通知通过您的设备发送。您可以随时在设置中更改权限。',
  },
};

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const { i18n } = useTranslation();

  const txt = TEXTS[i18n.language] || TEXTS.en;

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permStatus, setPermStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((stored) => {
      if (stored) {
        try { setPrefs(JSON.parse(stored)); } catch {}
      }
    });
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await getPermissionStatus();
    setPermStatus(status);
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setPermStatus(granted ? 'granted' : 'denied');
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const showPermBanner = permStatus !== 'granted';
  const isDenied = permStatus === 'denied';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>{txt.heading}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{txt.subtitle}</Text>

      {showPermBanner && (
        <View style={[styles.permBanner, { backgroundColor: isDark ? 'rgba(255,149,0,0.12)' : 'rgba(255,149,0,0.08)', borderColor: isDark ? 'rgba(255,149,0,0.3)' : 'rgba(255,149,0,0.2)' }]}>
          <BellRing size={20} color="#FF9500" />
          <View style={styles.permBannerText}>
            <Text style={[styles.permBannerDesc, { color: colors.text }]}>
              {isDenied ? txt.permDenied : txt.permBanner}
            </Text>
            {isDenied && Platform.OS !== 'web' ? (
              <TouchableOpacity
                style={[styles.permBtn, { backgroundColor: '#FF9500' }]}
                onPress={handleOpenSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.permBtnText}>{txt.openSettings}</Text>
              </TouchableOpacity>
            ) : !isDenied ? (
              <TouchableOpacity
                style={[styles.permBtn, { backgroundColor: '#FF9500' }]}
                onPress={handleEnableNotifications}
                activeOpacity={0.7}
              >
                <Text style={styles.permBtnText}>{txt.permBtn}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
              <Bell size={18} color={colors.text} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{txt.summaryTitle}</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{txt.summaryDesc}</Text>
            </View>
          </View>
          <Switch
            value={prefs.summaryReady}
            onValueChange={() => togglePref('summaryReady')}
            trackColor={{ false: isDark ? '#39393D' : '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Text style={[styles.footnote, { color: colors.textSecondary }]}>{txt.footnote}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  permBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  permBannerText: {
    flex: 1,
    gap: 12,
  },
  permBannerDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  permBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 14,
    lineHeight: 19,
  },
  footnote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
