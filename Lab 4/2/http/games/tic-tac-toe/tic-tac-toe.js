const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let endGame = false;
let winningLine = [];
let currPlayer = 1; // 1 = X, 2 = O
let player1Score = 0; // X 分
let player2Score = 0; // O 分

// 新增：控制权与输入锁
let isXComputer = false; // 默认 “❌ 你”
let isOComputer = false; // 默认 “⭕ 你”
let inputLocked = false; // 电脑思考期间锁定输入
let aiTimer = null; // 电脑走子定时器

const imageX = new Image();
const imageO = new Image();
imageX.src = "./images/X.svg";
imageO.src = "./images/O.svg";

document.addEventListener("DOMContentLoaded", () => {
    renderBoard();
    updateScore();
    updatePlayer();
    maybeAutoPlay();

    const resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", reset);
});

function clickCell(cell) {
    if (board[cell] !== 0 || endGame) return;
    if (inputLocked) return; // 禁止在电脑思考时落子

    const currIsComputer = currPlayer === 1 ? isXComputer : isOComputer;
    if (currIsComputer) return; // 当前应由电脑下，不允许玩家落子

    // 人类在当前玩家位落子
    board[cell] = currPlayer;
    renderBoard();

    if (checkWin()) {
        renderWinCell();
        if (currPlayer === 1) player1Score++;
        else player2Score++;
        updateScore();
        setTimeout(() => alert("你赢了！"), 2);
        endGame = true;
        return;
    }

    if (checkDraw()) {
        setTimeout(() => alert("平局！"), 2);
        endGame = true;
        return;
    }

    // 切换到另一方
    currPlayer = currPlayer === 1 ? 2 : 1;
    updatePlayer();

    // 如果下一手应由电脑下，则自动走棋
    maybeAutoPlay();
}

function checkWin() {
    const winPattern = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let [a, b, c] of winPattern) {
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            winningLine = [a, b, c];
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return board.every((cell) => cell != 0);
}

function reset() {
    // 取消电脑的待执行动作，解除锁
    if (aiTimer) {
        clearTimeout(aiTimer);
        aiTimer = null;
    }
    inputLocked = false;

    board.fill(0);
    endGame = false;
    winningLine = [];
    currPlayer = 1;

    renderWinCell();
    renderBoard();
    updatePlayer();
    updateScore();

    // 重置后如果应由电脑下，自动走棋
    maybeAutoPlay();
}

function renderBoard() {
    const b = document.getElementById("board");
    b.innerHTML = "";

    for (let index = 0; index < board.length; index++) {
        const cell = document.createElement("div");
        cell.classList.add("board-cell");

        if (board[index] === 1) {
            const img = document.createElement("img");
            img.src = imageX.src;
            img.alt = "X";
            img.draggable = false;
            cell.appendChild(img);
            cell.classList.add("filled");
        } else if (board[index] === 2) {
            const img = document.createElement("img");
            img.src = imageO.src;
            img.alt = "O";
            img.draggable = false;
            cell.appendChild(img);
            cell.classList.add("filled");
        }

        cell.addEventListener("click", () => clickCell(index));
        b.appendChild(cell);
    }
}

function renderWinCell() {
    const cells = document.querySelectorAll(".board-cell");
    cells.forEach((cell, index) => {
        if (winningLine.includes(index)) {
            cell.classList.add("winning-cell");
        } else {
            cell.classList.remove("winning-cell");
        }
    });
}

function updatePlayer() {
    const turnEl = document.getElementById("turn");
    const isComputerTurn = currPlayer === 1 ? isXComputer : isOComputer;
    turnEl.textContent = `当前玩家: ${isComputerTurn ? "电脑" : "你"}`;
}

