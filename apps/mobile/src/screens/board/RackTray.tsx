import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RackTile } from '@ordel/types';
import { colors, radii, spacing, typography } from '../../design/tokens';

interface Props {
  tiles: RackTile[];
  selectedTileId: string | null;
  selectedForSwap: Set<string>;
  mode: 'play' | 'swap';
  onTilePress: (tile: RackTile) => void;
  readOnly?: boolean;
}

export function RackTray({
  tiles,
  selectedTileId,
  selectedForSwap,
  mode,
  onTilePress,
  readOnly = false,
}: Props) {
  return (
    <View style={styles.tray}>
      {tiles.map((tile) => {
        const isSelected =
          mode === 'play' ? tile.id === selectedTileId : selectedForSwap.has(tile.id);
        return (
          <TouchableOpacity
            key={tile.id}
            style={[
              styles.tile,
              isSelected && styles.tileSelected,
              readOnly && styles.tileDisabled,
            ]}
            onPress={() => onTilePress(tile)}
            disabled={readOnly}
            testID={`rack-tile-${tile.id}`}
          >
            <Text style={styles.letter}>{tile.kind === 'letter' ? tile.letter : '☐'}</Text>
            <Text style={styles.value}>{tile.value}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    justifyContent: 'center',
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  tileDisabled: {
    opacity: 0.5,
  },
  letter: {
    ...typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  value: {
    ...typography.caption,
    fontSize: 10,
    color: colors.inkMuted,
  },
});
