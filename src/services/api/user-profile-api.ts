import type { UserProfile } from '@/types/auth';

import { supabase } from './supabase-client';

function generatePublicId(): string {
  const digits = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `CC-${digits}`;
}

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

const MAX_PUBLIC_ID_RETRIES = 5;

export async function createProfile(
  authUserId: string,
  username: string,
): Promise<UserProfile> {
  for (let attempt = 0; attempt < MAX_PUBLIC_ID_RETRIES; attempt++) {
    const publicId = generatePublicId();
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        auth_user_id: authUserId,
        username: username.trim(),
        public_id: publicId,
      })
      .select()
      .single();

    if (!error) return data as UserProfile;

    const isUniqueViolation =
      error.code === '23505' && error.message.includes('public_id');
    if (!isUniqueViolation) throw new Error(error.message);
  }

  throw new Error('Could not generate a unique CarCare ID. Please try again.');
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
