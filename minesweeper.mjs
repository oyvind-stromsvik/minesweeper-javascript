export const TILE_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked",
  EMPTY: 'empty',
};

export function createBoard(boardSize, numberOfMines) {
  const board = [];
  const minePositions = getMinePositions(boardSize, numberOfMines);

  for (let x = 0; x < boardSize; x++) {
    const row = [];
    for (let y = 0; y < boardSize; y++) {
      const element = document.createElement("div");
      element.dataset.status = TILE_STATUSES.HIDDEN;

      const number = 0;

      // TODO: Tile kan vel være i egen fil?
      const tile = {
        element,
        x,
        y,
        mine: minePositions.some(positionMatch.bind(null, { x, y })),
        get status() {
          return this.element.dataset.status;
        },
        set status(value) {
          this.element.dataset.status = value;
        },
        number,
      };

      row.push(tile);
    }
    board.push(row);
  }

  board.forEach(row => {
    row.forEach(tile => {
      const adjacentTiles = nearbyTiles(board, tile);
      const mines = adjacentTiles.filter(t => t.mine);
      tile.number = mines.length;
    });
  });

  return board;
}

export function markTile(tile) {
  if (tile.status !== TILE_STATUSES.HIDDEN && tile.status !== TILE_STATUSES.MARKED) {
    return;
  }

  if (tile.status === TILE_STATUSES.MARKED) {
    tile.status = TILE_STATUSES.HIDDEN;
  }
  else {
    tile.status = TILE_STATUSES.MARKED;
  }
}

export function revealTile(board, tile) {
  if (tile.status !== TILE_STATUSES.HIDDEN) {
    return;
  }

  if (tile.mine) {
    tile.status = TILE_STATUSES.MINE;
    return;
  }

  if (tile.number === 0) {
    tile.status = TILE_STATUSES.EMPTY;
    const adjacentTiles = nearbyTiles(board, tile);
    adjacentTiles.forEach(
      revealTile.bind(null, board)
    );
  }
  else {
    tile.status = TILE_STATUSES.NUMBER;
    tile.element.dataset.number = tile.number;
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
  if (tile.status !== TILE_STATUSES.NUMBER) {
    return;
  }

  const adjacentTiles = nearbyTiles(board, tile);
  let adjacentFlags = 0;
  adjacentTiles.forEach(adjacentTile => {
    if (adjacentTile.status === TILE_STATUSES.MARKED) {
      adjacentFlags++;
    }
  });
  if (adjacentFlags === tile.number) {
    adjacentTiles.forEach(adjacentTile => {
      if (adjacentTile.status === TILE_STATUSES.HIDDEN && adjacentTile.status !== TILE_STATUSES.MARKED) {
        revealTile(board, adjacentTile);
      }
    });
  }
}

export function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.status === TILE_STATUSES.NUMBER || tile.status === TILE_STATUSES.EMPTY ||
        (tile.mine &&
          (tile.status === TILE_STATUSES.HIDDEN ||
            tile.status === TILE_STATUSES.MARKED))
      );
    });
  });
}

export function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.status === TILE_STATUSES.MINE;
    });
  });
}

/**
 *
 * @param boardSize
 * @param numberOfMines
 * @returns {*[]}
 */
function getMinePositions(boardSize, numberOfMines) {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
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

function nearbyTiles(board, { x, y }) {
  const tiles = [];

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      // TODO: Erstatt ? med noe jeg forstår.
      const tile = board[x + xOffset]?.[y + yOffset];
      if (tile) {
        tiles.push(tile);
      }
    }
  }

  return tiles;
}
