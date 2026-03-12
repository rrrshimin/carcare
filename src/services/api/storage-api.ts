import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';

import { supabase } from './supabase-client';

const VEHICLE_IMAGES_BUCKET = 'vehicle-images';

/**
 * Uploads a local image file to Supabase Storage and returns the public URL.
 * The file is read as base64, decoded, and uploaded with a unique name.
 */
export async function uploadVehicleImage(localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64',
  });

  const extension = extractExtension(localUri);
  const uniqueName = `${Crypto.randomUUID()}.${extension}`;
  const contentType = extensionToMime(extension);

  const { error: uploadError } = await supabase.storage
    .from(VEHICLE_IMAGES_BUCKET)
    .upload(uniqueName, decode(base64), {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(VEHICLE_IMAGES_BUCKET)
    .getPublicUrl(uniqueName);

  return data.publicUrl;
}

function extractExtension(uri: string): string {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1].toLowerCase() : 'jpg';
}

function extensionToMime(ext: string): string {
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

/** Decodes a base64 string into a Uint8Array suitable for Supabase upload. */
function decode(base64: string): Uint8Array {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}
