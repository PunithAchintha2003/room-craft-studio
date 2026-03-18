import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { RoomConfig, RoomOpening } from '../../types/design.types';
import { getFloorOutlinePoints3D } from '../../utils/roomShapeUtils';

interface Room3DProps {
  room: RoomConfig;
}

const WALL_THICKNESS = 0.15;
const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_DEPTH = 0.05;

// ── Texture loader (cached by URL) ────────────────────────────────────────────
const textureCache = new Map<string, THREE.Texture>();
const loadTexture = (url: string): THREE.Texture => {
  if (textureCache.has(url)) return textureCache.get(url)!;
  const tex = new THREE.TextureLoader().load(url);
  // These are color (albedo) textures, so they should be interpreted as sRGB.
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(url, tex);
  return tex;
};

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
    wallTexture: wallTextureUrl,
    floorTexture: floorTextureUrl,
    wallTextureScale = 1,
    floorTextureScale = 1,
    openings = [],
  } = room;

  const floorTexture = useMemo(
    () => (floorTextureUrl ? loadTexture(floorTextureUrl) : null),
    [floorTextureUrl]
  );
  const wallTexture = useMemo(
    () => (wallTextureUrl ? loadTexture(wallTextureUrl) : null),
    [wallTextureUrl]
  );

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
      const half = o.width / 2;
      const holeStart = Math.max(0, o.offset - half);
      const holeEnd = Math.min(wallLength, o.offset + half);
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
          {northWallOpenings.map((o, i) => (
            <mesh key={`north-frame-${i}`} position={[o.offset, o.bottom + o.height / 2, 0]}>
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
          {southWallOpenings.map((o, i) => (
            <mesh key={`south-frame-${i}`} position={[o.offset, o.bottom + o.height / 2, length]}>
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
          {westWallOpenings.map((o, i) => (
            <mesh key={`west-frame-${i}`} position={[0, o.bottom + o.height / 2, o.offset]} rotation={[0, Math.PI / 2, 0]}>
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
          {eastWallOpenings.map((o, i) => (
            <mesh key={`east-frame-${i}`} position={[width, o.bottom + o.height / 2, o.offset]} rotation={[0, -Math.PI / 2, 0]}>
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
        outlinePoints3D.map((pt, i) => {
          const next = outlinePoints3D[(i + 1) % outlinePoints3D.length];
          const x0 = pt[0];
          const z0 = pt[1];
          const x1 = next[0];
          const z1 = next[1];
          const dx = x1 - x0;
          const dz = z1 - z0;
          const len = Math.sqrt(dx * dx + dz * dz);
          if (len < 0.01) return null;
          const midX = (x0 + x1) / 2 + cx;
          const midZ = (z0 + z1) / 2 + cz;
          const angle = Math.atan2(dz, dx);
          return (
            <WallSegment
              key={`outline-${i}`}
              position={[midX, height / 2, midZ]}
              rotation={[0, -angle, 0]}
              width={len}
              height={height}
              wallColor={wallColor}
              wallTexture={wallTexture ?? undefined}
              wallTextureScale={wallTextureScale}
            />
          );
        })
      )}
    </group>
  );
};

export default Room3D;
