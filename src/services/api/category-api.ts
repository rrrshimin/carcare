import type { Tables } from '@/types/database';

import { supabase } from './supabase-client';

export type LogCategoryRow = Tables<'log_categories'>;

export async function getAllCategories(): Promise<LogCategoryRow[]> {
  const { data, error } = await supabase
    .from('log_categories')
    .select('*')
    .order('id');

  if (error) throw error;
  return data ?? [];
}
