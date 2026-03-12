import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/config';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
