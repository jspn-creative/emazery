import type { Position, MazeCell } from "./types";

export function createMaze(size: number, playerPos: Position, endPos: Position) {
  const maze: MazeCell[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(1));

  function carve(x: number, y: number) {
    maze[y][x] = 0;
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < size - 1 && newY > 0 && newY < size - 1 && maze[newY][newX] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(newX, newY);
      }
    }
  }

  carve(1, 1);
  maze[playerPos.y][playerPos.x] = 2;
  maze[endPos.y][endPos.x] = 3;

  return { generatedMaze: maze };
}
