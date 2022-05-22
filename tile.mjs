/**
 * The finite data "state" a tile can be in.
 */
export const TILE_TYPE = {
  EMPTY: 'empty',
  MINE: "mine",
  NUMBER: "number",
};

/**
 * Additional statuses that ar
 */
export const TILE_VISUAL_STATUS = {
  FLAGGED: 'flagged',
  HIDDEN: 'hidden',
  EXPLODED: 'exploded',
};

/**
 * A tile object.
 *
 * @param {string} element - The visual element for the tile.
 * @param {number} x - The x position.
 * @param {number} y - The y position.
 * @param {string} type - The TILE_TYPE of the tile.
 * @param {number} number - The number of adjacent bombs.
 * @param {boolean} revealed - Whether the tile is revealed or not.
 * @param {boolean} flagged - Indicates if this tile is flagged or not.
 * @param {boolean} exploded - Indicates if this tile contains an exploded bomb.
 */
export const Tile = {
  element: '',
  x: 0,
  y: 0,
  type: TILE_TYPE.EMPTY,
  number: 0,
  revealed: false,
  flagged: false,
  exploded: false,
};
