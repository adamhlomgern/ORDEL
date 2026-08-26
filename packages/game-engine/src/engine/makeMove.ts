import type { DictionaryProvider } from '@ordel/dictionary';
import type { GamePlayer, GameState, MoveResult, Placement, ProposedMove } from '@ordel/types';
import { getBoardConfig, getTileBagConfig } from '../registry';
import { checkPlacement } from './placement';
import { extractWords } from './wordExtraction';
import { validateWords } from './dictionaryValidation';
import { scoreWords } from './scoring';
import { isSjuaEligible, SJUA_BONUS } from './sjua';
import { commitPlacements } from './boardMutation';
import { refillRack, type RandomSource } from './tileBag';
import { applyPass, applyResign, applySwap } from './turnActions';
import { applyEndGameConditions } from './endGame';

/**
 * Validates and applies a proposed move against authoritative game state
 * (MASTER_PRODUCT_BRIEF.md section 11). Server-authoritative: the caller is
 * responsible for knowing `actingPlayerId` is who they say they are (auth is
 * outside this package's concern) — everything else about whether the move
 * is legal is decided here.
 *
 * `dictionary` is injected by type only (`@ordel/dictionary`'s
 * `DictionaryProvider`), never imported concretely, so this package never
 * depends on which dictionary implementation is active (dev fixture today,
 * the real `ordel-sv` pipeline later).
 */
export function makeMove(
  gameState: GameState,
  proposedMove: ProposedMove,
  actingPlayerId: string,
  dictionary: DictionaryProvider,
  rng?: RandomSource,
): MoveResult {
  if (proposedMove.type === 'RESIGN') {
    return {
      valid: true,
      score: 0,
      wordsCreated: [],
      sjuaBonus: false,
      resultingGameState: applyResign(gameState, actingPlayerId),
    };
  }

  if (gameState.status !== 'active') {
    return { valid: false, reason: 'This game is not active.' };
  }

  if (gameState.currentTurnPlayerId !== actingPlayerId) {
    return { valid: false, reason: 'It is not your turn.' };
  }

  if (proposedMove.type === 'PASS') {
    const nextState = applyEndGameConditions(applyPass(gameState), actingPlayerId);
    return {
      valid: true,
      score: 0,
      wordsCreated: [],
      sjuaBonus: false,
      resultingGameState: nextState,
    };
  }

  if (proposedMove.type === 'SWAP') {
    const result = applySwap(gameState, actingPlayerId, proposedMove.tileIds, rng);
    if (!result.valid) {
      return { valid: false, reason: result.reason };
    }
    const nextState = applyEndGameConditions(result.gameState, actingPlayerId);
    return {
      valid: true,
      score: 0,
      wordsCreated: [],
      sjuaBonus: false,
      resultingGameState: nextState,
    };
  }

  return handlePlay(gameState, proposedMove.placements, actingPlayerId, dictionary, rng);
}

function handlePlay(
  gameState: GameState,
  placements: Placement[],
  actingPlayerId: string,
  dictionary: DictionaryProvider,
  rng?: RandomSource,
): MoveResult {
  const actingPlayer = gameState.players.find((p) => p.playerId === actingPlayerId);
  if (!actingPlayer) {
    return { valid: false, reason: 'Acting player is not part of this game.' };
  }

  const boardConfig = getBoardConfig(gameState.config.boardConfigId);
  const tileConfig = getTileBagConfig(gameState.config.tileConfigId);

  const placementCheck = checkPlacement(placements, gameState.board, actingPlayer, boardConfig);
  if (!placementCheck.valid) {
    return { valid: false, reason: placementCheck.reason };
  }

  const candidates = extractWords(gameState.board, placements, placementCheck.axis);
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

  const { wordsCreated, totalScore } = scoreWords(candidates, boardConfig, tileConfig);
  const sjuaEligible = isSjuaEligible(placements.length, actingPlayer.rack.length);
  const moveScore = totalScore + (sjuaEligible ? SJUA_BONUS : 0);

  const usedTileIds = new Set(placements.map((p) => p.tile.id));
  const remainingRack = actingPlayer.rack.filter((tile) => !usedTileIds.has(tile.id));
  const { rack: refilledRack, bag: nextBag } = refillRack(remainingRack, gameState.tileBag, rng);

  const nextPlayers: GamePlayer[] = gameState.players.map((p) =>
    p.playerId === actingPlayerId ? { ...p, rack: refilledRack, score: p.score + moveScore } : p,
  );

  const currentIndex = gameState.players.findIndex((p) => p.playerId === actingPlayerId);
  const opponent = gameState.players[(currentIndex + 1) % gameState.players.length];

  const nextState: GameState = {
    ...gameState,
    board: commitPlacements(gameState.board, placements, boardConfig),
    players: nextPlayers,
    tileBag: nextBag,
    scorelessTurnCount: 0,
    currentTurnPlayerId: opponent ? opponent.playerId : gameState.currentTurnPlayerId,
  };

  const finalState = applyEndGameConditions(nextState, actingPlayerId);

  return {
    valid: true,
    score: moveScore,
    wordsCreated,
    sjuaBonus: sjuaEligible,
    resultingGameState: finalState,
  };
}
