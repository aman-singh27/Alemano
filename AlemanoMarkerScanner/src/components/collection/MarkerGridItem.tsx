import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {MarkerThumbnail} from '../ui/MarkerThumbnail';
import {spacing} from '../../theme';

export interface MarkerGridItemProps {
  uri: string | null;
  onPress?: () => void;
  size?: number;
}

export function MarkerGridItem({
  uri,
  onPress,
  size = 300,
}: MarkerGridItemProps): React.JSX.Element {
  const opacity = useSharedValue(uri == null ? 1 : 0);
  const scale = useSharedValue(uri == null ? 1 : 0.96);

  useEffect(() => {
    if (uri == null) {
      return;
    }

    opacity.value = withTiming(1, {duration: 200});
    scale.value = withTiming(1, {duration: 200});
  }, [opacity, scale, uri]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  if (uri == null) {
    return (
      <View style={[styles.item, {height: size, width: size}]}> 
        <MarkerThumbnail size={size} uri={null} />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel="Open marker details"
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.item, {height: size, width: size}]}> 
      <Animated.View style={animatedStyle}>
        <MarkerThumbnail size={size} uri={uri} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: spacing.md,
  },
});
