// #region walls
import { base64ToUint8Array, uint8ArrayToBase64 } from "uint8array-extras";

export const NONE = 0b0000;
export const CLOCKWISE = 0b0001;
export const COUNTERCLOCKWISE = 0b0010;
export const INWARD = 0b0100;
export const OUTWARD = 0b1000;
export const ALL = 0b1111;
// #endregion

export function oppositeWallOf(wall: number): number {
  switch (wall) {
    case CLOCKWISE:
      return COUNTERCLOCKWISE;
    case COUNTERCLOCKWISE:
      return CLOCKWISE;
    case INWARD:
      return OUTWARD;
    case OUTWARD:
      return INWARD;
    default:
      return NONE;
  }
}

// #region offsets
export const RINGS = 0;
export const SEGMENTS = 1;
export const WALLS = 2;
// #endregion

export function positiveUint8Of(value: number): number {
  return Math.min(Math.max(value, 1), 255);
}

export class CircularMaze {
  declare data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  get rings(): number {
    return this.data[RINGS];
  }

  get segments(): number {
    return this.data[SEGMENTS];
  }

  static barricaded(rings: number, segments: number): CircularMaze {
    rings = positiveUint8Of(rings);
    segments = positiveUint8Of(segments);

    const data = new Uint8Array(WALLS + rings * segments);

    data[RINGS] = rings;
    data[SEGMENTS] = segments;
    data.fill(ALL, WALLS);

    return new CircularMaze(data);
  }

  static fromString(string: string): CircularMaze | undefined {
    const data = base64ToUint8Array(string);

    if (
      data.length > WALLS &&
      data[0] > 0 &&
      data[1] > 0 &&
      data.length === WALLS + data[0] * data[1]
    ) {
      return new CircularMaze(base64ToUint8Array(string));
    }
  }

  forEach(
    action: (ring: number, segment: number, walls: number) => void,
  ): void {
    const { data, rings, segments } = this;

    for (let ring = 0; ring < rings; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        action(ring, segment, data[this.indexOf(ring, segment)]);
      }
    }
  }

  indexOf(ring: number, segment: number): number {
    return WALLS + ring * this.segments + segment;
  }

  toString(): string {
    return uint8ArrayToBase64(this.data, { urlSafe: true });
  }

  unblock(ring: number, segment: number, walls: number): void {
    this.data[this.indexOf(ring, segment)] &= ~walls;
  }
}
