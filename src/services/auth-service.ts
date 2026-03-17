import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/services/api/supabase-client';
import { appStorageKeys } from '@/services/storage-service';
import { resetVehicleStore } from '@/store/vehicle-store';

/**
 * True while signInWithGoogle is running. The deep-link fallback in
 * AuthProvider checks this to avoid a competing exchange attempt that
 * would consume the PKCE verifier before (or after) the primary path.
 */
let _oauthInProgress = false;

export function isOAuthInProgress(): boolean {
  return _oauthInProgress;
}

/**
 * Extracts a PKCE authorization code from a redirect URL
 * and exchanges it for a Supabase session.
 */
export async function exchangeCodeFromUrl(url: string): Promise<Session | null> {
  const codeMatch = url.match(/[?&]code=([^&#]+)/);
  if (!codeMatch) {
    console.log('[Auth] No code param found in URL');
    return null;
  }

  const code = codeMatch[1];
  console.log('[Auth] Exchanging PKCE code for session (code length:', code.length, ')');

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth] Code exchange failed:', error.message);
    throw error;
  }

  console.log('[Auth] Code exchange succeeded, user:', data.session?.user?.email);
  return data.session;
}

export async function signInWithApple(): Promise<Session> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple sign-in failed — no identity token received.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;
  if (!data.session) throw new Error('Apple sign-in succeeded but no session was returned.');

  return data.session;
}

/**
 * Opens browser for Google OAuth using Supabase PKCE flow.
 * PKCE sends the auth code via a proper HTTP 302 redirect (not JS),
 * which Chrome Custom Tabs on Android can intercept.
 *
 * Returns the session on success, or null if the browser was dismissed
 * (in which case the deep-link listener in AuthProvider may still
 * catch the redirect).
 */
export async function signInWithGoogle(): Promise<Session | null> {
  const redirectUrl = Linking.createURL('auth/callback');

  console.log('[Auth] ── Google sign-in starting ──');
  console.log('[Auth] redirectUrl:', redirectUrl);
  console.log('[Auth] redirectUrl scheme:', redirectUrl.split('://')[0]);

  _oauthInProgress = true;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('Google sign-in failed — no OAuth URL returned.');

    console.log('[Auth] Opening browser for OAuth...');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    console.log('[Auth] Browser result type:', result.type);

    if (result.type === 'success') {
      const url = result.url;
      console.log('[Auth] Browser returned URL:', url);
      const hasCode = url.includes('code=');
      const hasError = url.includes('error=');
      console.log('[Auth] URL has code:', hasCode, '| has error:', hasError);

      if (hasCode) {
        const session = await exchangeCodeFromUrl(url);
        console.log('[Auth] Session after code exchange:', session ? 'OK' : 'null');
        if (session) return session;
      }
    } else if (result.type === 'cancel') {
      console.log('[Auth] Browser was dismissed by user');
    } else {
      console.log('[Auth] Browser result:', JSON.stringify(result));
    }

    return null;
  } finally {
    _oauthInProgress = false;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  resetVehicleStore();
  await AsyncStorage.removeItem(appStorageKeys.vehicle);
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
