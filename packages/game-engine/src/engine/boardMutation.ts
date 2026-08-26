import type { BoardConfig, BoardTileState, Placement } from '@ordel/types';
import { buildBonusMap, coordKey } from './boardLookup';

/**
 * Commits newly placed tiles onto the board. Any cell with a static bonus is
 * marked `bonusConsumed: true` unconditionally the first time it's occupied
 * (GAME_RULES.md section 9), independent of whether that bonus actually
 * contributed to this move's score.
 */
export function commitPlacements(
  board: BoardTileState[],
  placements: Placement[],
  boardConfig: BoardConfig,
): BoardTileState[] {
  const bonusMap = buildBonusMap(boardConfig);

  const newTiles: BoardTileState[] = placements.map((placement) => {
    const letter =
      placement.tile.kind === 'letter' ? placement.tile.letter : placement.tile.assignedLetter;
    if (!letter) {
      throw new Error('Cannot commit a blank tile with no assigned letter.');
    }

    const bonus = bonusMap.get(coordKey(placement.coordinate));

    return {
      coordinate: placement.coordinate,
      letter,
      isBlank: placement.tile.kind === 'blank',
      bonusConsumed: bonus !== undefined && bonus !== null,
    };
  });

  return [...board, ...newTiles];
}
