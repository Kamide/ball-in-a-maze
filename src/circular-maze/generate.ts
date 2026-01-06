import {
  CircularMaze,
  CLOCKWISE,
  COUNTERCLOCKWISE,
  INWARD,
  oppositeWallOf,
  OUTWARD,
  positiveUint8Of,
} from "./core";

export function generateCircularMaze(
  rings: number,
  segments: number,
  random: () => number = Math.random,
): CircularMaze {
  rings = positiveUint8Of(rings);
  segments = positiveUint8Of(segments);

  const maze = CircularMaze.barricaded(rings, segments);

  const visited = Array.from({ length: rings }, () =>
    Array<boolean>(segments).fill(false),
  );

  const step = (
    ring: number,
    segment: number,
    wall: number,
  ): [ring: number, segment: number] | null => {
    switch (wall) {
      case CLOCKWISE:
        return [ring, (segment + 1) % segments];
      case COUNTERCLOCKWISE:
        return [ring, (segment - 1 + segments) % segments];
      case INWARD:
        return ring > 0 ? [ring - 1, segment] : null;
      case OUTWARD:
        return ring < rings - 1 ? [ring + 1, segment] : null;
      default:
        return null;
    }
  };

  type Edge = {
    ring: number;
    segment: number;
    wall: number;
  };

  const frontier: Array<Edge> = [];

  const addFrontier = (ring: number, segment: number): void => {
    for (let wall = CLOCKWISE; wall <= OUTWARD; wall <<= 1) {
      const next = step(ring, segment, wall);
      if (next === null) {
        continue;
      }

      const [nextRing, nextSegment] = next;
      if (!visited[nextRing][nextSegment]) {
        frontier.push({ ring, segment, wall });
      }
    }
  };

  visited[0][0] = true;
  addFrontier(0, 0);

  while (frontier.length > 0) {
    const { ring, segment, wall } = frontier.splice(
      Math.min(Math.trunc(random() * frontier.length), frontier.length - 1),
      1,
    )[0];

    const next = step(ring, segment, wall);
    if (next === null) {
      continue;
    }

    const [nextRing, nextSegment] = next;
    if (visited[nextRing][nextSegment]) {
      continue;
    }

    maze.unblock(ring, segment, wall);
    maze.unblock(nextRing, nextSegment, oppositeWallOf(wall));

    visited[nextRing][nextSegment] = true;
    addFrontier(nextRing, nextSegment);
  }

  let opened = false;
  for (let entrance = 0; entrance < segments; entrance++) {
    if (random() > 0.5) {
      maze.unblock(0, entrance, INWARD);
      opened = true;
    }
  }
  if (!opened) {
    const entrance = Math.trunc(random() * segments);
    maze.unblock(0, entrance, INWARD);
  }

  const exit = Math.trunc(random() * segments);
  maze.unblock(rings - 1, exit, OUTWARD);

  return maze;
}
