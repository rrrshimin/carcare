import type { Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  auth_user_id: string;
  username: string;
  public_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthState = {
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  needsUsername: boolean;
};
