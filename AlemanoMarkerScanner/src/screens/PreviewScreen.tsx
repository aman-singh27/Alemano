import React, {useEffect} from 'react';
import {Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/ui/Button';
import {Header} from '../components/ui/Header';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Preview'>;

export function PreviewScreen({navigation}: Props): React.JSX.Element {
  const scanCount = useMarkerStore(state => state.scanCount);
  const draftMarker = useMarkerStore(state => state.draftMarker);
  const commitDraftMarker = useMarkerStore(state => state.commitDraftMarker);
  const setDraftMarker = useMarkerStore(state => state.setDraftMarker);
  const updateDraftMarker = useMarkerStore(state => state.updateDraftMarker);

  useEffect(() => {
    if (draftMarker == null) {
      navigation.replace('Scanner');
    }
  }, [draftMarker, navigation]);

  if (draftMarker == null) {
    return <SafeAreaView style={styles.container} />;
  }

  const rotate = (delta: number) => {
    updateDraftMarker(marker => ({
      ...marker,
      orientation: ((marker.orientation + delta + 360) % 360) as
        | 0
        | 90
        | 180
        | 270,
    }));
  };

  const handleAdd = () => {
    commitDraftMarker();
    const nextCount = useMarkerStore.getState().scanCount;
    navigation.replace(nextCount >= 20 ? 'Completion' : 'Collection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header
        showBack
        title="Preview"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.count}>{scanCount + 1} / 20</Text>
        <View style={styles.imageShell}>
          <Image
            source={{uri: draftMarker.uri}}
            resizeMode="contain"
            style={[
              styles.image,
              {transform: [{rotate: `${draftMarker.orientation}deg`}]},
            ]}
          />
        </View>

        <View style={styles.actions}>
          <ActionButton
            iconName="rotate-left"
            label="Rotate Left"
            onPress={() => rotate(-90)}
          />
          <ActionButton
            iconName="rotate-right"
            label="Rotate Right"
            onPress={() => rotate(90)}
          />
          <ActionButton
            iconName="delete-outline"
            label="Delete"
            onPress={() => {
              setDraftMarker(null);
              navigation.replace('Scanner');
            }}
          />
        </View>

        <View style={styles.cta}>
          <Button label="Add to Collection" onPress={handleAdd} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ActionButton({
  iconName,
  label,
  onPress,
}: {
  iconName: string;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.actionButton}>
      <Button
        fullWidth={false}
        iconName={iconName}
        label={label}
        onPress={onPress}
        variant="text"
      />
    </View>
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
    paddingHorizontal: spacing.screenPadding,
  },
  count: {
    ...typography.h1,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  imageShell: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 340,
  },
  image: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 300,
    width: 300,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  cta: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
    width: '100%',
  },
});
