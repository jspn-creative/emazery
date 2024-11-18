import type { Position } from "./types";
import { MazeCellType } from "./types";

export function createMaze(size: number, playerPos: Position, endPos: Position) {
  const maze: MazeCellType[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(MazeCellType.WALL));

  function carve(x: number, y: number) {
    maze[y][x] = MazeCellType.PATH;
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < size - 1 && newY > 0 && newY < size - 1 && maze[newY][newX] === MazeCellType.WALL) {
        maze[y + dy / 2][x + dx / 2] = MazeCellType.PATH;
        carve(newX, newY);
      }
    }
  }

  carve(1, 1);
  maze[playerPos.y][playerPos.x] = MazeCellType.PLAYER;
  maze[endPos.y][endPos.x] = MazeCellType.END;

  return { generatedMaze: maze };
}
