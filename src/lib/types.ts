export type Position = {
  x: number;
  y: number;
};
export type MazeCell = 0 | 1 | 2 | 3; // PATH | WALL | PLAYER | END