import {useCallback, useMemo, useRef} from 'react';
import {runAtTargetFps, useFrameProcessor} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';
import {
  detectMarker,
  isNativeMarkerDetectionAvailable,
  type MarkerDetectionResult,
} from '../native/MarkerDetectorModule';

export interface UseMarkerDetectionOptions {
  enabled: boolean;
  autoCapture: boolean;
  onDetectionStateChange?: (detected: boolean) => void;
  onDetectionResultChange?: (result: MarkerDetectionResult | null) => void;
  onStableDetection: (result: MarkerDetectionResult) => void;
}

function areCornersStable(
  previous: MarkerDetectionResult | null,
  next: MarkerDetectionResult,
): boolean {
  if (previous == null || previous.corners.length !== next.corners.length) {
    return false;
  }

  return previous.corners.every((corner, index) => {
    const [prevX, prevY] = corner;
    const [nextX, nextY] = next.corners[index] ?? [0, 0];
    return Math.abs(prevX - nextX) <= 15 && Math.abs(prevY - nextY) <= 15;
  });
}

function areCornersWithinTolerance(
  previous: MarkerDetectionResult | null,
  next: MarkerDetectionResult,
  tolerance: number,
): boolean {
  if (previous == null || previous.corners.length !== next.corners.length) {
    return false;
  }

  return previous.corners.every((corner, index) => {
    const [prevX, prevY] = corner;
    const [nextX, nextY] = next.corners[index] ?? [0, 0];
    return (
      Math.abs(prevX - nextX) <= tolerance &&
      Math.abs(prevY - nextY) <= tolerance
    );
  });
}

export function useMarkerDetection({
  enabled,
  autoCapture,
  onDetectionStateChange,
  onDetectionResultChange,
  onStableDetection,
}: UseMarkerDetectionOptions) {
  const lastDetectionRef = useRef<MarkerDetectionResult | null>(null);
  const lastCapturedRef = useRef<MarkerDetectionResult | null>(null);
  const stableSinceRef = useRef<number | null>(null);
  const cooldownUntilRef = useRef(0);

  const handleDetectionResult = useCallback(
    (result: MarkerDetectionResult | null) => {
      if (!enabled || result == null || !result.detected) {
        onDetectionStateChange?.(false);
        onDetectionResultChange?.(null);
        lastDetectionRef.current = null;
        stableSinceRef.current = null;
        return;
      }

      onDetectionStateChange?.(true);
      onDetectionResultChange?.(result);
      const now = Date.now();
      const isStable = areCornersStable(lastDetectionRef.current, result);

      if (!isStable) {
        lastDetectionRef.current = result;
        stableSinceRef.current = now;
        return;
      }

      if (!autoCapture) {
        lastDetectionRef.current = result;
        return;
      }

      if (
        stableSinceRef.current != null &&
        now - stableSinceRef.current >= 500 &&
        now >= cooldownUntilRef.current
      ) {
        if (areCornersWithinTolerance(lastCapturedRef.current, result, 15)) {
          lastDetectionRef.current = result;
          return;
        }

        cooldownUntilRef.current = now + 1500;
        stableSinceRef.current = now;
        lastCapturedRef.current = result;
        onStableDetection(result);
      }

      lastDetectionRef.current = result;
    },
    [
      autoCapture,
      enabled,
      onDetectionResultChange,
      onDetectionStateChange,
      onStableDetection,
    ],
  );

  const runHandleDetectionResult = useMemo(
    () => Worklets.createRunOnJS(handleDetectionResult),
    [handleDetectionResult],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!enabled) {
        return;
      }

      runAtTargetFps(15, () => {
        'worklet';
        const result = detectMarker(frame);
        runHandleDetectionResult(result);
      });
    },
    [enabled, runHandleDetectionResult],
  );

  return useMemo(
    () => ({
      frameProcessor:
        enabled && isNativeMarkerDetectionAvailable()
          ? frameProcessor
          : undefined,
      isNativeDetectionAvailable: isNativeMarkerDetectionAvailable(),
    }),
    [enabled, frameProcessor],
  );
}
