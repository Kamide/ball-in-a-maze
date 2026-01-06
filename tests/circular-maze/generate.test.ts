import { describe, expect, it } from "vitest";
import type { CircularMaze } from "../../src/circular-maze/core";
import {
  CLOCKWISE,
  COUNTERCLOCKWISE,
  INWARD,
  oppositeWallOf,
  OUTWARD,
} from "../../src/circular-maze/core";
import { generateCircularMaze } from "../../src/circular-maze/generate";

describe("generateCircularMaze", () => {
  it("produces a maze with valid clamped dimensions", () => {
    const maze = generateCircularMaze(0, -10);

    expect(maze.rings).toBeGreaterThanOrEqual(1);
    expect(maze.segments).toBeGreaterThanOrEqual(1);
  });

  it("connects all cells so that every cell is reachable from (0,0)", () => {
    const maze = generateCircularMaze(6, 10);
    const visited = new Set<number>();
    const stack: Array<[number, number]> = [[0, 0]];

    while (stack.length > 0) {
      const [ring, segment] = stack.pop()!;
      const index = maze.indexOf(ring, segment);

      if (visited.has(index)) {
        continue;
      }

      visited.add(index);

      for (const neighbor of neighborsOf(maze, ring, segment)) {
        stack.push(neighbor);
      }
    }

    expect(visited.size).toBe(maze.rings * maze.segments);
  });

  it("never creates one-way passages between adjacent cells", () => {
    const maze = generateCircularMaze(4, 8);

    maze.forEach((ring, segment, walls) => {
      for (const wall of [CLOCKWISE, COUNTERCLOCKWISE, INWARD, OUTWARD]) {
        const neighbor =
          wall === CLOCKWISE
            ? [ring, (segment + 1) % maze.segments]
            : wall === COUNTERCLOCKWISE
              ? [ring, (segment - 1 + maze.segments) % maze.segments]
              : wall === INWARD && ring > 0
                ? [ring - 1, segment]
                : wall === OUTWARD && ring < maze.rings - 1
                  ? [ring + 1, segment]
                  : null;

        if (neighbor === null) {
          continue;
        }

        const isOpen = (walls & wall) === 0;

        const isOppositeOpen =
          (wallsOf(maze, neighbor[0], neighbor[1]) & oppositeWallOf(wall)) ===
          0;

        expect(isOpen).toBe(isOppositeOpen);
      }
    });
  });

  it("forms a spanning tree over all interior cells", () => {
    const maze = generateCircularMaze(5, 7);
    let connections = 0;

    maze.forEach((ring, _segment, walls) => {
      if ((walls & CLOCKWISE) === 0) {
        connections++;
      }

      if (ring < maze.rings - 1 && (walls & OUTWARD) === 0) {
        connections++;
      }
    });

    expect(connections).toBe(maze.rings * maze.segments - 1);
  });

  it("opens at least one entrance on the inner ring", () => {
    const maze = generateCircularMaze(3, 12);
    let entrances = 0;

    for (let segment = 0; segment < maze.segments; segment++) {
      if ((wallsOf(maze, 0, segment) & INWARD) === 0) {
        entrances++;
      }
    }

    expect(entrances).toBeGreaterThanOrEqual(1);
  });

  it("opens exactly one exit on the outer ring", () => {
    const maze = generateCircularMaze(6, 9);
    let exits = 0;

    for (let segment = 0; segment < maze.segments; segment++) {
      if ((wallsOf(maze, maze.rings - 1, segment) & OUTWARD) === 0) {
        exits++;
      }
    }

    expect(exits).toBe(1);
  });

  it("does not throw when random always returns 0", () => {
    expect(() => generateCircularMaze(4, 6, () => 0)).not.toThrow();
  });

  it("does not throw when random always returns 1", () => {
    expect(() => generateCircularMaze(4, 6, () => 1)).not.toThrow();
  });
});

function neighborsOf(
  maze: CircularMaze,
  ring: number,
  segment: number,
): Array<[number, number]> {
  const result: Array<[number, number]> = [];

  const tryAddNeighbor = (
    wall: number,
    neighbor: [number, number] | null,
  ): void => {
    if (neighbor !== null && (wallsOf(maze, ring, segment) & wall) === 0) {
      result.push(neighbor);
    }
  };

  tryAddNeighbor(CLOCKWISE, [ring, (segment + 1) % maze.segments]);
  tryAddNeighbor(COUNTERCLOCKWISE, [
    ring,
    (segment - 1 + maze.segments) % maze.segments,
  ]);
  tryAddNeighbor(INWARD, ring > 0 ? [ring - 1, segment] : null);
  tryAddNeighbor(OUTWARD, ring < maze.rings - 1 ? [ring + 1, segment] : null);

  return result;
}

function wallsOf(maze: CircularMaze, ring: number, segment: number): number {
  return maze.data[maze.indexOf(ring, segment)];
}
