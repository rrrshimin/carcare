import * as Crypto from 'expo-crypto';

const SLUG_LENGTH = 10;
const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a URL-safe random slug using crypto-random bytes.
 * Output: 10-char lowercase alphanumeric string (e.g. "a3xk9m2b7q").
 */
export function createShareSlug(): string {
  const bytes = Crypto.getRandomBytes(SLUG_LENGTH);
  let slug = '';
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += SLUG_CHARS[bytes[i] % SLUG_CHARS.length];
  }
  return slug;
}
