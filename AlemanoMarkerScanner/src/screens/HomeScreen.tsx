import React from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/ui/Button';
import {Card} from '../components/ui/Card';
import {AppLogo} from '../components/ui/AppLogo';
import type {NativeStackScreenProps} from '../navigation/types';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Home'>;

export function HomeScreen({navigation}: Props): React.JSX.Element {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <AppLogo size={48} style={styles.logoMark} />
          <View>
            <Text style={styles.brand}>Alemeno</Text>
            <Text style={styles.brandSubtitle}>Marker Scanner</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}>
          <MaterialIcons color={colors.textPrimary} name="settings" size={22} />
        </Pressable>
      </View>

      <Text style={styles.title}>
        Scan custom markers with{' '}
        <Text style={styles.titleAccent}>precision</Text>
      </Text>
      <Text style={styles.subtitle}>Real-time detection. Zero noise.</Text>

      <View style={styles.cards}>
        <FeatureCard
          iconName="verified"
          subtitle="Detects only valid markers"
          title="High Accuracy"
        />
        <FeatureCard
          iconName="crop-free"
          subtitle="Orientation & perspective correction"
          title="Auto Correction"
        />
        <FeatureCard
          iconName="grid-view"
          subtitle="Capture up to 20 markers at once"
          title="Batch Capture"
        />
      </View>

      <View style={styles.ctaContainer}>
        <Button
          label="Start Scanning"
          onPress={() => navigation.navigate('Scanner')}
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureCard({
  iconName,
  title,
  subtitle,
}: {
  iconName: string;
  title: string;
  subtitle: string;
}): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <MaterialIcons color={colors.accent} name={iconName} size={28} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoMark: {
    marginRight: spacing.sm,
  },
  brand: {
    ...typography.h2,
  },
  brandSubtitle: {
    ...typography.caption,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  titleAccent: {
    color: colors.accent,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
    fontSize: 18,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaContainer: {
    marginTop: 'auto',
  },
});
