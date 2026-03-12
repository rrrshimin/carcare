import { SHARE_BASE_URL } from '@/constants/config';

export function buildShareUrl(slug: string, baseUrl: string = SHARE_BASE_URL): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}/${slug}`;
}
