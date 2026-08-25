/**
 * Swedish playable letters per GAME_RULES.md section 13.
 * Å, Ä, Ö are distinct letters and must never normalize to A/A/O
 * (GAME_RULES.md section 15).
 */
export type Letter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'Å'
  | 'Ä'
  | 'Ö';

export interface TileDefinition {
  letter: Letter;
  count: number;
  value: number;
}

/**
 * A versioned tile bag configuration (GAME_RULES.md section 12).
 * Blank tiles are tracked separately via `blankCount` since they have no letter.
 */
export interface TileBagConfig {
  id: string;
  tiles: TileDefinition[];
  blankCount: number;
}

/**
 * A single physical tile, either on a rack or committed to the board.
 * Blank tiles retain their assigned letter for the remainder of the game
 * once placed (GAME_RULES.md sections 16-17) but always contribute 0 points.
 */
export type RackTile =
  | { id: string; kind: 'letter'; letter: Letter; value: number }
  | { id: string; kind: 'blank'; assignedLetter: Letter | null; value: 0 };

/** A player's private rack. Normally holds up to 7 tiles (GAME_RULES.md section 11). */
export type Rack = RackTile[];
