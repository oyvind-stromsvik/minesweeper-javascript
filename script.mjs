import {
  TILE_TYPE,
} from "./tile.mjs";

import {
  BOARD_SIZE,
  NUMBER_OF_MINES,
  createBoard,
  flagTile,
  revealTile,
  revealAdjacent,
} from "./minesweeper.mjs";

const board = createBoard();
const boardElement = document.querySelector(".board");
const minesLeftText = document.querySelector("[data-mine-count]");
const messageText = document.querySelector(".subtext");

board.forEach(row => {
  row.forEach(tile => {
    boardElement.append(tile.element);
    tile.element.addEventListener("click", function() {
      revealTile(board, tile);
      checkGameEnd(tile);
    });
    tile.element.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      flagTile(tile);
      listMinesLeft();
    });
    tile.element.addEventListener('auxclick', function(e) {
      if (e.button === 1) {
        revealAdjacent(board, tile);
        checkGameEnd(tile);
      }
    });
  });
});

boardElement.style.setProperty("--board-size", BOARD_SIZE);
minesLeftText.textContent = NUMBER_OF_MINES;

/**
 * Check the game state after we reveal a tile.
 *
 * @param {Object} tile - The last revealed tile.
 */
function checkGameEnd(tile) {
  const won = checkWin(board);
  const lost = checkLose(board);

  if (won || lost) {
    // Disable tile clicking if we've won or lost.
    // By doing this in the capture phase for the board, we ensure the event
    // never reaches the tiles because it's captured before that.
    boardElement.addEventListener("click", disableEventHandlers, { capture: true });
    boardElement.addEventListener("contextmenu", disableEventHandlers, { capture: true });
    boardElement.addEventListener("auxclick", disableEventHandlers, { capture: true });
  }

  if (won) {
    messageText.textContent = "You Win";
    board.forEach(row => {
      row.forEach(tile => {
        if (tile.type === TILE_TYPE.MINE && !tile.flagged) {
          flagTile(tile);
        }
      });
    });
    return;
  }

  if (lost) {
    // Set the last revealed tile as exploded.
    // We also have to unreveal it so that the revealTile loop we have below
    // actually reveals it again and updates the tile graphic. A bit hacky, but
    // good enough for now.
    // @todo This doesn't work for when we lose through middle clicking.
    tile.exploded = true;
    tile.revealed = false;

    messageText.textContent = "You Lose";
    board.forEach(row => {
      row.forEach(tile => {
        // First unset any flags we have.
        if (tile.flagged) {
          flagTile(tile);
        }
        // Then reveal all the bombs.
        if (tile.type === TILE_TYPE.MINE) {
          revealTile(board, tile);
        }
      });
    });
  }
}

/**
 *
 * @param board
 * @returns {*}
 */
function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.revealed || tile.type === TILE_TYPE.MINE
      );
    });
  });
}

/**
 *
 * @param board
 * @returns {*}
 */
function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.revealed && tile.type === TILE_TYPE.MINE;
    });
  });
}

function listMinesLeft() {
  const markedTilesCount = board.reduce((count, row) => {
    return (
      count + row.filter(tile => tile.flagged).length
    );
  }, 0);

  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount;
}

/**
 * Disable all event handlers from being called.
 */
function disableEventHandlers(e) {
  e.stopImmediatePropagation();
}
