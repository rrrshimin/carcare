import type { Tables } from '@/types/database';

export type CompanyProfileRow = Tables<'company_profiles'>;

export type CompanyProfileInput = {
  companyName: string;
  billingEmail: string;
  businessAddress?: string;
};
