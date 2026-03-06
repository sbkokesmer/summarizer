import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_KEY = '@notification_prefs';

interface NotificationPrefs {
  summaryReady: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  summaryReady: true,
};

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const stored = await AsyncStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_PREFS;
}

export async function requestBrowserPermission(): Promise<boolean> {
  if (Platform.OS !== 'web') return false;
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function notifySummaryReady(title: string, body: string) {
  if (Platform.OS !== 'web') return;
  if (typeof Notification === 'undefined') return;

  const prefs = await getNotificationPrefs();
  if (!prefs.summaryReady) return;

  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body: body.slice(0, 120),
      icon: '/favicon.png',
    });
  } catch {}
}
