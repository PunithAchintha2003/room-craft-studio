import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { RoomConfig, RoomOpening } from '../../types/design.types';
import { getFloorOutlinePoints3D } from '../../utils/roomShapeUtils';
import { getRoomTextureUrl } from '../../utils/roomTexturePresets';

interface Room3DProps {
  room: RoomConfig;
}

const WALL_THICKNESS = 0.15;
const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_DEPTH = 0.05;

// ── Texture loader (cached by URL, async with error handling) ────────────────
const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

function loadTextureAsync(
  url: string
): Promise<THREE.Texture> {
  const cached = textureCache.get(url);
  if (cached) return Promise.resolve(cached.clone());
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

// ── Wall segment helper ───────────────────────────────────────────────────────
interface WallSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  wallColor: string;
  wallTexture?: THREE.Texture;
  wallTextureScale: number;
}

const WallSegment: React.FC<WallSegmentProps> = ({
  position,
  rotation = [0, 0, 0],
  width,
  height,
  wallColor,
  wallTexture,
  wallTextureScale,
}) => {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: wallTexture ? '#ffffff' : wallColor,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    if (wallTexture) {
      const tex = wallTexture.clone();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(width * wallTextureScale, height * wallTextureScale);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
      mat.map = tex;
    }
    return mat;
  }, [wallColor, wallTexture, width, height, wallTextureScale]);

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[width, height, WALL_THICKNESS]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

// ── Baseboard helper ──────────────────────────────────────────────────────────
const Baseboard: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
  wallColor: string;
}> = ({ position, rotation = [0, 0, 0], length, wallColor }) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[length, BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
    <meshStandardMaterial color={wallColor} roughness={0.6} metalness={0.05} />
  </mesh>
);

