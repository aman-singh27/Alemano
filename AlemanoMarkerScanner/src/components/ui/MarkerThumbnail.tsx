import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../theme';

export interface MarkerThumbnailProps {
  uri: string | null;
  size?: number;
}

export function MarkerThumbnail({
  uri,
  size = 300,
}: MarkerThumbnailProps): React.JSX.Element {
  if (uri == null) {
    return (
      <View style={[styles.placeholder, {height: size, width: size}]}> 
        <MaterialIcons name="crop-free" size={48} color={colors.border} />
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel="Captured marker"
      resizeMode="cover"
      source={{uri}}
      style={[styles.image, {height: size, width: size}]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
