import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/services/api/supabase-client';
import { signOut } from '@/services/auth-service';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';
import { appStorageKeys } from '@/services/storage-service';

/**
 * Permanently deletes all data associated with the authenticated user,
 * including the Supabase auth identity.
 *
 * Deletion order (respects FK constraints):
 * 1. transfer_requests (references vehicles)
 * 2. user_logs (references vehicles via car_id)
 * 3. vehicles
 * 4. company_profiles
 * 5. user_profiles
 * 6. Local storage cleanup
 * 7. Delete auth user via Edge Function (service_role)
 * 8. Sign out + local state cleanup
 */
export async function deleteAccount(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('No authenticated session found.');
  }

  const authUserId = session.user.id;
  const accessToken = session.access_token;

  const { data: vehicles, error: vErr } = await supabase
    .from('vehicles')
    .select('id')
    .eq('auth_user_id', authUserId);
  if (vErr) throw new Error(`Failed to fetch vehicles: ${vErr.message}`);

  const vehicleIds = (vehicles ?? []).map((v) => v.id);

  // 1. transfer_requests — user as sender or recipient
  const { error: tSendErr } = await supabase
    .from('transfer_requests')
    .delete()
    .eq('sender_auth_id', authUserId);
  if (tSendErr) throw new Error(`Failed to delete sent transfers: ${tSendErr.message}`);

  const { error: tRecvErr } = await supabase
    .from('transfer_requests')
    .delete()
    .eq('recipient_auth_id', authUserId);
  if (tRecvErr) throw new Error(`Failed to delete received transfers: ${tRecvErr.message}`);

  // 2. user_logs for all user's vehicles
  if (vehicleIds.length > 0) {
    const { error: logsErr } = await supabase
      .from('user_logs')
      .delete()
      .in('car_id', vehicleIds);
    if (logsErr) throw new Error(`Failed to delete maintenance logs: ${logsErr.message}`);
  }

  // 3. vehicles
  const { error: delVErr } = await supabase
    .from('vehicles')
    .delete()
    .eq('auth_user_id', authUserId);
  if (delVErr) throw new Error(`Failed to delete vehicles: ${delVErr.message}`);

  // 4. company_profiles
  const { error: compErr } = await supabase
    .from('company_profiles')
    .delete()
    .eq('auth_user_id', authUserId);
  if (compErr) throw new Error(`Failed to delete company profile: ${compErr.message}`);

  // 5. user_profiles
  const { error: profErr } = await supabase
    .from('user_profiles')
    .delete()
    .eq('auth_user_id', authUserId);
  if (profErr) throw new Error(`Failed to delete profile: ${profErr.message}`);

  // 6. Clean up vehicle-specific local storage
  await Promise.all(
    vehicleIds.map((id) =>
      AsyncStorage.removeItem(`${appStorageKeys.lastMileageUpdate}.${id}`).catch(() => {}),
    ),
  );

  // 7. Delete the auth.users entry via Edge Function
  await deleteAuthUser(accessToken);

  // 8. Sign out — clears session, vehicle cache, and entitlement store
  await signOut();
}

/**
 * Calls the `delete-user` Edge Function which uses the service_role key
 * to remove the calling user from auth.users.
 */
async function deleteAuthUser(accessToken: string): Promise<void> {
  const url = `${SUPABASE_URL}/functions/v1/delete-user`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to delete auth account: ${res.status} ${body}`);
  }
}
