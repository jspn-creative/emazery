export type Position = {
  x: number;
  y: number;
};
export enum MazeCellType {
  PATH = 0,
  WALL = 1,
  PLAYER = 2,
  END = 3,
}
