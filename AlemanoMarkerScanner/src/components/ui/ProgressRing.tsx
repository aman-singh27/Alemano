import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors, typography} from '../../theme';

export interface ProgressRingProps {
  progress: number;
}

export function ProgressRing({progress}: ProgressRingProps): React.JSX.Element {
  const normalized = Math.max(0, Math.min(progress, 100));
  const animatedProgress = useSharedValue(normalized);

  useEffect(() => {
    animatedProgress.value = withTiming(normalized, {duration: 300});
  }, [animatedProgress, normalized]);

  const rightHalfStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          animatedProgress.value,
          [0, 50],
          [0, 180],
          'clamp',
        )}deg`,
      },
    ],
  }));

  const leftHalfStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          animatedProgress.value,
          [50, 100],
          [0, 180],
          'clamp',
        )}deg`,
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track} />
      <View style={styles.rightClip}>
        <Animated.View style={[styles.fill, rightHalfStyle]} />
      </View>
      <View style={styles.leftClip}>
        <Animated.View style={[styles.fill, styles.leftFill, leftHalfStyle]} />
      </View>
      <View style={styles.center}>
        <Text style={styles.percentage}>{Math.round(normalized)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: 180,
  },
  track: {
    borderColor: colors.border,
    borderRadius: 90,
    borderWidth: 10,
    height: 180,
    position: 'absolute',
    width: 180,
  },
  rightClip: {
    height: 180,
    left: 90,
    overflow: 'hidden',
    position: 'absolute',
    width: 90,
  },
  leftClip: {
    height: 180,
    overflow: 'hidden',
    position: 'absolute',
    width: 90,
  },
  fill: {
    borderColor: colors.accent,
    borderRadius: 90,
    borderWidth: 10,
    height: 180,
    left: -90,
    position: 'absolute',
    width: 180,
  },
  leftFill: {
    left: 0,
  },
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 70,
    height: 140,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    top: 20,
    width: 140,
  },
  percentage: {
    ...typography.h1,
    color: colors.accent,
  },
});
