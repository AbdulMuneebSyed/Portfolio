// 2048 rules on a flat 4×4 board (0 = empty).
export const SIZE = 4;
export type Board = number[];
export type Direction = "left" | "right" | "up" | "down";

// Slides one row to the left, merging each pair of equal tiles once.
export function slideRow(row: number[]) {
  const tiles = row.filter(Boolean);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2);
      gained += tiles[i] * 2;
      i++;
    } else out.push(tiles[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

const index = (dir: Direction, line: number, k: number) => {
  switch (dir) {
    case "left":
      return line * SIZE + k;
    case "right":
      return line * SIZE + (SIZE - 1 - k);
    case "up":
      return k * SIZE + line;
    case "down":
      return (SIZE - 1 - k) * SIZE + line;
  }
};

export function move(board: Board, dir: Direction) {
  const next = [...board];
  let gained = 0;
  for (let line = 0; line < SIZE; line++) {
    const cells = Array.from({ length: SIZE }, (_, k) => index(dir, line, k));
    const result = slideRow(cells.map((i) => board[i]));
    gained += result.gained;
    cells.forEach((i, k) => (next[i] = result.row[k]));
  }
  const moved = next.some((v, i) => v !== board[i]);
  return { board: next, gained, moved };
}

export function addRandomTile(board: Board, random = Math.random) {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(random() * empty.length)]] = random() < 0.9 ? 2 : 4;
  return next;
}

export function newBoard(random = Math.random) {
  return addRandomTile(addRandomTile(Array(SIZE * SIZE).fill(0), random), random);
}

export function canMove(board: Board) {
  return (["left", "right", "up", "down"] as Direction[]).some(
    (dir) => move(board, dir).moved,
  );
}
