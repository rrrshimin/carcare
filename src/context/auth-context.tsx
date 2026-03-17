import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/services/api/supabase-client';
import { getProfileByAuthId } from '@/services/api/user-profile-api';
import { claimGuestVehicles } from '@/services/api/vehicle-api';
import { exchangeCodeFromUrl, isOAuthInProgress } from '@/services/auth-service';
import { loadEntitlement } from '@/hooks/use-entitlement';
import { getDeviceId } from '@/services/storage-service';
import { clearVehicleCache } from '@/services/vehicle-service';
import { resetEntitlementStore } from '@/store/entitlement-store';
import type { UserProfile } from '@/types/auth';

type AuthContextValue = {
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  needsUsername: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (authUserId: string) => {
    try {
      const profile = await getProfileByAuthId(authUserId);
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    await fetchProfile(session.user.id);
  }, [session?.user?.id, fetchProfile]);

  // ── Supabase session bootstrap + listener ──────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      if (initial?.user?.id) {
        fetchProfile(initial.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AuthCtx] onAuthStateChange:', event, '| user:', newSession?.user?.email ?? 'none');
        setSession(newSession);
        if (newSession?.user?.id) {
          if (event === 'SIGNED_IN') {
            getDeviceId().then(async (deviceId) => {
              if (deviceId) {
                console.log('[AuthCtx] Claiming guest vehicles for', newSession.user.email);
                try {
                  await claimGuestVehicles(deviceId);
                  await clearVehicleCache();
                  await loadEntitlement();
                  console.log('[AuthCtx] Guest vehicles claimed, cache cleared, entitlement loaded');
                } catch (e) {
                  console.warn('[AuthCtx] Vehicle claim failed:', e);
                }
              }
            });
          }
          fetchProfile(newSession.user.id);
        } else {
          if (event === 'SIGNED_OUT') {
            resetEntitlementStore();
            clearVehicleCache().catch((e) =>
              console.warn('[AuthCtx] Cache clear on sign-out failed:', e),
            );
          }
          setUserProfile(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Deep-link fallback for OAuth redirects ─────────────────────────
  // Only exchanges the code when the primary signInWithGoogle flow is
  // NOT active.  When the browser returns normally, openAuthSessionAsync
  // resolves AND the Linking listener fires for the same URL.  Without
  // this guard both paths race to consume the one-time PKCE verifier.
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      console.log('[AuthCtx] Deep-link received:', event.url);

      if (!event.url.includes('code=')) return;

      if (isOAuthInProgress()) {
        console.log('[AuthCtx] OAuth in progress – primary handler will exchange code');
        return;
      }

      console.log('[AuthCtx] Deep-link fallback: exchanging PKCE code...');
      exchangeCodeFromUrl(event.url).catch((e) => {
        console.warn('[AuthCtx] Failed to exchange code from deep link:', e);
      });
    }

    Linking.getInitialURL().then((url) => {
      console.log('[AuthCtx] Initial URL on mount:', url ?? 'none');
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = !!session;
    return {
      session,
      userProfile,
      isLoading,
      isAuthenticated,
      isGuest: !isAuthenticated,
      needsUsername: isAuthenticated && !userProfile,
      refreshProfile,
    };
  }, [session, userProfile, isLoading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
