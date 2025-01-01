const ROWS = 8;
const COLS = 8;
const MINES = 10;

let board = [];
let mineCount = MINES;
let timer = 0;
let interval;
let gameOver = false;

document.addEventListener("DOMContentLoaded", () => {
  const boardElement = document.getElementById("board");
  const restartButton = document.getElementById("restart");
  const minesCountElement = document.getElementById("mines-count");
  const timerElement = document.getElementById("timer");
  let time = 0;
  let timerInterval;

  restartButton.addEventListener("click", resetGame);

  restartButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    document.body.classList.toggle("pink-mode");
  });

  function startTimer() {
    timerInterval = setInterval(() => {
      time++;
      document.getElementById("timer").textContent = time
        .toString()
        .padStart(3, "0");
    }, 1000);
  }

  function resetGame() {
    time = 0;
    mineCount = 10;
    document.getElementById("timer").textContent = "000";
    document.getElementById("mines-count").textContent = "010";
    document.getElementById("restart").className = "";
    document.getElementById("restart").style.backgroundImage = "url('assets/img/smile.png')";
    clearInterval(timerInterval);
    startTimer();
    createBoard();
    gameOver = false;
  }

  function createBoard() {
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 22px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, 22px)`;

    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;
        board[i][j] = { mine: false, revealed: false, flagged: false };
        cell.addEventListener("click", () => revealCell(i, j));
        cell.addEventListener("contextmenu", (e) => toggleFlag(e, i, j));
        boardElement.appendChild(cell);
      }
    }

    placeMines();
  }

  function placeMines() {
    let placedMines = 0;
    while (placedMines < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!board[row][col].mine) {
        board[row][col].mine = true;
        placedMines++;
      }
    }
  }

  function getColorForNumber(number) {
    const colors = {
      1: "#0000FF",
      2: "#008200",
      3: "#FF0000",
      4: "#000084",
      5: "#840000",
      6: "#008284",
      7: "#000000",
    };
    return colors[number] || "#000000";
  }

  function revealCell(row, col) {
    if (gameOver) return;
  
    const cell = board[row][col];
    const cellElement = document.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`
    );
  
    if (cell.revealed || cell.flagged) return;
  
    cell.revealed = true;
    cellElement.classList.add("revealed");
  
    if (cell.mine) {
      cellElement.classList.add("mine-exploded");
      revealAllMines();
      gameOver = true;
      clearInterval(timerInterval);
      document.getElementById("restart").classList.add("lose");
      document.getElementById("restart").style.backgroundImage = "url('assets/img/lose.png')";
      return;
    }
  
    const adjacentMines = countAdjacentMines(row, col);
  
    if (adjacentMines > 0) {
      cellElement.textContent = adjacentMines;
      cellElement.style.color = getColorForNumber(adjacentMines);
      cellElement.style.fontFamily = "'Press Start 2P', monospace";
      cellElement.style.fontWeight = "bold";
    } else {
      cellElement.classList.add("empty");
      revealAdjacentCells(row, col);
    }
  
    if (checkWin()) {
      gameOver = true;
      document.getElementById("restart").classList.add("win");
      document.getElementById("restart").style.backgroundImage = "url('assets/img/win.png')";
      clearInterval(timerInterval);
    }
  }
  
  function revealAdjacentCells(row, col) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
  
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
  
      if (isValidCell(newRow, newCol)) {
        const adjacentCell = board[newRow][newCol];
        const cellElement = document.querySelector(
          `.cell[data-row="${newRow}"][data-col="${newCol}"]`
        );
  
        if (!adjacentCell.revealed && !adjacentCell.flagged) {
          adjacentCell.revealed = true;
          cellElement.classList.add("revealed");
  
          const adjacentMines = countAdjacentMines(newRow, newCol);
          if (adjacentMines > 0) {
            cellElement.textContent = adjacentMines;
            cellElement.style.color = getColorForNumber(adjacentMines);
            cellElement.style.fontFamily = "'Press Start 2P', monospace";
            cellElement.style.fontWeight = "bold";
          } else {
            cellElement.classList.add("empty");
            revealAdjacentCells(newRow, newCol);
          }
        }
      }
    }
  }  

  function revealAllMines() {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        const cellElement = document.querySelector(
          `.cell[data-row="${row}"][data-col="${col}"]`
        );
  
        if (cell.mine) {
          cellElement.classList.add('mine');
        }
      }
    }
  }  

  function isValidCell(row, col) {
    return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
  }

  function countAdjacentMines(row, col) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;

        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          board[newRow][newCol].mine
        ) {
          count++;
        }
      }
    }

    return count;
  }

  function toggleFlag(event, row, col) {
    event.preventDefault();

    if (gameOver) return;

    const cell = board[row][col];
    const cellElement = document.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`
    );

    if (cell.revealed) return;

    if (cell.flagged) {
      cell.flagged = false;
      cellElement.classList.remove("flag");
      mineCount++;
    } else {
      cell.flagged = true;
      cellElement.classList.add("flag");
      mineCount--;
    }

    document.getElementById("mines-count").textContent = mineCount
      .toString()
      .padStart(3, "0");
  }

  function checkWin() {
    return board.flat().every(
      (cell) => cell.revealed || (cell.mine && !cell.revealed)
    );
  }

  resetGame();
});
