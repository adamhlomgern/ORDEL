import type { BoardConfig, TileBagConfig } from '@ordel/types';
import { ORDEL_CLASSIC_BOARD_1 } from './board/classicBoard';
import { ORDEL_SV_TILES_1 } from './tiles/svClassicTiles';

const BOARD_CONFIGS: Record<string, BoardConfig> = {
  [ORDEL_CLASSIC_BOARD_1.id]: ORDEL_CLASSIC_BOARD_1,
};

const TILE_BAG_CONFIGS: Record<string, TileBagConfig> = {
  [ORDEL_SV_TILES_1.id]: ORDEL_SV_TILES_1,
};

/**
 * Resolves a versioned board configuration by id. A game stores only the id
 * (GAME_RULES.md section 69) — this is the one place that turns it back into
 * usable data.
 */
export function getBoardConfig(boardConfigId: string): BoardConfig {
  const config = BOARD_CONFIGS[boardConfigId];
  if (!config) {
    throw new Error(`Unknown board configuration: ${boardConfigId}`);
  }
  return config;
}

/** Resolves a versioned tile bag/value configuration by id (GAME_RULES.md section 70). */
export function getTileBagConfig(tileConfigId: string): TileBagConfig {
  const config = TILE_BAG_CONFIGS[tileConfigId];
  if (!config) {
    throw new Error(`Unknown tile configuration: ${tileConfigId}`);
  }
  return config;
}

/** Looks up a letter's fixed point value from a tile configuration. Blanks are handled by callers (always 0). */
export function getLetterValue(tileConfig: TileBagConfig, letter: string): number {
  const definition = tileConfig.tiles.find((tile) => tile.letter === letter);
  if (!definition) {
    throw new Error(`Unknown letter "${letter}" in tile configuration ${tileConfig.id}`);
  }
  return definition.value;
}
