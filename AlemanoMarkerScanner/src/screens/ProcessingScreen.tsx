import React, {useEffect, useState} from 'react';
import {Alert, Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../components/ui/Header';
import {ProgressRing} from '../components/ui/ProgressRing';
import {MarkerDetectorModule} from '../native/MarkerDetectorModule';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';
import {buildMarkerCapture} from '../utils/imageUtils';

type Props = NativeStackScreenProps<'Processing'>;

export function ProcessingScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const scanCount = useMarkerStore(state => state.scanCount);
  const setDraftMarker = useMarkerStore(state => state.setDraftMarker);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      setProgress(value => (value < 88 ? value + 6 : value));
    }, 180);

    const run = async () => {
      try {
        const result = await MarkerDetectorModule.extractMarker(
          route.params.frameUri,
          route.params.corners as [number, number][],
        );
        const marker = await buildMarkerCapture(
          result.uri,
          scanCount + 1,
        );

        if (!mounted) {
          return;
        }

        setDraftMarker(marker);
      } catch {
        if (!mounted) {
          return;
        }

        setDraftMarker(null);
        Alert.alert(
          'Marker not detected',
          'The photo did not match the marker pattern. Try again with the full marker centered in the camera frame.',
        );
      } finally {
        if (!mounted) {
          return;
        }

        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          if (!mounted) {
            return;
          }

          const draft = useMarkerStore.getState().draftMarker;
          if (draft != null) {
            navigation.replace('Preview', {markerId: draft.id});
            return;
          }

          navigation.goBack();
        }, 450);
      }
    };

    run().catch(() => undefined);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [
    navigation,
    route.params.corners,
    route.params.frameUri,
    scanCount,
    setDraftMarker,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header
        showBack
        title="Processing"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <ProgressRing progress={progress} />
        <View style={styles.previewCard}>
          <Image
            source={{uri: route.params.frameUri}}
            resizeMode="contain"
            style={styles.previewImage}
          />
        </View>
        <Text style={styles.body}>
          Validating marker geometry and correcting orientation...
        </Text>
        <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  previewCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 220,
    justifyContent: 'center',
    marginTop: spacing.xl,
    width: 220,
  },
  previewImage: {
    borderRadius: 12,
    height: 180,
    width: 180,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  progressLabel: {
    ...typography.h2,
    color: colors.accent,
    marginTop: spacing.md,
  },
});
