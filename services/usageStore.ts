import AsyncStorage from '@react-native-async-storage/async-storage';

const USAGE_KEY = 'free_usage_count';
export const FREE_LIMIT = 5;

export async function getUsageCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    return parseInt(raw, 10) || 0;
  } catch {
    return 0;
  }
}

export async function incrementUsage(): Promise<number> {
  try {
    const current = await getUsageCount();
    const next = current + 1;
    await AsyncStorage.setItem(USAGE_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export async function resetUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USAGE_KEY);
  } catch {}
}
