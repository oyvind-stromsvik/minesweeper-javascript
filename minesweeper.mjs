import {
  TILE_TYPE,
  TILE_VISUAL_STATUS,
  Tile,
} from "./tile.mjs";

export const BOARD_SIZE = 9;
export const NUMBER_OF_MINES = 10;

/**
 *
 * @returns {*[]}
 */
export function createBoard() {
  const board = [];

  generateTiles(board);
  generateMines(board);
  generateNumbers(board);

  // Draw the initial board graphic.
  board.forEach(row => {
    row.forEach(tile => {
      updateTileVisual(tile);
    });
  });

  return board;
}

/**
 *
 * @param tile
 */
export function flagTile(tile) {
  if (tile.revealed) {
    return;
  }

  tile.flagged = !tile.flagged;
  updateTileVisual(tile);
}

/**
 *
 * @param board
 * @param tile
 */
export function revealTile(board, tile) {
  if (tile.revealed) {
    return;
  }

  tile.revealed = true;

  switch (tile.type) {
    case TILE_TYPE.MINE:
      break;

    case TILE_TYPE.EMPTY:
      const adjacentTiles = getAdjacentTiles(board, tile);
      adjacentTiles.forEach(adjacentTile => {
        revealTile(board, adjacentTile);
      });
      break;

    case TILE_TYPE.NUMBER:
      break;
  }

  updateTileVisual(tile);
}

/**
 * Reveal all adjacent tiles.
 *
 * ...but only if we clicked a number tile, and we've flagged the same number of
 * adjacent tiles as the number shows.
 *
 * @param {Object} board - The board the clicked tile belongs to.
 * @param {Object} tile - The tile we clicked.
 */
export function revealAdjacent(board, tile) {
  if (tile.type !== TILE_TYPE.NUMBER) {
    return;
  }

  const adjacentTiles = getAdjacentTiles(board, tile);
  let adjacentFlags = 0;
  adjacentTiles.forEach(adjacentTile => {
    if (adjacentTile.flagged) {
      adjacentFlags++;
    }
  });
  if (adjacentFlags === tile.number) {
    adjacentTiles.forEach(adjacentTile => {
      if (!adjacentTile.revealed && !adjacentTile.flagged) {
        revealTile(board, adjacentTile);
      }
    });
  }
}

/**
 * Update what we see in the browser according to the tile data.
 *
 * @param {Object} tile
 */
function updateTileVisual(tile) {
  if (tile.flagged) {
    tile.element.dataset.status = TILE_VISUAL_STATUS.FLAGGED;
    return;
  }

  if (!tile.revealed) {
    tile.element.dataset.status = TILE_VISUAL_STATUS.HIDDEN;
    return;
  }

  if (tile.exploded) {
    tile.element.dataset.status = TILE_VISUAL_STATUS.EXPLODED;
    return;
  }

  tile.element.dataset.status = tile.type;

  if (tile.type === TILE_TYPE.NUMBER) {
    tile.element.dataset.number = tile.number;
  }
}

/**
 *
 * @param board
 */
function generateTiles(board) {
  for (let x = 0; x < BOARD_SIZE; x++) {
    const row = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const tile = Object.create(Tile);
      tile.element = document.createElement("div");
      tile.x = x;
      tile.y = y;
      row.push(tile);
    }
    board.push(row);
  }
}

/**
 *
 * @param board
 */
function generateMines(board) {
  for (let i = 0; i < NUMBER_OF_MINES; i++) {
    let x = Math.floor(Math.random() * BOARD_SIZE);
    let y = Math.floor(Math.random() * BOARD_SIZE);

    while (board[x][y].type === TILE_TYPE.MINE) {
      x++;

      if (x >= BOARD_SIZE) {
        x = 0;
        y++;

        if (y >= BOARD_SIZE) {
          y = 0;
        }
      }
    }

    board[x][y].type = TILE_TYPE.MINE;
  }
}

/**
 *
 * @param board
 */
function generateNumbers(board) {
  board.forEach(row => {
    row.forEach(tile => {
      if (tile.type === TILE_TYPE.MINE) {
        // Apparently return in a forEach is the same as continue in a normal
        // for loop. I just need to comment that so that I remember it...
        return;
      }
      const adjacentTiles = getAdjacentTiles(board, tile);
      const mines = adjacentTiles.filter(function(adjacentTile) {
        return adjacentTile.type === TILE_TYPE.MINE;
      });
      if (mines.length > 0) {
        tile.type = TILE_TYPE.NUMBER;
        tile.number = mines.length;
      }
    });
  });
}

/**
 *
 * @param board
 * @param tile
 * @returns {*[]}
 */
function getAdjacentTiles(board, tile) {
  const adjacentTiles = [];

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      if (xOffset === 0 && yOffset === 0) {
        continue;
      }

      const adjacentTile = getTile(board, tile.x + xOffset, tile.y + yOffset);
      if (adjacentTile === null) {
        continue;
      }

      adjacentTiles.push(adjacentTile);
    }
  }

  return adjacentTiles;
}

/**
 *
 * @param board
 * @param x
 * @param y
 * @returns {null|*}
 */
function getTile(board, x, y) {
  if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    return board[x][y];
  }

  return null;
}
