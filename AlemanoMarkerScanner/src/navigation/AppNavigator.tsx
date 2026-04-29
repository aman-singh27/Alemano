import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {CompletionScreen} from '../screens/CompletionScreen';
import {CollectionScreen} from '../screens/CollectionScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {MarkerDetailScreen} from '../screens/MarkerDetailScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {PreviewScreen} from '../screens/PreviewScreen';
import {ProcessingScreen} from '../screens/ProcessingScreen';
import {ScannerScreen} from '../screens/ScannerScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {ShareScreen} from '../screens/ShareScreen';
import {SplashScreen} from '../screens/SplashScreen';
import type {RootStackParamList} from './types';
import {colors} from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
        }}>
        <Stack.Screen component={SplashScreen} name="Splash" />
        <Stack.Screen component={OnboardingScreen} name="Onboarding" />
        <Stack.Screen component={HomeScreen} name="Home" />
        <Stack.Screen component={ScannerScreen} name="Scanner" />
        <Stack.Screen component={ProcessingScreen} name="Processing" />
        <Stack.Screen component={PreviewScreen} name="Preview" />
        <Stack.Screen component={CollectionScreen} name="Collection" />
        <Stack.Screen component={MarkerDetailScreen} name="MarkerDetail" />
        <Stack.Screen component={ShareScreen} name="Share" />
        <Stack.Screen component={SettingsScreen} name="Settings" />
        <Stack.Screen component={CompletionScreen} name="Completion" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
