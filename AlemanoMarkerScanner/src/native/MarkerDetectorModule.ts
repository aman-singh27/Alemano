import {NativeModules} from 'react-native';
import type {Frame} from 'react-native-vision-camera';
import {VisionCameraProxy} from 'react-native-vision-camera';

export type MarkerCorner = [number, number];

export interface MarkerDetectionResult {
  detected: boolean;
  corners: MarkerCorner[];
  orientation: 0 | 90 | 180 | 270;
}

export interface MarkerExtractionResult {
  uri: string;
  width: 300;
  height: 300;
  orientation: 0 | 90 | 180 | 270;
  fileSize: number;
}

interface NativeMarkerDetectorModule {
  extractMarker(
    frameUri: string,
    corners: MarkerCorner[],
  ): Promise<MarkerExtractionResult>;
}

type MarkerFrameProcessorPlugin = {
  call(frame: Frame): MarkerDetectionResult;
};

const nativeModule = NativeModules.MarkerDetectorModule as
  | NativeMarkerDetectorModule
  | undefined;

export function detectMarker(frame: Frame): MarkerDetectionResult | null {
  'worklet';
  try {
    const plugin = VisionCameraProxy.initFrameProcessorPlugin(
      'detectMarker',
      {},
    ) as MarkerFrameProcessorPlugin | undefined;

    if (plugin == null) {
      return null;
    }

    return plugin.call(frame);
  } catch {
    return null;
  }
}

export const MarkerDetectorModule: NativeMarkerDetectorModule = {
  extractMarker(frameUri: string, corners: MarkerCorner[]) {
    if (nativeModule == null) {
      return Promise.reject(
        new Error('MarkerDetectorModule native module is not available.'),
      );
    }

    return nativeModule.extractMarker(frameUri, corners);
  },
};

export function isNativeMarkerDetectionAvailable(): boolean {
  return nativeModule != null;
}
