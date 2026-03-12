import type { Tables } from '@/types/database';

import { supabase } from './supabase-client';

export type LogTypeRow = Tables<'log_types'>;

export async function getAllLogTypes(): Promise<LogTypeRow[]> {
  const { data, error } = await supabase
    .from('log_types')
    .select('*')
    .order('id');

  if (error) throw error;
  return data ?? [];
}

export async function getLogTypeById(
  id: number,
): Promise<LogTypeRow | null> {
  const { data, error } = await supabase
    .from('log_types')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLogTypesByCategoryId(
  categoryId: number,
): Promise<LogTypeRow[]> {
  const { data, error } = await supabase
    .from('log_types')
    .select('*')
    .eq('category_link', categoryId)
    .order('id');

  if (error) throw error;
  return data ?? [];
}