// ── Main Room3D component ─────────────────────────────────────────────────────
export const Room3D: React.FC<Room3DProps> = ({ room }) => {
  const showCeiling = useSelector((state: RootState) => state.editor.showCeiling);

  const {
    width,
    length,
    height,
    wallColor,
    floorColor,
    layout = 'rectangle',
    wallTexture: wallTextureValue,
    floorTexture: floorTextureValue,
    wallTextureScale = 1,
    floorTextureScale = 1,
    openings = [],
  } = room;

  const resolvedWallUrl = getRoomTextureUrl(wallTextureValue, 'wall');
  const resolvedFloorUrl = getRoomTextureUrl(floorTextureValue, 'floor');

  const [wallTexture, setWallTexture] = useState<THREE.Texture | null>(null);
  const [floorTexture, setFloorTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!resolvedWallUrl) {
      setWallTexture(null);
      return;
    }
    let cancelled = false;
    loadTextureAsync(resolvedWallUrl)
      .then((tex) => {
        if (!cancelled) setWallTexture(tex);
      })
      .catch(() => {
        if (!cancelled) setWallTexture(null);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedWallUrl]);

  useEffect(() => {
    if (!resolvedFloorUrl) {
      setFloorTexture(null);
      return;
    }
    let cancelled = false;
    loadTextureAsync(resolvedFloorUrl)
      .then((tex) => {
        if (!cancelled) setFloorTexture(tex);
      })
      .catch(() => {
        if (!cancelled) setFloorTexture(null);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedFloorUrl]);

  const floorMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: floorTexture ? '#ffffff' : floorColor,
      roughness: 0.35,
      metalness: 0.08,
    });
    if (floorTexture) {
      const tex = floorTexture.clone();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(width * floorTextureScale, length * floorTextureScale);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
      mat.map = tex;
    }
    return mat;
  }, [floorColor, floorTexture, width, length, floorTextureScale]);

  // Compute wall segments with openings carved out
  const buildWallSegments = (
    wallLength: number,
    wallOpenings: RoomOpening[]
  ): Array<{ start: number; end: number }> => {
    if (!wallOpenings.length) return [{ start: 0, end: wallLength }];
    const sorted = [...wallOpenings].sort((a, b) => a.offset - b.offset);
    const segs: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    sorted.forEach(o => {
      // Offset is measured from the "left" corner to the START (left edge) of the opening.
      // Carve out [offset, offset + width].
      const holeStart = Math.max(0, Math.min(wallLength, o.offset));
      const holeEnd = Math.max(0, Math.min(wallLength, o.offset + o.width));
      if (holeStart > cursor) segs.push({ start: cursor, end: holeStart });
      cursor = Math.max(cursor, holeEnd);
    });
    if (cursor < wallLength) segs.push({ start: cursor, end: wallLength });
    return segs;
  };

  // ── North wall (z = -length/2) ────────────────────────────────────────────
  const northWallOpenings = openings.filter(o => o.wall === 'north');
  const northSegments = buildWallSegments(width, northWallOpenings);

  // ── South wall (z = +length/2) ────────────────────────────────────────────
  const southWallOpenings = openings.filter(o => o.wall === 'south');
  const southSegments = buildWallSegments(width, southWallOpenings);

  // ── West wall (x = -width/2) ──────────────────────────────────────────────
  const westWallOpenings = openings.filter(o => o.wall === 'west');
  const westSegments = buildWallSegments(length, westWallOpenings);

  // ── East wall (x = +width/2) ──────────────────────────────────────────────
  const eastWallOpenings = openings.filter(o => o.wall === 'east');
  const eastSegments = buildWallSegments(length, eastWallOpenings);

  // Center the room at origin (group position so that room center is at world origin)
  const cx = width / 2;
  const cz = length / 2;

  const isRect = layout === 'rectangle';
  const outlinePoints3D = useMemo(() => getFloorOutlinePoints3D(room), [room.layout, room.width, room.length, room.cutoutPosition, room.cutoutWidth, room.cutoutLength]);

  const floorGeometry = useMemo(() => {
    if (isRect) return null;
    const shape = new THREE.Shape();
    const pts = outlinePoints3D;
    if (pts.length > 0) {
      shape.moveTo(pts[0][0], -pts[0][1]);
      for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], -pts[i][1]);
      shape.lineTo(pts[0][0], -pts[0][1]);
    }
    return new THREE.ShapeGeometry(shape);
  }, [isRect, outlinePoints3D]);

  return (
    <group position={[-cx, 0, -cz]}>
      {/* ── Floor ── */}
      {isRect ? (
        <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, length]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      ) : (
        floorGeometry && (
          <mesh
            position={[cx, 0, cz]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <primitive object={floorGeometry} attach="geometry" />
            <primitive object={floorMaterial} attach="material" />
          </mesh>
        )
      )}

      {/* ── Ceiling (toggled) ── */}
      {showCeiling && (
        isRect ? (
          <mesh position={[cx, height, cz]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, length]} />
            <meshStandardMaterial color="#FAFAFA" roughness={0.95} metalness={0} />
          </mesh>
        ) : (
          floorGeometry && (
            <mesh position={[cx, height, cz]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
              <primitive object={floorGeometry.clone()} attach="geometry" />
              <meshStandardMaterial color="#FAFAFA" roughness={0.95} metalness={0} />
            </mesh>
          )
        )
      )}

      {/* ── Walls: either outline segments (non-rect) or four sides with openings ── */}
      {isRect ? (
        <>
          {northSegments.map((seg, i) => {
            const segW = seg.end - seg.start;
            return (
              <WallSegment
                key={`north-${i}`}
                position={[seg.start + segW / 2, height / 2, 0]}
                width={segW}
                height={height}
                wallColor={wallColor}
                wallTexture={wallTexture ?? undefined}
                wallTextureScale={wallTextureScale}
              />
            );
          })}
          {northWallOpenings.map((o) => (
            <mesh
              key={`north-frame-${o.id}`}
              position={[o.offset + o.width / 2, o.bottom + o.height / 2, 0]}
            >
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'} roughness={0.7} metalness={0.1} />
            </mesh>
          ))}
          {southSegments.map((seg, i) => {
            const segW = seg.end - seg.start;
            return (
              <WallSegment
                key={`south-${i}`}
                position={[seg.start + segW / 2, height / 2, length]}
                rotation={[0, Math.PI, 0]}
                width={segW}
                height={height}
                wallColor={wallColor}
                wallTexture={wallTexture ?? undefined}
                wallTextureScale={wallTextureScale}
              />
            );
          })}
          {southWallOpenings.map((o) => (
            <mesh
              key={`south-frame-${o.id}`}
              position={[o.offset + o.width / 2, o.bottom + o.height / 2, length]}
            >
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'} roughness={0.7} metalness={0.1} />
            </mesh>
          ))}
          {westSegments.map((seg, i) => {
            const segL = seg.end - seg.start;
            return (
              <WallSegment
                key={`west-${i}`}
                position={[0, height / 2, seg.start + segL / 2]}
                rotation={[0, Math.PI / 2, 0]}
                width={segL}
                height={height}
                wallColor={wallColor}
                wallTexture={wallTexture ?? undefined}
                wallTextureScale={wallTextureScale}
              />
            );
          })}
          {westWallOpenings.map((o) => (
            <mesh
              key={`west-frame-${o.id}`}
              position={[0, o.bottom + o.height / 2, o.offset + o.width / 2]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'} roughness={0.7} metalness={0.1} />
            </mesh>
          ))}
          {eastSegments.map((seg, i) => {
            const segL = seg.end - seg.start;
            return (
              <WallSegment
                key={`east-${i}`}
                position={[width, height / 2, seg.start + segL / 2]}
                rotation={[0, -Math.PI / 2, 0]}
                width={segL}
                height={height}
                wallColor={wallColor}
                wallTexture={wallTexture ?? undefined}
                wallTextureScale={wallTextureScale}
              />
            );
          })}
          {eastWallOpenings.map((o) => (
            <mesh
              key={`east-frame-${o.id}`}
              position={[width, o.bottom + o.height / 2, o.offset + o.width / 2]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'} roughness={0.7} metalness={0.1} />
            </mesh>
          ))}
          <Baseboard position={[cx, BASEBOARD_HEIGHT / 2, BASEBOARD_DEPTH / 2]} length={width} wallColor={wallColor} />
          <Baseboard position={[cx, BASEBOARD_HEIGHT / 2, length - BASEBOARD_DEPTH / 2]} rotation={[0, Math.PI, 0]} length={width} wallColor={wallColor} />
          <Baseboard position={[BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, cz]} rotation={[0, Math.PI / 2, 0]} length={length} wallColor={wallColor} />
          <Baseboard position={[width - BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, cz]} rotation={[0, -Math.PI / 2, 0]} length={length} wallColor={wallColor} />
        </>
      ) : (
        (() => {
          // For non-rectangle layouts, we derive which outline edges belong to
          // north/south/east/west, then carve openings into those edges.
          const EPS = 1e-4;
          const northZ = -length / 2;
          const southZ = length / 2;
          const westX = -width / 2;
          const eastX = width / 2;

          type WallSide = RoomOpening['wall'];
          type Interval = { start: number; end: number }; // axis coordinate in centered space
          type Edge = {
            i: number;
            x0: number;
            z0: number;
            x1: number;
            z1: number;
            len: number;
            angle: number;
            wall?: WallSide;
            axisStart?: number;
            axisEnd?: number;
          };

          const edges: Edge[] = outlinePoints3D.map((pt, i) => {
            const next = outlinePoints3D[(i + 1) % outlinePoints3D.length];
            const x0 = pt[0];
            const z0 = pt[1];
            const x1 = next[0];
            const z1 = next[1];
            const dx = x1 - x0;
            const dz = z1 - z0;
            const len = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);

            // Determine which "cardinal" wall this edge lies on (only if axis-aligned).
            let wall: WallSide | undefined;
            let axisStart: number | undefined;
            let axisEnd: number | undefined;

            if (Math.abs(dz) < EPS) {
              // Horizontal edge (along +x): z is constant
              if (Math.abs(z0 - northZ) < EPS) wall = 'north';
              else if (Math.abs(z0 - southZ) < EPS) wall = 'south';
              if (wall) {
                axisStart = Math.min(x0, x1);
                axisEnd = Math.max(x0, x1);
              }
            } else if (Math.abs(dx) < EPS) {
              // Vertical edge (along +z): x is constant
              if (Math.abs(x0 - westX) < EPS) wall = 'west';
              else if (Math.abs(x0 - eastX) < EPS) wall = 'east';
              if (wall) {
                axisStart = Math.min(z0, z1);
                axisEnd = Math.max(z0, z1);
              }
            }

            return { i, x0, z0, x1, z1, len, angle, wall, axisStart, axisEnd };
          });

          const sideEdgeIntervals = (side: WallSide): Interval[] =>
            edges
              .filter((e) => e.wall === side && e.axisStart !== undefined && e.axisEnd !== undefined && e.len > 0.01)
              .map((e) => ({ start: e.axisStart!, end: e.axisEnd! }));

          const openingIntervalCentered = (o: RoomOpening): Interval => {
            if (o.wall === 'north' || o.wall === 'south') {
              const start = o.offset - width / 2;
              return { start, end: start + o.width };
            }
            const start = o.offset - length / 2;
            return { start, end: start + o.width };
          };

          const openingOverlapsWall = (o: RoomOpening): boolean => {
            const hole = openingIntervalCentered(o);
            const ints = sideEdgeIntervals(o.wall);
            return ints.some((seg) => Math.max(seg.start, hole.start) < Math.min(seg.end, hole.end));
          };

          const openingsOnWall = (side: WallSide) =>
            openings.filter((o) => o.wall === side && openingOverlapsWall(o));

          const buildEdgeSegments = (edge: Interval, wallOpenings: RoomOpening[], axisMax: number): Interval[] => {
            const holeInts = wallOpenings
              .map(openingIntervalCentered)
              .map((h) => ({
                start: Math.max(edge.start, Math.min(axisMax, h.start)),
                end: Math.min(edge.end, Math.max(-axisMax, h.end)),
              }))
              .filter((h) => h.end - h.start > 1e-5)
              .sort((a, b) => a.start - b.start);

            if (!holeInts.length) return [edge];
            const segs: Interval[] = [];
            let cursor = edge.start;
            for (const h of holeInts) {
              if (h.start > cursor) segs.push({ start: cursor, end: h.start });
              cursor = Math.max(cursor, h.end);
            }
            if (cursor < edge.end) segs.push({ start: cursor, end: edge.end });
            return segs.filter((s) => s.end - s.start > 0.01);
          };

          const renderEdge = (e: Edge) => {
            if (e.len < 0.01) return null;

            // Non-cardinal/diagonal edges: render as-is (no openings).
            if (!e.wall || e.axisStart === undefined || e.axisEnd === undefined) {
              const midX = (e.x0 + e.x1) / 2 + cx;
              const midZ = (e.z0 + e.z1) / 2 + cz;
              return (
                <WallSegment
                  key={`outline-${e.i}`}
                  position={[midX, height / 2, midZ]}
                  rotation={[0, -e.angle, 0]}
                  width={e.len}
                  height={height}
                  wallColor={wallColor}
                  wallTexture={wallTexture ?? undefined}
                  wallTextureScale={wallTextureScale}
                />
              );
            }

            // Cardinal edge: carve openings that land on this wall.
            const edgeInterval: Interval = { start: e.axisStart, end: e.axisEnd };
            const axisMax = e.wall === 'north' || e.wall === 'south' ? width / 2 : length / 2;
            const segs = buildEdgeSegments(edgeInterval, openingsOnWall(e.wall), axisMax);

            return segs.map((s, idx) => {
              const segLen = s.end - s.start;
              const segMid = (s.start + s.end) / 2;
              const midX = (e.wall === 'north' || e.wall === 'south') ? segMid : e.x0;
              const midZ = (e.wall === 'west' || e.wall === 'east') ? segMid : e.z0;
              return (
                <WallSegment
                  key={`outline-${e.i}-seg-${idx}`}
                  position={[midX + cx, height / 2, midZ + cz]}
                  rotation={[0, -e.angle, 0]}
                  width={segLen}
                  height={height}
                  wallColor={wallColor}
                  wallTexture={wallTexture ?? undefined}
                  wallTextureScale={wallTextureScale}
                />
              );
            });
          };

          const renderFrames = () => {
            const valid = openings.filter(openingOverlapsWall);
            return valid.map((o) => {
              const y = o.bottom + o.height / 2;
              const material = (
                <meshStandardMaterial
                  color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
                  roughness={0.7}
                  metalness={0.1}
                  transparent={o.type === 'window'}
                  opacity={o.type === 'window' ? 0.75 : 1}
                />
              );

              if (o.wall === 'north') {
                const x = o.offset + o.width / 2;
                return (
                  <mesh key={`frame-${o.id}`} position={[x, y, 0]}>
                    <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
                    {material}
                  </mesh>
                );
              }
              if (o.wall === 'south') {
                const x = o.offset + o.width / 2;
                return (
                  <mesh key={`frame-${o.id}`} position={[x, y, length]}>
                    <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
                    {material}
                  </mesh>
                );
              }
              if (o.wall === 'west') {
                const z = o.offset + o.width / 2;
                return (
                  <mesh key={`frame-${o.id}`} position={[0, y, z]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
                    {material}
                  </mesh>
                );
              }
              // east
              const z = o.offset + o.width / 2;
              return (
                <mesh key={`frame-${o.id}`} position={[width, y, z]} rotation={[0, -Math.PI / 2, 0]}>
                  <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
                  {material}
                </mesh>
              );
            });
          };

          return (
            <>
              {edges.map(renderEdge)}
              {renderFrames()}
            </>
          );
        })()
      )}
    </group>
  );
};

export default Room3D;
