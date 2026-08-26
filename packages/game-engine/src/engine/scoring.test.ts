import { describe, expect, it } from 'vitest';
import { scoreWords } from './scoring';
import { ORDEL_CLASSIC_BOARD_1 } from '../board/classicBoard';
import { ORDEL_SV_TILES_1 } from '../tiles/svClassicTiles';
import type { WordCandidate } from './wordExtraction';

function cell(
  row: number,
  col: number,
  letter: string,
  isNewlyPlaced: boolean,
  isBlank = false,
): WordCandidate['cells'][number] {
  return { coordinate: { row, col }, letter: letter as never, isBlank, isNewlyPlaced };
}

describe('scoreWords', () => {
  it('scores plain letters with no bonus involved', () => {
    // (7,6)=B (7,7)=I center no bonus (7,8)=L — see makeMove.test.ts for the bonus-map spot check.
    const word: WordCandidate = {
      cells: [cell(7, 6, 'B', true), cell(7, 7, 'I', true), cell(7, 8, 'L', true)],
    };
    const { totalScore, wordsCreated } = scoreWords(
      [word],
      ORDEL_CLASSIC_BOARD_1,
      ORDEL_SV_TILES_1,
    );
    expect(wordsCreated[0]!.score).toBe(4 + 1 + 1);
    expect(totalScore).toBe(6);
  });

  it('applies a double-letter bonus only to the newly placed cell it sits on', () => {
    // A8 is DL (row7, col0).
    const word: WordCandidate = { cells: [cell(7, 0, 'A', true)] };
    // A single-cell "word" isn't realistic gameplay but isolates the DL math directly.
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    expect(wordsCreated[0]!.score).toBe(1 * 2); // A=1 point, doubled
  });

  it('applies a triple-letter bonus', () => {
    // B8 is TL (row7, col1).
    const word: WordCandidate = { cells: [cell(7, 1, 'C', true)] };
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    expect(wordsCreated[0]!.score).toBe(8 * 3); // C=8 points, tripled
  });

  it('applies the word multiplier after summing letter values', () => {
    // A5 (row4,col0) is TW; the other two cells in this run have no bonus.
    const word: WordCandidate = {
      cells: [
        cell(4, 0, 'A', true), // TW
        cell(5, 0, 'B', true), // no bonus (A6 is not in any bonus list)
        cell(6, 0, 'C', true), // no bonus (A7 is not in any bonus list)
      ],
    };
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    // A=1, B=4, C=8 => base 13, x3 (one TW) = 39.
    expect(wordsCreated[0]!.score).toBe((1 + 4 + 8) * 3);
  });

  it('stacks two word multipliers multiplicatively (3x3=9x, per GAME_RULES.md section 10)', () => {
    // A5 (row4,col0) and A11 (row10,col0) are both TW; the board's symmetric layout also
    // places a DL cell (A8, row7) exactly at their midpoint, so this word exercises both
    // letter- and word-multiplier stacking at once.
    const cells = [];
    for (let row = 4; row <= 10; row++) {
      cells.push(cell(row, 0, 'A', true));
    }
    const word: WordCandidate = { cells };
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    // Six plain A's (1 point) + one doubled A (row7, DL) = 7, then x3 x3 (two TW cells) = 63.
    expect(wordsCreated[0]!.score).toBe((6 * 1 + 2) * 3 * 3);
  });

  it('never applies a bonus to a cell that was not newly placed this move', () => {
    // A8 (row7,col0) is DL, but marked as an existing (not newly placed) tile here.
    const word: WordCandidate = { cells: [cell(7, 0, 'A', false), cell(7, 1, 'B', true)] };
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    // A contributes its plain value (1, no DL) + B tripled by its own TL cell (B8=TL) = 1 + 12.
    expect(wordsCreated[0]!.score).toBe(1 + 4 * 3);
  });

  it('blank tiles always score 0, even on a bonus cell', () => {
    // A8 (row7,col0) is DL; blank contributes 0 regardless of multiplier or assigned letter.
    const word: WordCandidate = { cells: [cell(7, 0, 'Z', true, true), cell(7, 1, 'B', true)] };
    const { wordsCreated } = scoreWords([word], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    expect(wordsCreated[0]!.score).toBe(0 + 4 * 3);
  });

  it('sums scores across multiple simultaneous words', () => {
    const wordA: WordCandidate = { cells: [cell(0, 0, 'D', true), cell(0, 1, 'E', true)] };
    const wordB: WordCandidate = { cells: [cell(1, 0, 'F', true), cell(2, 0, 'G', true)] };
    const { totalScore } = scoreWords([wordA, wordB], ORDEL_CLASSIC_BOARD_1, ORDEL_SV_TILES_1);
    // D=1,E=1 (no bonus at A1/B1) => 2; F=3,G=2 (no bonus at A2/A3) => 5. Total 7.
    expect(totalScore).toBe(7);
  });
});
