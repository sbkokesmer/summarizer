import { supabase } from '@/lib/supabase';

export const FREE_LIMIT = 5;

export async function getUsageCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return 0;
  return data.usage_count;
}

export async function incrementUsage(userId: string): Promise<number> {
  const current = await getUsageCount(userId);
  const next = current + 1;

  await supabase
    .from('user_usage')
    .upsert({ user_id: userId, usage_count: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  return next;
}

export async function resetUsage(userId: string): Promise<void> {
  await supabase
    .from('user_usage')
    .upsert({ user_id: userId, usage_count: 0, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}
