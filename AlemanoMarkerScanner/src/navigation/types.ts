import type {StackScreenProps} from '@react-navigation/stack';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Scanner: undefined;
  Processing: {frameUri: string; corners: number[][]};
  Preview: {markerId: string};
  Collection: undefined;
  MarkerDetail: {markerId: string};
  Share: {markerId: string};
  Settings: undefined;
  Completion: undefined;
};

export type NativeStackScreenProps<
  ScreenName extends keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, ScreenName>;
