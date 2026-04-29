import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Camera,
  type CameraDevice,
  type CameraProps,
} from 'react-native-vision-camera';

export interface CameraViewProps {
  cameraRef: React.RefObject<Camera>;
  device: CameraDevice | undefined;
  format?: CameraDevice['formats'][number];
  isActive: boolean;
  frameProcessorFps?: number;
  frameProcessor?: CameraProps['frameProcessor'];
}

export function CameraView({
  cameraRef,
  device,
  format,
  isActive,
  frameProcessorFps,
  frameProcessor,
}: CameraViewProps): React.JSX.Element {
  if (device == null) {
    return <View style={styles.placeholder} />;
  }

  return (
    <Camera
      frameProcessor={frameProcessor}
        frameProcessorFps={frameProcessorFps}
      isActive={isActive}
      photo
      ref={cameraRef}
      resizeMode="cover"
      style={StyleSheet.absoluteFill}
      device={device}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFillObject,
  },
});
