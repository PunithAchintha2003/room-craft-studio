/**
 * Room shape outline utilities for 2D/3D rendering.
 * Coordinates: x = width (east), y = length (south). Origin at top-left (north-west).
 */
import type { RoomConfig } from '@/types/design.types';

export function getFloorOutlinePoints(
  room: RoomConfig,
  pixelsPerMeter: number
): number[] {
  const W = room.width;
  const L = room.length;
  const layout = room.layout ?? 'rectangle';
  const scale = (x: number, y: number) => [x * pixelsPerMeter, y * pixelsPerMeter];

  if (layout === 'rectangle') {
    const [a, b] = scale(0, 0);
    const [c, d] = scale(W, 0);
    const [e, f] = scale(W, L);
    const [g, h] = scale(0, L);
    return [a, b, c, d, e, f, g, h];
  }

  const cw = Math.min(room.cutoutWidth ?? 2, W - 1);
  const cl = Math.min(room.cutoutLength ?? 2, L - 1);
  const pos = room.cutoutPosition ?? 'bottom-right';

  if (layout === 'l-shape' || layout === 'l-mirror') {
    // L shape: one corner rectangle cut out
    const points: [number, number][] = [];
    switch (pos) {
      case 'top-left':
        points.push([cw, 0], [W, 0], [W, L], [0, L], [0, cl], [cw, cl]);
        break;
      case 'top-right':
        points.push([0, 0], [W - cw, 0], [W - cw, cl], [W, cl], [W, L], [0, L]);
        break;
      case 'bottom-left':
        points.push([0, 0], [W, 0], [W, L], [cw, L], [cw, L - cl], [0, L - cl]);
        break;
      case 'bottom-right':
      default:
        points.push([0, 0], [W, 0], [W, L - cl], [W - cw, L - cl], [W - cw, L], [0, L]);
        break;
    }
    return points.flatMap(([x, y]) => scale(x, y));
  }

  if (layout === 'angled-bay') {
    // One corner cut at 45° diagonal: corner (x,y) replaced by (x - cw, y) to (x, y - cl)
    const points: [number, number][] = [];
    switch (pos) {
      case 'top-left':
        points.push([cw, 0], [W, 0], [W, L], [0, L], [0, cl]);
        break;
      case 'top-right':
        points.push([0, 0], [W - cw, 0], [W, cl], [W, L], [0, L]);
        break;
      case 'bottom-left':
        points.push([0, 0], [W, 0], [W, L], [cw, L - cl], [0, L]);
        break;
      case 'bottom-right':
      default:
        points.push([0, 0], [W, 0], [W, L - cl], [W - cw, L], [0, L]);
        break;
    }
    return points.flatMap(([x, y]) => scale(x, y));
  }

  if (layout === 't-shape') {
    // T: main rect + stem on one side. Stem centered, width cw, length cl.
    const stemW = Math.min(cw, W);
    const stemL = Math.min(cl, L * 0.8);
    const left = (W - stemW) / 2;
    const right = left + stemW;
    let points: [number, number][];
    switch (pos) {
      case 'top':
        points = [
          [left, 0],
          [right, 0],
          [right, stemL],
          [W, stemL],
          [W, L],
          [0, L],
          [0, stemL],
          [left, stemL],
        ];
        break;
      case 'bottom':
        points = [
          [0, 0],
          [W, 0],
          [W, L - stemL],
          [right, L - stemL],
          [right, L],
          [left, L],
          [left, L - stemL],
          [0, L - stemL],
        ];
        break;
      case 'left':
        points = [
          [stemL, 0],
          [W, 0],
          [W, L],
          [stemL, L],
          [stemL, (L + stemW) / 2],
          [0, (L + stemW) / 2],
          [0, (L - stemW) / 2],
          [stemL, (L - stemW) / 2],
        ];
        break;
      case 'right':
      default:
        points = [
          [0, 0],
          [W - stemL, 0],
          [W - stemL, (L - stemW) / 2],
          [W, (L - stemW) / 2],
          [W, (L + stemW) / 2],
          [W - stemL, (L + stemW) / 2],
          [W - stemL, L],
          [0, L],
        ];
        break;
    }
    return points.flatMap(([x, y]) => scale(x, y));
  }

  if (layout === 'u-shape') {
    // U: opening on one side. Opening width cw, depth cl. Opening centered.
    const openW = Math.min(cw, W - 1);
    const openL = Math.min(cl, L - 0.5);
    const start = (W - openW) / 2;
    const end = start + openW;
    let points: [number, number][];
    switch (pos) {
      case 'top':
        points = [
          [0, openL],
          [start, openL],
          [start, 0],
          [end, 0],
          [end, openL],
          [W, openL],
          [W, L],
          [0, L],
        ];
        break;
      case 'bottom':
        points = [
          [0, 0],
          [W, 0],
          [W, L - openL],
          [end, L - openL],
          [end, L],
          [start, L],
          [start, L - openL],
          [0, L - openL],
        ];
        break;
      case 'left':
        points = [
          [openL, 0],
          [W, 0],
          [W, L],
          [openL, L],
          [openL, (L + openW) / 2],
          [0, (L + openW) / 2],
          [0, (L - openW) / 2],
          [openL, (L - openW) / 2],
        ];
        break;
      case 'right':
      default:
        points = [
          [0, 0],
          [W - openL, 0],
          [W - openL, (L - openW) / 2],
          [W, (L - openW) / 2],
          [W, (L + openW) / 2],
          [W - openL, (L + openW) / 2],
          [W - openL, L],
          [0, L],
        ];
        break;
    }
    return points.flatMap(([x, y]) => scale(x, y));
  }

  return [0, 0, W * pixelsPerMeter, 0, W * pixelsPerMeter, L * pixelsPerMeter, 0, L * pixelsPerMeter];
}

