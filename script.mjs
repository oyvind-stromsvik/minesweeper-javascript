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
  checkWin,
  checkLose
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
      checkGameEnd();
    });
    tile.element.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      flagTile(tile);
      listMinesLeft();
    });
    tile.element.addEventListener('auxclick', function(e) {
      if (e.button === 1) {
        revealAdjacent(board, tile);
        checkGameEnd();
      }
    });
  });
});

boardElement.style.setProperty("--board-size", BOARD_SIZE);
minesLeftText.textContent = NUMBER_OF_MINES;

/**
 *
 */
function checkGameEnd() {
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
