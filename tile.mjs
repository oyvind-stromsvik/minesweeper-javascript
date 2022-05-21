export const TILE_TYPE = {
  EMPTY: 'empty',
  MINE: "mine",
  NUMBER: "number",
};

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
