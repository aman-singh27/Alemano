import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppLogo} from '../components/ui/AppLogo';
import type {NativeStackScreenProps} from '../navigation/types';
import {colors, spacing, typography} from '../theme';
import {useOnboarding} from '../hooks/useOnboarding';

type Props = NativeStackScreenProps<'Splash'>;

export function SplashScreen({navigation}: Props): React.JSX.Element {
  const {hasCompletedOnboarding, isReady} = useOnboarding();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeout = setTimeout(() => {
      navigation.replace(hasCompletedOnboarding ? 'Home' : 'Onboarding');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [hasCompletedOnboarding, isReady, navigation]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <AppLogo size={124} style={styles.logoMark} />
      <Text style={styles.title}>Alemeno</Text>
      <Text style={styles.subtitle}>Precision Marker Scanner</Text>
      <Text style={styles.caption}>
        Scan. Detect. Extract. With unmatched accuracy.
      </Text>
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
  logoMark: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
