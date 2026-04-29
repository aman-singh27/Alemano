import RNFS from 'react-native-fs';
import type {MarkerCapture} from '../types';

export async function buildMarkerCapture(
  uri: string,
  frameIndex: number,
): Promise<MarkerCapture> {
  const stats = await RNFS.stat(normalizeFileUri(uri));

  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    uri,
    capturedAt: new Date().toISOString(),
    orientation: 0,
    fileSize: Number(stats.size),
    frameIndex,
    width: 300,
    height: 300,
  };
}

export function normalizeFileUri(uri: string): string {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}
