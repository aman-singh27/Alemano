import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../../theme';

export interface ScanOverlayProps {
  active?: boolean;
}

export function ScanOverlay({
  active = false,
}: ScanOverlayProps): React.JSX.Element {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.reticle}>
        <View
          style={[styles.corner, styles.topLeft, active && styles.cornerActive]}
        />
        <View
          style={[
            styles.corner,
            styles.topRight,
            active && styles.cornerActive,
          ]}
        />
        <View
          style={[
            styles.corner,
            styles.bottomLeft,
            active && styles.cornerActive,
          ]}
        />
        <View
          style={[
            styles.corner,
            styles.bottomRight,
            active && styles.cornerActive,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  reticle: {
    height: 280,
    width: 280,
  },
  corner: {
    borderColor: colors.white,
    height: 56,
    position: 'absolute',
    width: 56,
  },
  cornerActive: {
    borderColor: colors.scannerReticleActive,
  },
  topLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: 0,
    top: 0,
  },
  topRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: 0,
    top: 0,
  },
  bottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
});
