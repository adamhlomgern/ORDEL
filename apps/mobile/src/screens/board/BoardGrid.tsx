import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { BoardCoordinate, BoardTileState, RackTile } from '@ordel/types';
import { ORDEL_CLASSIC_BOARD_1 } from '@ordel/game-engine';
import { colors } from '../../design/tokens';

export interface PendingPlacement {
  coordinate: BoardCoordinate;
  tile: RackTile;
}

interface Props {
  board: BoardTileState[];
  pending: PendingPlacement[];
  onCellPress: (coordinate: BoardCoordinate) => void;
  readOnly?: boolean;
}

const BOARD_SIZE = ORDEL_CLASSIC_BOARD_1.size;
const BOARD_HORIZONTAL_MARGIN = 32;

const BONUS_COLORS: Record<string, string> = {
  TW: '#B3441E',
  DW: '#E4B7A0',
  TL: '#2F5D50',
  DL: '#A9C4BD',
  START: '#D8C9A3',
};

function coordKey(coordinate: BoardCoordinate): string {
  return `${coordinate.row},${coordinate.col}`;
}

function tileLetter(tile: RackTile): string {
  return tile.kind === 'letter' ? tile.letter : (tile.assignedLetter ?? '');
}

export function BoardGrid({ board, pending, onCellPress, readOnly = false }: Props) {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - BOARD_HORIZONTAL_MARGIN) / BOARD_SIZE);

  const committedByKey = new Map(board.map((t) => [coordKey(t.coordinate), t]));
  const pendingByKey = new Map(pending.map((p) => [coordKey(p.coordinate), p]));
  const bonusByKey = new Map(
    ORDEL_CLASSIC_BOARD_1.cells.map((c) => [coordKey(c.coordinate), c.bonus]),
  );

  const rows = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const cells = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const coordinate = { row, col };
      const key = coordKey(coordinate);
      const committed = committedByKey.get(key);
      const pendingCell = pendingByKey.get(key);
      const bonus = bonusByKey.get(key);
      const letter = committed ? committed.letter : pendingCell ? tileLetter(pendingCell.tile) : '';

      cells.push(
        <TouchableOpacity
          key={key}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: bonus ? BONUS_COLORS[bonus] : colors.surface,
            },
            pendingCell && styles.pendingCell,
          ]}
          onPress={() => onCellPress(coordinate)}
          disabled={!!committed || readOnly}
          testID={`board-cell-${row}-${col}`}
        >
          {letter !== '' && <Text style={styles.letter}>{letter}</Text>}
        </TouchableOpacity>,
      );
    }
    rows.push(
      <View key={row} style={styles.row}>
        {cells}
      </View>,
    );
  }

  return <View style={styles.board}>{rows}</View>;
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCell: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  letter: {
    fontWeight: '700',
    color: colors.ink,
  },
});
