import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../../theme';

export interface FrameCounterProps {
  current: number;
  total?: number;
}

export function FrameCounter({
  current,
  total = 20,
}: FrameCounterProps): React.JSX.Element {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {current} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.screenPadding,
    top: spacing.xxl,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
  },
});
