import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../theme';

export interface DetectionIndicatorProps {
  active: boolean;
}

export function DetectionIndicator({
  active,
}: DetectionIndicatorProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      opacity.value = withTiming(1, {duration: 120});
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {duration: 150}),
          withTiming(1, {duration: 150}),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, {duration: 120});
      opacity.value = withTiming(0, {duration: 120});
    }
  }, [active, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.reticle, animatedStyle]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </Animated.View>
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
    borderColor: colors.scannerReticleActive,
    height: 64,
    position: 'absolute',
    width: 64,
  },
  topLeft: {
    borderLeftWidth: 5,
    borderTopWidth: 5,
    left: 0,
    top: 0,
  },
  topRight: {
    borderRightWidth: 5,
    borderTopWidth: 5,
    right: 0,
    top: 0,
  },
  bottomLeft: {
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 5,
    borderRightWidth: 5,
    bottom: 0,
    right: 0,
  },
});
