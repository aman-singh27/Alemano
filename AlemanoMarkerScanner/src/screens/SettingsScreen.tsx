import React from 'react';
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../components/ui/Header';
import type {NativeStackScreenProps} from '../navigation/types';
import {useSettingsStore} from '../store/useSettingsStore';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<'Settings'>;

export function SettingsScreen({navigation}: Props): React.JSX.Element {
  const {
    resolution,
    flash,
    autoCapture,
    vibration,
    setAutoCapture,
    setVibration,
    setResolution,
    setFlash,
  } = useSettingsStore();

  const cycleResolution = () => {
    const nextValue =
      resolution === 3000 ? 2500 : resolution === 2500 ? 2000 : 3000;
    setResolution(nextValue);
  };

  const cycleFlash = () => {
    const nextMode = flash === 'auto' ? 'on' : flash === 'on' ? 'off' : 'auto';
    setFlash(nextMode);
  };

  const flashLabel = flash === 'auto' ? 'Auto' : flash === 'on' ? 'On' : 'Off';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Header
        showBack
        title="Settings"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camera</Text>
        <ChevronRow
          label="Resolution"
          value={`High (${resolution} x ${resolution})`}
          onPress={cycleResolution}
        />
        <ChevronRow label="Flash" value={flashLabel} onPress={cycleFlash} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection</Text>
        <ToggleRow
          label="Auto Capture"
          value={autoCapture}
          onValueChange={setAutoCapture}
        />
        <ToggleRow
          label="Vibration"
          value={vibration}
          onValueChange={setVibration}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <StaticRow label="Version" value="1.0.0" />
        <ChevronRow
          label="About Alemeno"
          value="Company"
          onPress={() =>
            Alert.alert('About Alemeno', 'Alemeno Marker Scanner v1.0.0')
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ChevronRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <MaterialIcons
          color={colors.textSecondary}
          name="chevron-right"
          size={20}
        />
      </View>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={colors.white}
        trackColor={{false: colors.border, true: colors.accent}}
        value={value}
      />
    </View>
  );
}

function StaticRow({
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
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowLabel: {
    ...typography.body,
  },
  rowRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
});
