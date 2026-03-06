import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const NOTIF_KEY = '@notification_prefs';

interface NotificationPrefs {
  summaryReady: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  tips: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  summaryReady: true,
  weeklyDigest: false,
  productUpdates: true,
  tips: false,
};

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const { i18n } = useTranslation();
  const isTR = i18n.language === 'tr';

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((stored) => {
      if (stored) {
        try {
          setPrefs(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const togglePref = (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  };

  const rows: { key: keyof NotificationPrefs; title: string; desc: string }[] = [
    {
      key: 'summaryReady',
      title: isTR ? 'Ozet Hazir' : 'Summary Ready',
      desc: isTR
        ? 'Ozetiniz hazir oldugunda bildirim alin'
        : 'Get notified when your summary is ready',
    },
    {
      key: 'weeklyDigest',
      title: isTR ? 'Haftalik Ozet' : 'Weekly Digest',
      desc: isTR
        ? 'Haftalik kullanim ozetinizi alin'
        : 'Receive a weekly summary of your usage',
    },
    {
      key: 'productUpdates',
      title: isTR ? 'Urun Guncellemeleri' : 'Product Updates',
      desc: isTR
        ? 'Yeni ozellikler ve iyilestirmeler hakkinda bilgi alin'
        : 'Learn about new features and improvements',
    },
    {
      key: 'tips',
      title: isTR ? 'Ipuclari ve Oneriler' : 'Tips & Suggestions',
      desc: isTR
        ? 'Uygulamadan en iyi sekilde yararlanmak icin ipuclari'
        : 'Tips to get the most out of the app',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        {isTR ? 'Bildirimler' : 'Notifications'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isTR
          ? 'Hangi bildirimleri almak istediginizi secin.'
          : 'Choose which notifications you want to receive.'}
      </Text>

      <View style={[styles.group, { backgroundColor: colors.card }]}>
        {rows.map((row, index) => (
          <View
            key={row.key}
            style={[
              styles.row,
              index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{row.title}</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{row.desc}</Text>
            </View>
            <Switch
              value={prefs[row.key]}
              onValueChange={() => togglePref(row.key)}
              trackColor={{ false: isDark ? '#39393D' : '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>

      <Text style={[styles.footnote, { color: colors.textSecondary }]}>
        {isTR
          ? 'Bildirimleri cihaz ayarlarinizdan da yonetebilirsiniz.'
          : 'You can also manage notifications from your device settings.'}
      </Text>
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
  },
});
