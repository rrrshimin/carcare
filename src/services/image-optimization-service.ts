import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.75;

export class ImageTooLargeError extends Error {
  constructor() {
    super('Image is too large. Please choose a smaller photo (under 25 MB).');
    this.name = 'ImageTooLargeError';
  }
}

async function getFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  if (!info.exists) throw new Error('Selected image file not found.');
  return (info as { size: number }).size;
}

function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
  });
}

/**
 * Validates file size, then resizes (longest side capped at 1920px)
 * and compresses to JPEG 0.75 quality. Returns the optimized local URI.
 *
 * - Images already under 1920px are not upscaled — only compressed.
 * - Falls back to the original URI if manipulation fails so the
 *   user is not blocked (the picker already applies quality: 0.8).
 */
export async function prepareVehicleImage(uri: string): Promise<string> {
  const size = await getFileSize(uri);
  if (size > MAX_ORIGINAL_BYTES) {
    throw new ImageTooLargeError();
  }

  try {
    const { width, height } = await getImageDimensions(uri);
    const longestSide = Math.max(width, height);

    const actions: { resize: { width?: number; height?: number } }[] = [];
    if (longestSide > MAX_DIMENSION) {
      if (width >= height) {
        actions.push({ resize: { width: MAX_DIMENSION } });
      } else {
        actions.push({ resize: { height: MAX_DIMENSION } });
      }
    }

    const result = await manipulateAsync(uri, actions, {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch (e) {
    console.warn('[ImageOptimization] Compression failed, using original:', e);
    return uri;
  }
}
