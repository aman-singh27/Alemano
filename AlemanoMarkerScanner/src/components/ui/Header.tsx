import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, typography} from '../../theme';

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightIconName?: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
}

export function Header({
  title,
  showBack = false,
  rightIconName,
  onBackPress,
  onRightPress,
}: HeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={spacing.sm}
            onPress={onBackPress}
            style={styles.iconButton}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={styles.side}>
        {rightIconName ? (
          <Pressable
            accessibilityLabel={rightIconName}
            accessibilityRole="button"
            hitSlop={spacing.sm}
            onPress={onRightPress}
            style={styles.iconButton}>
            <MaterialIcons
              name={rightIconName}
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: spacing.screenPadding,
  },
  side: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
  },
});