function updateScore() {
    const scoreEl = document.getElementById("scoreboard");
    const xRole = isXComputer ? "电脑" : "你";
    const oRole = isOComputer ? "电脑" : "你";

    scoreEl.innerHTML = `
        <div id="score-x" class="score-item">
            <span>❌</span>
            <span>${xRole}:</span>
            <strong style="margin-left:auto">${player1Score}</strong>
        </div>
        <div id="score-o" class="score-item">
            <span>⭕</span>
            <span>${oRole}:</span>
            <strong style="margin-left:auto">${player2Score}</strong>
        </div>
    `;

    // 切换控制权（不清空分数）
    document.getElementById("score-x").addEventListener("click", () => {
        isXComputer = !isXComputer;
        handleControlToggle();
    });
    document.getElementById("score-o").addEventListener("click", () => {
        isOComputer = !isOComputer;
        handleControlToggle();
    });
}

// 控制权切换后的公共处理
function handleControlToggle() {
    // 若电脑正在思考，切换为“你”时应取消
    if (aiTimer) {
        clearTimeout(aiTimer);
        aiTimer = null;
    }
    inputLocked = false;

    updateScore();
    updatePlayer();
    maybeAutoPlay();
}

// 若轮到电脑且该方为电脑控制，则安排电脑自动走子
function maybeAutoPlay() {
    if (endGame) return;
    const compTurn = currPlayer === 1 ? isXComputer : isOComputer;
    if (!compTurn) return;
    if (inputLocked) return;

    inputLocked = true;
    aiTimer = setTimeout(() => {
        computerPlayFor(currPlayer);
    }, 600);
}

// 电脑AI：可为 1(❌) 或 2(⭕) 做决定
function computerPlayFor(aiPlayer) {
    const emptyCells = board
        .map((val, idx) => (val === 0 ? idx : null))
        .filter((val) => val !== null);

    if (emptyCells.length === 0 || endGame) {
        inputLocked = false;
        return;
    }

    let bestScore = -Infinity;
    let bestMove = null;
    let alpha = -Infinity;
    let beta = Infinity;

    for (let move of emptyCells) {
        board[move] = aiPlayer;
        let score = minimax(board, 1, false, alpha, beta, aiPlayer);
        board[move] = 0;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
    }

    // 兜底：如果意外未选出，随机走一步
    if (bestMove === null) {
        bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // 落子
    board[bestMove] = aiPlayer;
    renderBoard();

    if (checkWin()) {
        renderWinCell();
        if (aiPlayer === 1) player1Score++;
        else player2Score++;
        updateScore();
        setTimeout(() => alert("电脑获胜！"), 100);
        endGame = true;
        inputLocked = false;
        return;
    }

    if (checkDraw()) {
        setTimeout(() => alert("平局！"), 100);
        endGame = true;
        inputLocked = false;
        return;
    }

    // 轮到另一方
    currPlayer = aiPlayer === 1 ? 2 : 1;
    inputLocked = false;
    updatePlayer();

    // 若对手也是电脑，则继续自动走
    maybeAutoPlay();
}

// Minimax（Alpha-Beta 剪枝），aiPlayer 可为 1 或 2
function minimax(board, depth, isMaximizing, alpha, beta, aiPlayer) {
    const winner = checkWinForMinimax();
    if (winner !== null) {
        if (winner === aiPlayer) return 10 - depth;
        return -10 + depth;
    }
    if (board.every((cell) => cell !== 0)) return 0; // 平局

    const emptyCells = board
        .map((val, idx) => (val === 0 ? idx : null))
        .filter((val) => val !== null);

    const opponent = aiPlayer === 1 ? 2 : 1;

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let move of emptyCells) {
            board[move] = aiPlayer;
            const score = minimax(
                board,
                depth + 1,
                false,
                alpha,
                beta,
                aiPlayer
            );
            board[move] = 0;

            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (alpha >= beta) break;
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let move of emptyCells) {
            board[move] = opponent;
            const score = minimax(
                board,
                depth + 1,
                true,
                alpha,
                beta,
                aiPlayer
            );
            board[move] = 0;

            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (alpha >= beta) break;
        }
        return minScore;
    }
}

function checkWinForMinimax() {
    const winPattern = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let [a, b, c] of winPattern) {
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            return board[a]; // 1 或 2
        }
    }
    return null; // 无人获胜
}
