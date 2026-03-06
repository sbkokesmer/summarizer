import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'summarizer_history';
const MAX_ITEMS = 100;

export type InputType = 'text' | 'file' | 'url' | 'audio' | 'camera';

export interface HistoryItem {
  id: string;
  inputType: InputType;
  title: string;
  result: string;
  action: string;
  date: string;
  timestamp: number;
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export async function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'date' | 'timestamp'>): Promise<HistoryItem> {
  const now = new Date();
  const newItem: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: now.getTime(),
    date: now.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
  };
  try {
    const existing = await loadHistory();
    const updated = [newItem, ...existing].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[HistoryStore]', err);
  }
  return newItem;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const existing = await loadHistory();
    const updated = existing.filter((i) => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[HistoryStore]', err);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[HistoryStore]', err);
  }
}
