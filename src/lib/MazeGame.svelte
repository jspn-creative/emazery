<script lang="ts">
  import { onMount } from "svelte";
  import { createMaze } from "./mazeGenerator";
  import type { Position, MazeCellType } from "./types";

  let maze = $state<MazeCellType[][]>([]);
  let playerPos = $state<Position>({ x: 1, y: 1 });
  let gameWon = $state(false);
  let moveInterval = $state<number | null>(null);
  let pressedKeys = $state(new Set<string>());

  let mazeSize = $state<number>(15);
  const WALL = 1;
  const PATH = 0;
  const PLAYER = 2;
  const END = 3;
  const MOVEMENT_SPEED = 100; // ms between moves
  let endPos = $state<Position>();

  $effect(() => {
    endPos = { x: mazeSize - 2, y: mazeSize - 2 };
  });

  const CELL_SIZE = 32; // Width and height of each maze cell in pixels
  const MARGIN = [350, 100]; // Total margin/padding around the maze (adjust as needed)

  function movePlayer(dx: number, dy: number) {
    if (gameWon) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] !== WALL) {
      maze[playerPos.y][playerPos.x] = PATH;
      playerPos = { x: newX, y: newY };

      if (newX === endPos.x && newY === endPos.y) {
        gameWon = true;
        stopMovement();
      } else {
        maze[newY][newX] = PLAYER;
      }
    }
  }

  function getMovementFromKeys(): [number, number] {
    let dx = 0;
    let dy = 0;

    if (pressedKeys.has("arrowleft") || pressedKeys.has("a")) dx = -1;
    if (pressedKeys.has("arrowright") || pressedKeys.has("d")) dx = 1;
    if (pressedKeys.has("arrowup") || pressedKeys.has("w")) dy = -1;
    if (pressedKeys.has("arrowdown") || pressedKeys.has("s")) dy = 1;

    return [dx, dy];
  }

  function startMovement() {
    if (moveInterval !== null) return;

    moveInterval = setInterval(() => {
      const [dx, dy] = getMovementFromKeys();
      if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy);
      }
    }, MOVEMENT_SPEED);
  }

  function stopMovement() {
    if (moveInterval !== null) {
      clearInterval(moveInterval);
      moveInterval = null;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!pressedKeys.has(key)) {
      pressedKeys.add(key);
      const [dx, dy] = getMovementFromKeys();
      if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy);
        startMovement();
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    pressedKeys.delete(key);

    if (pressedKeys.size === 0) {
      stopMovement();
    }
  }

  function resetGame() {
    gameWon = false;
    playerPos = { x: 1, y: 1 };
    pressedKeys.clear();
    stopMovement();
    initializeMaze();
  }

  function initializeMaze() {
    const { generatedMaze } = createMaze(mazeSize, playerPos, endPos);
    maze = generatedMaze;
  }

  function updateMazeSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const maxMazeWidth = Math.floor((windowWidth - MARGIN[1]) / CELL_SIZE);
    const maxMazeHeight = Math.floor((windowHeight - MARGIN[0]) / CELL_SIZE);

    const maxSize = Math.min(maxMazeWidth, maxMazeHeight);

    const newMazeSize = Math.max(5, maxSize | 1);

    if (newMazeSize !== mazeSize) {
      mazeSize = newMazeSize;
      endPos = { x: mazeSize - 2, y: mazeSize - 2 };
      resetGame();
    }
  }

  onMount(() => {
    initializeMaze();
    updateMazeSize();
    window.addEventListener("resize", updateMazeSize);
    return () => {
      window.removeEventListener("resize", updateMazeSize);
      stopMovement();
    };
  });
</script>

<svelte:window
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
  on:blur={() => {
    pressedKeys.clear();
    stopMovement();
  }}
/>

<div class="flex flex-col items-center p-8 pt-6">
  <div class="transform perspective-effect">
    <h1 class="text-5xl text-green-400 text-center">Emazery</h1>
    <h2 class="text-lg tracking-[0.45em] mb-8 text-gray-300 text-center">-MAZE RUNNER-</h2>
  </div>
  <div class="bg-gray-800 p-4 rounded-md {gameWon ? 'shadow-green-500' : 'shadow-red-800'} shadow-[0_0_50px_-6px]">
    <div class="grid gap-[1px]">
      {#each maze as row, y}
        <div class="flex">
          {#each row as cell, x}
            <div
              class="w-8 h-8 relative grid place-items-center
                {cell === WALL ? 'bg-gray-900' : 'bg-gray-700'}
                {cell === PLAYER ? 'after:bg-green-500 after:size-6 after:rounded-full after:animate-pulse after:shadow-[0_0_10px_0] after:shadow-green-500' : ''}
                {cell === END ? 'bg-gray-700 after:size-6 after:bg-rose-500 after:rounded-xs' : ''}"
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if gameWon}
    <div class="mt-8 text-center">
      <h2 class="text-xl text-green-400 mb-4">You Won!</h2>
      <button onclick={resetGame} class="px-6 py-3 bg-green-500 hover:bg-green-600 rounded transition-colors duration-200 text-sm"> Play Again </button>
    </div>
  {:else}
    <p class="mt-6 text-sm text-gray-400">Use arrow keys or WASD to move</p>
    <button onclick={resetGame} class="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200 text-sm"> Reset Game </button>
  {/if}
</div>

<style lang="postcss">
  .perspective-effect {
    text-shadow:
      0 1px 0 #3a9f64,
      0 2px 0 #3a9f64,
      0 3px 0 #3a9f64,
      0 4px 0 #3a9f64,
      0 5px 10px rgba(0, 0, 0, 1);
    animation: float 6s ease-in-out infinite;
    transform: perspective(500px) rotateX(20deg);
  }

  @keyframes float {
    0%,
    100% {
      transform: perspective(500px) rotateX(20deg) translateY(0);
    }
    50% {
      transform: perspective(500px) rotateX(20deg) translateY(-10px);
    }
  }
</style>
