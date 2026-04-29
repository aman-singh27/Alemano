import React, {useEffect} from 'react';
import {Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/ui/Button';
import {Header} from '../components/ui/Header';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';
import {formatFileSize, formatTimestamp} from '../utils/formatters';

type Props = NativeStackScreenProps<'MarkerDetail'>;

export function MarkerDetailScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const marker = useMarkerStore(state =>
    state.capturedMarkers.find(item => item.id === route.params.markerId),
  );

  useEffect(() => {
    if (marker == null) {
      navigation.goBack();
    }
  }, [marker, navigation]);

  if (marker == null) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header
        showBack
        title="Marker Detail"
        rightIconName="share"
        onBackPress={() => navigation.goBack()}
        onRightPress={() =>
          navigation.navigate('Share', {markerId: route.params.markerId})
        }
      />

      <View style={styles.content}>
        <Image source={{uri: marker.uri}} style={styles.image} />

        <View style={styles.table}>
          <MetadataRow
            label="Captured On"
            value={formatTimestamp(marker.capturedAt)}
          />
          <MetadataRow label="Resolution" value="300 x 300 px" />
          <MetadataRow
            label="Orientation"
            value={
              marker.orientation === 0
                ? 'Auto-corrected'
                : `${marker.orientation} degrees corrected`
            }
          />
          <MetadataRow
            label="File Size"
            value={formatFileSize(marker.fileSize)}
          />
        </View>

        <View style={styles.cta}>
          <Button
            label="Share Marker"
            onPress={() =>
              navigation.navigate('Share', {markerId: route.params.markerId})
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.screenPadding,
  },
  image: {
    alignSelf: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 300,
    marginBottom: spacing.xl,
    width: 300,
  },
  table: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '600',
  },
  cta: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
});
