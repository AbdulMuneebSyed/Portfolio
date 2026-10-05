// One grid shared by default icon placement and drag-and-drop snapping,
// so a dropped icon always lines up with the ones that never moved.
// Positions are relative to the desktop icon container.
export const GRID_CELL_WIDTH = 100;
export const GRID_CELL_HEIGHT = 100;

type Position = { x: number; y: number };

export function gridCell(column: number, row: number): Position {
  return { x: column * GRID_CELL_WIDTH, y: row * GRID_CELL_HEIGHT };
}

function cellKey(position: Position) {
  return `${Math.round(position.x / GRID_CELL_WIDTH)}:${Math.round(
    position.y / GRID_CELL_HEIGHT
  )}`;
}

// Nearest grid cell to `target` that isn't taken by another icon, kept
// inside a container of the given size.
export function nearestFreeCell(
  target: Position,
  occupied: Position[],
  bounds: { width: number; height: number }
): Position {
  const maxColumn = Math.max(0, Math.floor(bounds.width / GRID_CELL_WIDTH) - 1);
  const maxRow = Math.max(0, Math.floor(bounds.height / GRID_CELL_HEIGHT) - 1);
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

  const targetColumn = clamp(Math.round(target.x / GRID_CELL_WIDTH), maxColumn);
  const targetRow = clamp(Math.round(target.y / GRID_CELL_HEIGHT), maxRow);
  const taken = new Set(occupied.map(cellKey));

  let best = gridCell(targetColumn, targetRow);
  let bestDistance = Infinity;

  for (let column = 0; column <= maxColumn; column++) {
    for (let row = 0; row <= maxRow; row++) {
      const cell = gridCell(column, row);
      if (taken.has(cellKey(cell))) continue;
      const distance = (column - targetColumn) ** 2 + (row - targetRow) ** 2;
      if (distance < bestDistance) {
        best = cell;
        bestDistance = distance;
      }
    }
  }

  return best;
}
