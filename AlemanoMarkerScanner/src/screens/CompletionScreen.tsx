import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/ui/Button';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Completion'>;

export function CompletionScreen({navigation}: Props): React.JSX.Element {
  const clearAll = useMarkerStore(state => state.clearAll);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.iconShell}>
        <MaterialIcons color={colors.white} name="check" size={52} />
      </View>
      <Text style={styles.title}>All Set!</Text>
      <Text style={styles.body}>
        You have scanned 20 / 20 markers successfully.
      </Text>

      <View style={styles.cta}>
        <Button
          label="View Collection"
          onPress={() => navigation.navigate('Collection')}
        />
        <Button
          label="Scan More"
          onPress={() => {
            clearAll();
            navigation.replace('Scanner');
          }}
          style={styles.secondaryButton}
          variant="text"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  iconShell: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 96,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.xxl,
    width: '100%',
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
});
