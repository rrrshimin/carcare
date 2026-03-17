import type { UserProfile } from '@/types/auth';

import { supabase } from './supabase-client';

export async function getProfileByAuthId(
  authUserId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserProfile | null;
}

export async function createProfile(
  authUserId: string,
  username: string,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ auth_user_id: authUserId, username: username.trim() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as UserProfile;
}

export async function updateProfileUsername(
  profileId: string,
  username: string,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ username: username.trim(), updated_at: new Date().toISOString() })
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as UserProfile;
}
