// Tic-tac-toe on a flat 3×3 board, with a perfect minimax opponent.
export type Cell = "X" | "O" | null;

export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function winner(board: Cell[]) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { player: board[a] as "X" | "O", line };
  }
  return null;
}

export const isFull = (board: Cell[]) => board.every(Boolean);

function score(board: Cell[], me: "X" | "O", turn: "X" | "O", depth: number): number {
  const win = winner(board);
  if (win) return win.player === me ? 10 - depth : depth - 10;
  if (isFull(board)) return 0;
  const results = board.flatMap((cell, i) => {
    if (cell) return [];
    const next = [...board];
    next[i] = turn;
    return [score(next, me, turn === "X" ? "O" : "X", depth + 1)];
  });
  return turn === me ? Math.max(...results) : Math.min(...results);
}

// The best square for `me` to play, or -1 when the board is full.
export function bestMove(board: Cell[], me: "X" | "O") {
  let best = -1;
  let bestScore = -Infinity;
  board.forEach((cell, i) => {
    if (cell) return;
    const next = [...board];
    next[i] = me;
    const s = score(next, me, me === "X" ? "O" : "X", 0);
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  });
  return best;
}
