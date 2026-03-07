import { supabase } from '@/lib/supabase';

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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function loadHistory(userId: string): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from('history')
    .select('id, input_type, title, result, action, timestamp')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    inputType: row.input_type as InputType,
    title: row.title,
    result: row.result,
    action: row.action,
    timestamp: row.timestamp,
    date: formatDate(row.timestamp),
  }));
}

export async function saveHistoryItem(
  userId: string,
  item: Omit<HistoryItem, 'id' | 'date' | 'timestamp'>
): Promise<HistoryItem> {
  const now = Date.now();
  const id = `${now}-${Math.random().toString(36).slice(2)}`;

  await supabase.from('history').insert({
    id,
    user_id: userId,
    input_type: item.inputType,
    title: item.title,
    result: item.result,
    action: item.action,
    timestamp: now,
  });

  return {
    ...item,
    id,
    timestamp: now,
    date: formatDate(now),
  };
}

export async function deleteHistoryItem(userId: string, id: string): Promise<void> {
  await supabase.from('history').delete().eq('id', id).eq('user_id', userId);
}

export async function clearHistory(userId: string): Promise<void> {
  await supabase.from('history').delete().eq('user_id', userId);
}
