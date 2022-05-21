import {
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  revealAdjacent,
  checkWin,
  checkLose
} from "./minesweeper.mjs";

const BOARD_SIZE = 20;
const NUMBER_OF_MINES = 40;

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
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
      markTile(tile);
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
  const win = checkWin(board);
  const lose = checkLose(board);

  if (win || lose) {
    // Disable tile clicking if we've won or lost.
    // By doing this in the capture phase for the board, we ensure the event
    // never reaches the tiles because it's captured before that.
    boardElement.addEventListener("click", disableEventHandlers, { capture: true });
    boardElement.addEventListener("contextmenu", disableEventHandlers, { capture: true });
  }

  if (win) {
    messageText.textContent = "You Win";
  }
  if (lose) {
    messageText.textContent = "You Lose";
    board.forEach(row => {
      row.forEach(tile => {
        if (tile.status === TILE_STATUSES.MARKED) {
          markTile(tile);
        }
        if (tile.mine) {
          revealTile(board, tile);
        }
      });
    });
  }
}

function listMinesLeft() {
  const markedTilesCount = board.reduce((count, row) => {
    return (
      count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
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
