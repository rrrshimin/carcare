const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL – add it to your .env file.',
  );
}

if (!key) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY – add it to your .env file.',
  );
}

export const SUPABASE_URL: string = url;
export const SUPABASE_ANON_KEY: string = key;

export const SHARE_BASE_URL = 'https://carcarediary.com';
