import { describe, expect, it } from "vitest";
import {
  ALL,
  CircularMaze,
  CLOCKWISE,
  COUNTERCLOCKWISE,
  INWARD,
  NONE,
  oppositeWallOf,
  OUTWARD,
  RINGS,
  SEGMENTS,
  WALLS,
} from "../../src/circular-maze/core.ts";

describe("circular-maze core", () => {
  it("defines disjoint single-bit wall flags and a correct ALL mask", () => {
    const walls = [CLOCKWISE, COUNTERCLOCKWISE, INWARD, OUTWARD];

    for (let i = 0; i < walls.length; i++) {
      for (let j = i + 1; j < walls.length; j++) {
        expect(walls[i] & walls[j]).toBe(0);
      }
    }

    expect(CLOCKWISE | COUNTERCLOCKWISE | INWARD | OUTWARD).toBe(ALL);
  });

  it("defines opposite walls as a symmetric involution over valid walls", () => {
    const walls = [CLOCKWISE, COUNTERCLOCKWISE, INWARD, OUTWARD];

    for (const wall of walls) {
      const opposite = oppositeWallOf(wall);

      expect(walls).toContain(opposite);
      expect(oppositeWallOf(opposite)).toBe(wall);
    }
  });

  it("maps NONE, combined, and invalid walls to NONE in oppositeWallOf", () => {
    expect(oppositeWallOf(NONE)).toBe(NONE);
    expect(oppositeWallOf(ALL)).toBe(NONE);
    expect(oppositeWallOf(CLOCKWISE | INWARD)).toBe(NONE);
    expect(oppositeWallOf(255)).toBe(NONE);
  });

  it("stores rings and segments metadata correctly in barricaded mazes", () => {
    const maze = CircularMaze.barricaded(3, 4);

    expect(maze.rings).toBe(3);
    expect(maze.segments).toBe(4);
    expect(maze.data[RINGS]).toBe(3);
    expect(maze.data[SEGMENTS]).toBe(4);
  });

  it("allocates data with a fixed WALLS offset and linear cell storage", () => {
    const maze = CircularMaze.barricaded(2, 3);

    expect(maze.data.length).toBe(WALLS + 2 * 3);
    expect(maze.indexOf(0, 0)).toBe(WALLS);
    expect(maze.indexOf(0, 1)).toBe(WALLS + 1);
    expect(maze.indexOf(1, 0)).toBe(WALLS + 3);
  });

  it("initializes all cells as fully barricaded", () => {
    const maze = CircularMaze.barricaded(2, 2);

    maze.forEach((_ring, _segment, walls) => {
      expect(walls).toBe(ALL);
    });
  });

  it("visits each cell exactly once in ring-major, segment-major order", () => {
    const maze = CircularMaze.barricaded(2, 3);
    const visited: Array<[number, number]> = [];

    maze.forEach((ring, segment) => {
      visited.push([ring, segment]);
    });

    expect(visited).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ]);
  });

  it("maps each cell to a unique index", () => {
    const maze = CircularMaze.barricaded(3, 3);
    const indices = new Set<number>();

    maze.forEach((ring, segment, _walls) => {
      indices.add(maze.indexOf(ring, segment));
    });

    expect(indices.size).toBe(9);
  });

  it("removes only specified wall bits when unblocking", () => {
    const maze = CircularMaze.barricaded(1, 1);
    const index = maze.indexOf(0, 0);

    maze.unblock(0, 0, CLOCKWISE | INWARD);
    const walls = maze.data[index];

    expect(walls & CLOCKWISE).toBe(0);
    expect(walls & INWARD).toBe(0);
    expect(walls & COUNTERCLOCKWISE).not.toBe(0);
    expect(walls & OUTWARD).not.toBe(0);
  });

  it("applies unblock idempotently and ignores NONE", () => {
    const maze = CircularMaze.barricaded(1, 1);
    const index = maze.indexOf(0, 0);

    maze.unblock(0, 0, OUTWARD);
    const once = maze.data[index];

    maze.unblock(0, 0, OUTWARD);
    expect(maze.data[index]).toBe(once);

    maze.unblock(0, 0, NONE);
    expect(maze.data[index]).toBe(once);
  });

  it("does not affect other cells when unblocking a single cell", () => {
    const maze = CircularMaze.barricaded(2, 2);

    maze.unblock(0, 0, CLOCKWISE);

    maze.forEach((ring, segment, walls) => {
      if (ring === 0 && segment === 0) {
        expect(walls).not.toBe(ALL);
      } else {
        expect(walls).toBe(ALL);
      }
    });
  });

  it("clamps rings and segments to [1, 255] when given zero or negative", () => {
    const maze = CircularMaze.barricaded(0, -5);

    expect(maze.rings).toBe(1);
    expect(maze.segments).toBe(1);
    expect(maze.data.length).toBe(WALLS + 1);
  });

  it("clamps excessively large values to 255 maximum", () => {
    const maze = CircularMaze.barricaded(100000000000, 5000);

    expect(maze.rings).toBe(255);
    expect(maze.segments).toBe(255);
    expect(maze.data.length).toBe(WALLS + 255 * 255);
  });
});
