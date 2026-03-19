import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { RoomConfig, RoomOpening } from '@/types/design.types';
import { getFloorOutlinePoints3D } from '@/utils/roomShapeUtils';
import { getRoomTextureUrl } from '@/utils/roomTexturePresets';

interface Room3DProps {
  room: RoomConfig;
}

const WALL_THICKNESS = 0.15;
const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_DEPTH = 0.05;

const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

function loadTextureAsync(url: string): Promise<THREE.Texture> {
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

  const buildWallSegments = (wallLength: number, wallOpenings: RoomOpening[]): Array<{ start: number; end: number }> => {
    if (!wallOpenings.length) return [{ start: 0, end: wallLength }];
    const sorted = [...wallOpenings].sort((a, b) => a.offset - b.offset);
    const segs: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    sorted.forEach((o) => {
      const holeStart = Math.max(0, Math.min(wallLength, o.offset));
      const holeEnd = Math.max(0, Math.min(wallLength, o.offset + o.width));
      if (holeStart > cursor) segs.push({ start: cursor, end: holeStart });
      cursor = Math.max(cursor, holeEnd);
    });
    if (cursor < wallLength) segs.push({ start: cursor, end: wallLength });
    return segs;
  };

  const northWallOpenings = openings.filter((o) => o.wall === 'north');
  const northSegments = buildWallSegments(width, northWallOpenings);
  const southWallOpenings = openings.filter((o) => o.wall === 'south');
  const southSegments = buildWallSegments(width, southWallOpenings);
  const westWallOpenings = openings.filter((o) => o.wall === 'west');
  const westSegments = buildWallSegments(length, westWallOpenings);
  const eastWallOpenings = openings.filter((o) => o.wall === 'east');
  const eastSegments = buildWallSegments(length, eastWallOpenings);

  const cx = width / 2;
  const cz = length / 2;

  const isRect = layout === 'rectangle';
  const outlinePoints3D = useMemo(() => getFloorOutlinePoints3D(room), [
    room.layout,
    room.width,
    room.length,
    room.cutoutPosition,
    room.cutoutWidth,
    room.cutoutLength,
  ]);

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
      {isRect ? (
        <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, length]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      ) : (
        floorGeometry && (
          <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <primitive object={floorGeometry} attach="geometry" />
            <primitive object={floorMaterial} attach="material" />
          </mesh>
        )
      )}

      {showCeiling &&
        (isRect ? (
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
        ))}

      {isRect && (
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
            <mesh key={`north-frame-${o.id}`} position={[o.offset + o.width / 2, o.bottom + o.height / 2, 0]}>
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial
                color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
                roughness={0.7}
                metalness={0.1}
                transparent={o.type === 'window'}
                opacity={o.type === 'window' ? 0.75 : 1}
              />
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
            <mesh key={`south-frame-${o.id}`} position={[o.offset + o.width / 2, o.bottom + o.height / 2, length]}>
              <boxGeometry args={[o.width, o.height, WALL_THICKNESS * 1.2]} />
              <meshStandardMaterial
                color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
                roughness={0.7}
                metalness={0.1}
                transparent={o.type === 'window'}
                opacity={o.type === 'window' ? 0.75 : 1}
              />
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
              <meshStandardMaterial
                color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
                roughness={0.7}
                metalness={0.1}
                transparent={o.type === 'window'}
                opacity={o.type === 'window' ? 0.75 : 1}
              />
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
              <meshStandardMaterial
                color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
                roughness={0.7}
                metalness={0.1}
                transparent={o.type === 'window'}
                opacity={o.type === 'window' ? 0.75 : 1}
              />
            </mesh>
          ))}

          <Baseboard position={[cx, BASEBOARD_HEIGHT / 2, BASEBOARD_DEPTH / 2]} length={width} wallColor={wallColor} />
          <Baseboard position={[cx, BASEBOARD_HEIGHT / 2, length - BASEBOARD_DEPTH / 2]} rotation={[0, Math.PI, 0]} length={width} wallColor={wallColor} />
          <Baseboard position={[BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, cz]} rotation={[0, Math.PI / 2, 0]} length={length} wallColor={wallColor} />
          <Baseboard position={[width - BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, cz]} rotation={[0, -Math.PI / 2, 0]} length={length} wallColor={wallColor} />
        </>
      )}
    </group>
  );
};

export default Room3D;
