export const SJUA_BONUS = 50;
const SJUA_TILE_COUNT = 7;

/**
 * SJUA (GAME_RULES.md sections 37-38): using all seven tiles from a full
 * seven-tile rack in a single valid scoring move grants +50. Using fewer
 * than seven tiles never counts, and using an entire *shrunk* rack (because
 * the bag is nearly empty) does not count either — both the placement count
 * and the rack size at the start of the turn must equal exactly 7.
 */
export function isSjuaEligible(placementCount: number, rackSizeAtTurnStart: number): boolean {
  return placementCount === SJUA_TILE_COUNT && rackSizeAtTurnStart === SJUA_TILE_COUNT;
}
