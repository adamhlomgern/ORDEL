import type { BoardConfig, TileBagConfig, WordResult } from '@ordel/types';
import type { WordCandidate } from './wordExtraction';
import { wordText } from './wordExtraction';
import { buildBonusMap, coordKey } from './boardLookup';
import { getLetterValue } from '../registry';

/**
 * Scores every extracted word (GAME_RULES.md sections 10, 34-36): letter
 * multipliers (DL/TL) apply before word multipliers (DW/TW); multiple word
 * multipliers on the same word stack multiplicatively; blank tiles always
 * contribute 0 regardless of their assigned letter.
 *
 * A bonus only ever applies via a *newly placed* cell (section 9) — since
 * previously committed cells are never part of `isNewlyPlaced`, this falls
 * out naturally without needing to consult per-cell consumption state here;
 * boardMutation.ts is responsible for recording consumption going forward.
 */
export function scoreWords(
  candidates: WordCandidate[],
  boardConfig: BoardConfig,
  tileConfig: TileBagConfig,
): { wordsCreated: WordResult[]; totalScore: number } {
  const bonusMap = buildBonusMap(boardConfig);

  const wordsCreated: WordResult[] = candidates.map((candidate) => {
    let wordMultiplier = 1;
    let baseValue = 0;

    for (const cell of candidate.cells) {
      const letterValue = cell.isBlank ? 0 : getLetterValue(tileConfig, cell.letter);

      if (!cell.isNewlyPlaced) {
        baseValue += letterValue;
        continue;
      }

      const bonus = bonusMap.get(coordKey(cell.coordinate));
      let cellValue = letterValue;

      if (bonus === 'DL') cellValue *= 2;
      if (bonus === 'TL') cellValue *= 3;
      if (bonus === 'DW') wordMultiplier *= 2;
      if (bonus === 'TW') wordMultiplier *= 3;

      baseValue += cellValue;
    }

    return {
      word: wordText(candidate),
      score: baseValue * wordMultiplier,
      coordinates: candidate.cells.map((c) => c.coordinate),
    };
  });

  const totalScore = wordsCreated.reduce((sum, w) => sum + w.score, 0);

  return { wordsCreated, totalScore };
}
