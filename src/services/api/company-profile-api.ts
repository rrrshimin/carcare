import type { CompanyProfileRow } from '@/types/company-profile';

import { supabase } from './supabase-client';

export async function getCompanyProfile(
  authUserId: string,
): Promise<CompanyProfileRow | null> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as CompanyProfileRow | null;
}

export async function upsertCompanyProfile(
  authUserId: string,
  fields: {
    company_name: string;
    billing_email: string;
    business_address?: string | null;
  },
): Promise<CompanyProfileRow> {
  const { data, error } = await supabase
    .from('company_profiles')
    .upsert(
      {
        auth_user_id: authUserId,
        company_name: fields.company_name,
        billing_email: fields.billing_email,
        business_address: fields.business_address ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'auth_user_id' },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CompanyProfileRow;
}

export async function deleteCompanyProfile(
  authUserId: string,
): Promise<void> {
  const { error } = await supabase
    .from('company_profiles')
    .delete()
    .eq('auth_user_id', authUserId);

  if (error) throw new Error(error.message);
}