/** Bounding box of the room floor in meters for 2D bounds. */
export function getRoomBounds(room: RoomConfig): { width: number; length: number } {
  const layout = room.layout ?? 'rectangle';
  const W = room.width;
  const L = room.length;
  if (layout === 'rectangle') return { width: W, length: L };
  if (layout === 't-shape') {
    const pos = room.cutoutPosition ?? 'right';
    const cl = room.cutoutLength ?? 2;
    if (pos === 'top' || pos === 'bottom') return { width: W, length: L + cl };
    return { width: W + cl, length: L };
  }
  return { width: W, length: L };
}

/** Returns floor outline as array of [x, z] in meters with origin at room center (for 3D). */
export function getFloorOutlinePoints3D(room: RoomConfig): [number, number][] {
  const W = room.width;
  const L = room.length;
  const layout = room.layout ?? 'rectangle';
  const toCentered = (x: number, y: number): [number, number] => [x - W / 2, y - L / 2];

  if (layout === 'rectangle') {
    return [
      toCentered(0, 0),
      toCentered(W, 0),
      toCentered(W, L),
      toCentered(0, L),
    ];
  }

  const cw = Math.min(room.cutoutWidth ?? 2, W - 1);
  const cl = Math.min(room.cutoutLength ?? 2, L - 1);
  const pos = room.cutoutPosition ?? 'bottom-right';

  if (layout === 'l-shape' || layout === 'l-mirror') {
    const points: [number, number][] = [];
    switch (pos) {
      case 'top-left':
        points.push([cw, 0], [W, 0], [W, L], [0, L], [0, cl], [cw, cl]);
        break;
      case 'top-right':
        points.push([0, 0], [W - cw, 0], [W - cw, cl], [W, cl], [W, L], [0, L]);
        break;
      case 'bottom-left':
        points.push([0, 0], [W, 0], [W, L], [cw, L], [cw, L - cl], [0, L - cl]);
        break;
      case 'bottom-right':
      default:
        points.push([0, 0], [W, 0], [W, L - cl], [W - cw, L - cl], [W - cw, L], [0, L]);
        break;
    }
    return points.map(([x, y]) => toCentered(x, y));
  }

  if (layout === 'angled-bay') {
    const points: [number, number][] = [];
    switch (pos) {
      case 'top-left':
        points.push([cw, 0], [W, 0], [W, L], [0, L], [0, cl]);
        break;
      case 'top-right':
        points.push([0, 0], [W - cw, 0], [W, cl], [W, L], [0, L]);
        break;
      case 'bottom-left':
        points.push([0, 0], [W, 0], [W, L], [cw, L - cl], [0, L]);
        break;
      case 'bottom-right':
      default:
        points.push([0, 0], [W, 0], [W, L - cl], [W - cw, L], [0, L]);
        break;
    }
    return points.map(([x, y]) => toCentered(x, y));
  }

  if (layout === 't-shape') {
    const stemW = Math.min(cw, W);
    const stemL = Math.min(cl, L * 0.8);
    const left = (W - stemW) / 2;
    const right = left + stemW;
    let points: [number, number][];
    switch (pos) {
      case 'top':
        points = [[left, 0], [right, 0], [right, stemL], [W, stemL], [W, L], [0, L], [0, stemL], [left, stemL]];
        break;
      case 'bottom':
        points = [[0, 0], [W, 0], [W, L - stemL], [right, L - stemL], [right, L], [left, L], [left, L - stemL], [0, L - stemL]];
        break;
      case 'left':
        points = [[stemL, 0], [W, 0], [W, L], [stemL, L], [stemL, (L + stemW) / 2], [0, (L + stemW) / 2], [0, (L - stemW) / 2], [stemL, (L - stemW) / 2]];
        break;
      default:
        points = [[0, 0], [W - stemL, 0], [W - stemL, (L - stemW) / 2], [W, (L - stemW) / 2], [W, (L + stemW) / 2], [W - stemL, (L + stemW) / 2], [W - stemL, L], [0, L]];
        break;
    }
    return points.map(([x, y]) => toCentered(x, y));
  }

  if (layout === 'u-shape') {
    const openW = Math.min(cw, W - 1);
    const openL = Math.min(cl, L - 0.5);
    const start = (W - openW) / 2;
    const end = start + openW;
    let points: [number, number][];
    switch (pos) {
      case 'top':
        points = [[0, openL], [start, openL], [start, 0], [end, 0], [end, openL], [W, openL], [W, L], [0, L]];
        break;
      case 'bottom':
        points = [[0, 0], [W, 0], [W, L - openL], [end, L - openL], [end, L], [start, L], [start, L - openL], [0, L - openL]];
        break;
      case 'left':
        points = [[openL, 0], [W, 0], [W, L], [openL, L], [openL, (L + openW) / 2], [0, (L + openW) / 2], [0, (L - openW) / 2], [openL, (L - openW) / 2]];
        break;
      default:
        points = [[0, 0], [W - openL, 0], [W - openL, (L - openW) / 2], [W, (L - openW) / 2], [W, (L + openW) / 2], [W - openL, (L + openW) / 2], [W - openL, L], [0, L]];
        break;
    }
    return points.map(([x, y]) => toCentered(x, y));
  }

  return [
    toCentered(0, 0),
    toCentered(W, 0),
    toCentered(W, L),
    toCentered(0, L),
  ];
}
