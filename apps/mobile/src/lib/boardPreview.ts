import type { BoardTileState, Placement, RackTile, WordResult } from '@ordel/types';
import {
  ORDEL_CLASSIC_BOARD_1,
  ORDEL_SV_TILES_1,
  SJUA_BONUS,
  checkPlacement,
  extractWords,
  isSjuaEligible,
  scoreWords,
  validateWords,
} from '@ordel/game-engine';
import { InMemoryDictionaryProvider } from '@ordel/dictionary';

export type PreviewResult =
  | { valid: true; wordsCreated: WordResult[]; totalScore: number; sjuaBonus: boolean }
  | { valid: false; reason: string };

const dictionary = new InMemoryDictionaryProvider();

/**
 * Mirrors packages/game-engine/src/engine/makeMove.ts's handlePlay()
 * validation/scoring pipeline exactly, using the same exported pure
 * functions the server runs — so the client preview can never drift from
 * what submitting would actually do. V0.1 has exactly one board/tile
 * config, so both are used directly rather than looked up by id.
 */
export function previewPlay(
  board: BoardTileState[],
  rack: RackTile[],
  placements: Placement[],
): PreviewResult {
  const actingPlayer = { playerId: '', rack, score: 0, turnOrder: 0, hasResigned: false };

  const placementCheck = checkPlacement(placements, board, actingPlayer, ORDEL_CLASSIC_BOARD_1);
  if (!placementCheck.valid) {
    return { valid: false, reason: placementCheck.reason };
  }

  const candidates = extractWords(board, placements, placementCheck.axis);
  if (candidates.length === 0) {
    return { valid: false, reason: 'This placement does not form any word.' };
  }

  const dictionaryCheck = validateWords(candidates, dictionary);
  if (!dictionaryCheck.valid) {
    return {
      valid: false,
      reason: `Not accepted in the dictionary: ${dictionaryCheck.invalidWords.join(', ')}`,
    };
  }

  const { wordsCreated, totalScore } = scoreWords(
    candidates,
    ORDEL_CLASSIC_BOARD_1,
    ORDEL_SV_TILES_1,
  );
  const sjuaBonus = isSjuaEligible(placements.length, rack.length);

  return {
    valid: true,
    wordsCreated,
    totalScore: totalScore + (sjuaBonus ? SJUA_BONUS : 0),
    sjuaBonus,
  };
}
