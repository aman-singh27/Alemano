import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/ui/Button';
import type {NativeStackScreenProps} from '../navigation/types';
import {colors, spacing, typography} from '../theme';
import {useOnboarding} from '../hooks/useOnboarding';

type Props = NativeStackScreenProps<'Onboarding'>;

interface Slide {
  title: string;
  body: string;
  illustration: 'smart-detection' | 'auto-correction';
}

function SmartDetectionIllustration(): React.JSX.Element {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(20, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <MaterialIcons
        name="qr-code"
        size={64}
        color={colors.textSecondary}
        style={{opacity: 0.5}}
      />
      <Animated.View style={[{position: 'absolute'}, animatedStyle]}>
        <MaterialIcons name="smartphone" size={96} color={colors.accent} />
      </Animated.View>
    </View>
  );
}

function AutoCorrectionIllustration(): React.JSX.Element {
  const rotateX = useSharedValue(45);
  const rotateZ = useSharedValue(45);

  useEffect(() => {
    rotateX.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        withDelay(
          500,
          withTiming(45, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        ),
      ),
      -1,
      true,
    );
    rotateZ.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        withDelay(
          500,
          withTiming(45, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        ),
      ),
      -1,
      true,
    );
  }, [rotateX, rotateZ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 500},
      {rotateX: `${rotateX.value}deg`},
      {rotateZ: `${rotateZ.value}deg`},
    ],
  }));

  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Animated.View style={animatedStyle}>
        <MaterialIcons name="qr-code" size={96} color={colors.accent} />
      </Animated.View>
    </View>
  );
}

export function OnboardingScreen({navigation}: Props): React.JSX.Element {
  const slides = useMemo<Slide[]>(
    () => [
      {
        title: 'Smart Detection',
        body: 'Our AI detects only valid markers and ignores everything else.',
        illustration: 'smart-detection',
      },
      {
        title: 'Auto Correction',
        body: 'We automatically correct orientation and perspective for perfect results.',
        illustration: 'auto-correction',
      },
    ],
    [],
  );
  const {completeOnboarding} = useOnboarding();
  const [activeIndex, setActiveIndex] = useState(0);

  const finish = async () => {
    await completeOnboarding();
    navigation.replace('Home');
  };

  const handleNext = async () => {
    if (activeIndex === slides.length - 1) {
      await finish();
      return;
    }
    setActiveIndex(index => index + 1);
  };

  const activeSlide = slides[activeIndex];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.header}>
        <View />
        <Pressable
          onPress={() => {
            finish().catch(() => undefined);
          }}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.illustration}>
        {activeSlide.illustration === 'smart-detection' ? (
          <SmartDetectionIllustration />
        ) : (
          <AutoCorrectionIllustration />
        )}
      </View>

      <Text style={styles.title}>{activeSlide.title}</Text>
      <Text style={styles.body}>{activeSlide.body}</Text>

      <View style={styles.dots}>
        {slides.map((slide, index) => (
          <View
            key={slide.title}
            style={[
              styles.dot,
              index === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <Button
        label="Next"
        onPress={() => {
          handleNext().catch(() => undefined);
        }}
      />
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skip: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginVertical: spacing.xxl,
    minHeight: 320,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    marginHorizontal: spacing.xs,
    width: 10,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
});
