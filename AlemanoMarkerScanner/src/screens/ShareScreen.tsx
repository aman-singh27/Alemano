import React, {useEffect} from 'react';
import {
  Alert,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../components/ui/Header';
import type {NativeStackScreenProps} from '../navigation/types';
import {useMarkerStore} from '../store/useMarkerStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Share'>;

export function ShareScreen({navigation, route}: Props): React.JSX.Element {
  const marker = useMarkerStore(state =>
    state.capturedMarkers.find(item => item.id === route.params.markerId),
  );

  const openShareSheet = async () => {
    if (marker == null) {
      return;
    }

    try {
      await Share.open({
        type: 'image/jpeg',
        url: marker.uri,
      });
    } catch {
      Alert.alert('Share cancelled', 'No share destination was selected.');
    }
  };

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
      <Header showBack title="Share" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        <Image source={{uri: marker.uri}} style={styles.image} />
        <Text style={styles.label}>Share as</Text>

        <View style={styles.options}>
          <ShareOption
            iconName="photo-library"
            label="Gallery"
            onPress={() => {
              openShareSheet().catch(() => undefined);
            }}
          />
          <ShareOption
            iconName="chat"
            label="WhatsApp"
            onPress={() => {
              openShareSheet().catch(() => undefined);
            }}
          />
          <ShareOption
            iconName="mail-outline"
            label="Gmail"
            onPress={() => {
              openShareSheet().catch(() => undefined);
            }}
          />
          <ShareOption
            iconName="more-horiz"
            label="More"
            onPress={() => {
              openShareSheet().catch(() => undefined);
            }}
          />
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ShareOption({
  iconName,
  label,
  onPress,
}: {
  iconName: string;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.option}>
      <View style={styles.optionIcon}>
        <MaterialIcons color={colors.accent} name={iconName} size={26} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
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
  label: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '48%',
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: '100%',
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 'auto',
    paddingVertical: spacing.md,
  },
  cancelText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
});
