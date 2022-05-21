import {
  TILE_TYPE,
  Tile,
} from "./tile.mjs";

export const BOARD_SIZE = 4;
export const NUMBER_OF_MINES = 1;

export function createBoard() {
  const board = [];
  const minePositions = getMinePositions();

  for (let x = 0; x < BOARD_SIZE; x++) {
    const row = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const tile = Object.create(Tile);
      tile.element = document.createElement("div");
      tile.x = x;
      tile.y = y;
      if (minePositions.some(positionMatch.bind(null, { x, y }))) {
        tile.type = TILE_TYPE.MINE;
      }

      row.push(tile);
    }
    board.push(row);
  }

  board.forEach(row => {
    row.forEach(tile => {
      const adjacentTiles = getAdjacentTiles(board, tile);
      const mines = adjacentTiles.filter(t => t.type === TILE_TYPE.MINE);
      if (mines.length > 0) {
        tile.type = TILE_TYPE.NUMBER;
        tile.number = mines.length;
      }

      updateTileVisual(tile);
    });
  });

  return board;
}

export function flagTile(tile) {
  if (tile.revealed) {
    return;
  }

  tile.flagged = !tile.flagged;
  updateTileVisual(tile);
}

export function revealTile(board, tile) {
  if (tile.revealed) {
    return;
  }

  tile.revealed = true;
  updateTileVisual(tile);

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
  if (tile.status !== TILE_TYPE.NUMBER) {
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

export function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.revealed || tile.type === TILE_TYPE.MINE
      );
    });
  });
}

export function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.revealed && tile.type === TILE_TYPE.MINE;
    });
  });
}

/**
 * Update what we see in the browser according to the tile data.
 *
 * @param {Object} tile
 */
function updateTileVisual(tile) {
  if (tile.flagged) {
    tile.element.dataset.status = 'flagged';
    return;
  }

  if (!tile.revealed) {
    tile.element.dataset.status = 'hidden';
    return;
  }

  tile.element.dataset.status = tile.type;

  if (tile.type === TILE_TYPE.NUMBER) {
    tile.element.dataset.number = tile.number;
  }
}

/**
 *
 * @returns {*[]}
 */
function getMinePositions() {
  const positions = [];

  while (positions.length < NUMBER_OF_MINES) {
    const position = {
      x: randomNumber(BOARD_SIZE),
      y: randomNumber(BOARD_SIZE),
    };
    // TODO: Erstatt bind med noe jeg forstår.
    if (!positions.some(positionMatch.bind(null, position))) {
      positions.push(position);
    }
  }

  return positions;
}

function randomNumber(size) {
  return Math.floor(Math.random() * size);
}

function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

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

function getTile(board, x, y) {
  if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    return board[x][y];
  }

  return null;
}
