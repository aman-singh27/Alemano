import React from 'react';
import {Image, type ImageStyle, StyleSheet, type StyleProp} from 'react-native';

export interface AppLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function AppLogo({size = 88, style}: AppLogoProps): React.JSX.Element {
  return (
    <Image
      accessibilityLabel="Alemeno logo"
      resizeMode="contain"
      source={require('../../assets/branding/logo.png')}
      style={[
        styles.logo,
        {
          borderRadius: size * 0.18,
          height: size,
          width: size,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: '#FFFFFF',
  },
});