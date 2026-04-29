import React, {useMemo} from 'react';
import {
  FlatList,
  useWindowDimensions,
  StyleSheet,
  type ListRenderItemInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {MarkerCapture} from '../../types';
import {spacing} from '../../theme';
import {MarkerGridItem} from './MarkerGridItem';

interface FilledMarkerCell {
  type: 'marker';
  marker: MarkerCapture;
}

interface EmptyMarkerCell {
  type: 'empty';
  id: string;
}

type MarkerGridCell = FilledMarkerCell | EmptyMarkerCell;

export interface MarkerGridProps {
  markers: MarkerCapture[];
  onPressMarker: (markerId: string) => void;
  totalSlots?: number;
  columns?: number;
  scrollEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MarkerGrid({
  markers,
  onPressMarker,
  totalSlots = 20,
  columns = 2,
  scrollEnabled = true,
  style,
}: MarkerGridProps): React.JSX.Element {
  const {width} = useWindowDimensions();
  const itemSize = useMemo(() => {
    const availableWidth = Math.max(width - spacing.screenPadding * 2, 320);
    const gutter = spacing.md * (columns - 1);
    return Math.floor((availableWidth - gutter) / columns);
  }, [columns, width]);

  const data = useMemo<MarkerGridCell[]>(() => {
    const markerCells: MarkerGridCell[] = markers
      .slice(0, totalSlots)
      .map(marker => ({type: 'marker', marker}));
    const emptyCount = Math.max(totalSlots - markerCells.length, 0);
    const emptyCells: MarkerGridCell[] = Array.from(
      {length: emptyCount},
      (_, index) => ({type: 'empty', id: `empty-${index}`}),
    );

    return [...markerCells, ...emptyCells];
  }, [markers, totalSlots]);

  const renderItem = ({
    item,
  }: ListRenderItemInfo<MarkerGridCell>): React.JSX.Element => {
    if (item.type === 'empty') {
      return <MarkerGridItem size={itemSize} uri={null} />;
    }

    return (
      <MarkerGridItem
        size={itemSize}
        uri={item.marker.uri}
        onPress={() => onPressMarker(item.marker.id)}
      />
    );
  };

  return (
    <FlatList
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      data={data}
      keyExtractor={item => (item.type === 'marker' ? item.marker.id : item.id)}
      numColumns={columns}
      renderItem={renderItem}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
