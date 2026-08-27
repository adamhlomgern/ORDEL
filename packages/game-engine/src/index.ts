export { ORDEL_CLASSIC_BOARD_1 } from './board/classicBoard';
export { ORDEL_SV_TILES_1 } from './tiles/svClassicTiles';
export { getBoardConfig, getTileBagConfig, getLetterValue } from './registry';
export { makeMove } from './engine/makeMove';
export { checkPlacement, type PlacementAxis } from './engine/placement';
export { extractWords, wordText, type WordCandidate, type WordCell } from './engine/wordExtraction';
export { validateWords } from './engine/dictionaryValidation';
export { scoreWords } from './engine/scoring';
export { isSjuaEligible, SJUA_BONUS } from './engine/sjua';
export { commitPlacements } from './engine/boardMutation';
export {
  buildInitialTileBag,
  drawTiles,
  refillRack,
  swapTiles,
  type RandomSource,
} from './engine/tileBag';
export { applyPass, applySwap, applyResign } from './engine/turnActions';
export { applyEndGameConditions } from './engine/endGame';
