import React, {useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Camera,
  useCameraDevice,
  type CameraDevice,
} from 'react-native-vision-camera';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CameraView} from '../components/scanner/CameraView';
import {DetectionIndicator} from '../components/scanner/DetectionIndicator';
import {FrameCounter} from '../components/scanner/FrameCounter';
import {ScanOverlay} from '../components/scanner/ScanOverlay';
import {Button} from '../components/ui/Button';
import {useCameraPermission} from '../hooks/useCameraPermission';
import {useMarkerDetection} from '../hooks/useMarkerDetection';
import type {MarkerDetectionResult} from '../native/MarkerDetectorModule';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {useSettingsStore} from '../store/useSettingsStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Scanner'>;

const DEFAULT_CORNERS: number[][] = [
  [0, 0],
  [300, 0],
  [300, 300],
  [0, 300],
];

export function ScannerScreen({navigation}: Props): React.JSX.Element {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, isLoading, requestPermission} = useCameraPermission();
  const {flash, setFlash, autoCapture, vibration} = useSettingsStore();
  const scanCount = useMarkerStore(state => state.scanCount);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [latestDetection, setLatestDetection] =
    useState<MarkerDetectionResult | null>(null);
  const flashOpacity = useSharedValue(0);
  const canCapture = latestDetection != null && !isCapturing && scanCount < 20;

  const {frameProcessor, isNativeDetectionAvailable} = useMarkerDetection({
    enabled: device != null,
    autoCapture,
    onDetectionStateChange: setDetectionActive,
    onDetectionResultChange: setLatestDetection,
    onStableDetection: result => {
      handlePhotoCapture(result.corners).catch(() => undefined);
    },
  });

  const scannerHint = useMemo(() => {
    if (!hasPermission) {
      return 'Enable camera access to start scanning markers.';
    }

    if (device == null) {
      return 'No back camera detected on this device.';
    }

    if (scanCount >= 20) {
      return 'You have reached the 20 marker capture limit.';
    }

    if (detectionActive) {
      return canCapture
        ? 'Marker locked. Tap the capture button to continue.'
        : 'Hold the marker steady until the red frame appears.';
    }

    return isNativeDetectionAvailable
      ? 'Point the camera at a marker to begin detection.'
      : 'Native marker detection is not available on this device.';
  }, [
    canCapture,
    detectionActive,
    device,
    hasPermission,
    isNativeDetectionAvailable,
    scanCount,
  ]);

  const format = useMemo<CameraDevice['formats'][number] | undefined>(() => {
    const formats = device?.formats ?? [];
    return (
      formats
        .filter(
          candidate =>
            candidate.photoWidth >= 2000 &&
            candidate.photoWidth <= 3000 &&
            candidate.photoHeight >= 2000 &&
            candidate.photoHeight <= 3000,
        )
        .sort((left, right) => right.photoWidth - left.photoWidth)[0] ??
      formats.sort((left, right) => right.photoWidth - left.photoWidth)[0]
    );
  }, [device]);

  const handlePhotoCapture = async (corners: number[][]) => {
    if (cameraRef.current == null || isCapturing || scanCount >= 20) {
      return;
    }

    try {
      setIsCapturing(true);
      flashOpacity.value = withSequence(
        withTiming(0.85, {duration: 60}),
        withTiming(0, {duration: 90}),
      );
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: false,
        flash,
      });

      if (vibration) {
        ReactNativeHapticFeedback.trigger('impactMedium');
      }

      navigation.navigate('Processing', {
        frameUri: `file://${photo.path}`,
        corners,
      });
    } catch {
      Alert.alert('Capture failed', 'Please try capturing the marker again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const cycleFlashMode = () => {
    const nextMode = flash === 'auto' ? 'on' : flash === 'on' ? 'off' : 'auto';
    setFlash(nextMode);
  };

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle="dark-content"
        />
        <Text style={styles.permissionTitle}>Camera access is required</Text>
        <Text style={styles.permissionBody}>
          The scanner needs camera permission to detect and capture markers.
        </Text>
        <Button
          label="Enable Camera"
          onPress={() => {
            requestPermission().catch(() => undefined);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />

      <CameraView
        cameraRef={cameraRef}
        device={device}
        format={format}
        frameProcessor={frameProcessor}
        isActive
      />

      <View style={styles.darkOverlay} />
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, flashStyle]}
      />
      <ScanOverlay active={detectionActive} />
      <DetectionIndicator active={detectionActive} />
      <FrameCounter current={scanCount} />

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Scanner</Text>
        <Pressable onPress={cycleFlashMode} style={styles.topIconButton}>
          <MaterialIcons
            color={colors.white}
            name={
              flash === 'on'
                ? 'flash-on'
                : flash === 'off'
                ? 'flash-off'
                : 'flash-auto'
            }
            size={24}
          />
        </Pressable>
      </View>

      <View style={styles.toast}>
        <Text style={styles.toastText}>{scannerHint}</Text>
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => navigation.navigate('Collection')}
          style={styles.bottomAction}>
          <MaterialIcons color={colors.white} name="photo-library" size={26} />
        </Pressable>

        <Pressable
          onPress={() => {
            if (!canCapture || latestDetection == null) {
              Alert.alert(
                'Marker not detected',
                'Point the camera at the marker until the red frame appears, then try again.',
              );
              return;
            }

            handlePhotoCapture(latestDetection.corners).catch(() => undefined);
          }}
          style={[
            styles.captureButton,
            !canCapture && styles.captureButtonDisabled,
          ]}>
          <View style={styles.captureInner} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomAction}>
          <MaterialIcons color={colors.white} name="info-outline" size={26} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  permissionContainer: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  permissionTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: spacing.screenPadding,
    position: 'absolute',
    right: 0,
    top: spacing.lg,
  },
  topBarTitle: {
    ...typography.h2,
    color: colors.white,
  },
  topIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderRadius: 18,
    bottom: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  toastText: {
    ...typography.caption,
    color: colors.white,
  },
  bottomBar: {
    alignItems: 'center',
    bottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: spacing.screenPadding,
    position: 'absolute',
    right: spacing.screenPadding,
  },
  bottomAction: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  captureButton: {
    alignItems: 'center',
    borderColor: colors.accent,
    borderRadius: 40,
    borderWidth: 4,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  captureButtonDisabled: {
    opacity: 0.45,
  },
  captureInner: {
    backgroundColor: colors.white,
    borderRadius: 32,
    height: 64,
    width: 64,
  },
});
