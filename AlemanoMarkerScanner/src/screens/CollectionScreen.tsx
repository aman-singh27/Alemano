import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MarkerGrid} from '../components/collection/MarkerGrid';
import {Button} from '../components/ui/Button';
import {Header} from '../components/ui/Header';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Collection'>;

export function CollectionScreen({navigation}: Props): React.JSX.Element {
  const markers = useMarkerStore(state => state.capturedMarkers);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header
        showBack
        title="Collection"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryTextWrap}>
          <Text style={styles.summaryLabel}>Saved markers</Text>
          <Text style={styles.summaryTitle}>
            {markers.length === 0
              ? 'No markers yet'
              : `${markers.length} marker${markers.length === 1 ? '' : 's'} saved`}
          </Text>
          <Text style={styles.summaryBody}>
            {markers.length === 0
              ? 'Scan a marker to start building your collection.'
              : 'Tap any item to open its details or share it.'}
          </Text>
        </View>

        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeValue}>{markers.length}</Text>
          <Text style={styles.summaryBadgeLabel}>/ 20</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <MarkerGrid
          markers={markers}
          onPressMarker={markerId =>
            navigation.navigate('MarkerDetail', {markerId})
          }
          scrollEnabled
          style={styles.grid}
        />
      </View>

      <View style={styles.cta}>
        <Button
          label={markers.length > 0 ? 'Scan another marker' : 'Start scanning'}
          onPress={() => navigation.navigate('Scanner')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  summaryTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  summaryBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    minWidth: 88,
  },
  summaryBadgeValue: {
    ...typography.h1,
  },
  summaryBadgeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gridContainer: {
    flex: 1,
    marginTop: spacing.md,
  },
  grid: {
    flex: 1,
  },
  cta: {
    padding: spacing.screenPadding,
  },
});
