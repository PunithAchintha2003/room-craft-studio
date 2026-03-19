import React from 'react';
import * as THREE from 'three';
import { RoomConfig, RoomOpening } from '../../types/design.types';

interface Room3DProps {
  room: RoomConfig;
}

export const Room3D: React.FC<Room3DProps> = ({ room }) => {
  const { width, length, height, wallColor, floorColor, openings = [] } = room;
  const WALL_THICKNESS = 0.15;
  const FRAME_DEPTH = WALL_THICKNESS * 1.2;
  const FRAME_OFFSET = WALL_THICKNESS * 0.5 + 0.002; // slightly in front of wall to avoid z-fighting

  const clampOpening = (o: RoomOpening): RoomOpening => {
    const wallLen = o.wall === 'north' || o.wall === 'south' ? width : length;
    const safeWidth = Math.max(0.1, Math.min(o.width, wallLen));
    const safeHeight = Math.max(0.1, Math.min(o.height, height));
    const safeBottom = Math.max(0, Math.min(o.bottom, Math.max(0, height - safeHeight)));
    const safeOffset = Math.max(0, Math.min(o.offset, Math.max(0, wallLen - safeWidth)));
    return { ...o, width: safeWidth, height: safeHeight, bottom: safeBottom, offset: safeOffset };
  };

  const renderOpeningFrame = (o0: RoomOpening) => {
    const o = clampOpening(o0);
    const y = o.bottom + o.height / 2;
    const mat = (
      <meshStandardMaterial
        color={o.type === 'door' ? '#6D4C41' : '#B3E5FC'}
        roughness={0.7}
        metalness={0.1}
        transparent={o.type === 'window'}
        opacity={o.type === 'window' ? 0.75 : 1}
        side={THREE.DoubleSide}
      />
    );

    if (o.wall === 'north') {
      const x = -width / 2 + o.offset + o.width / 2;
      const z = -length / 2 - FRAME_OFFSET;
      return (
        <mesh key={o.id} position={[x, y, z]}>
          <boxGeometry args={[o.width, o.height, FRAME_DEPTH]} />
          {mat}
        </mesh>
      );
    }
    if (o.wall === 'south') {
      const x = -width / 2 + o.offset + o.width / 2;
      const z = length / 2 + FRAME_OFFSET;
      return (
        <mesh key={o.id} position={[x, y, z]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[o.width, o.height, FRAME_DEPTH]} />
          {mat}
        </mesh>
      );
    }
    if (o.wall === 'west') {
      const z = -length / 2 + o.offset + o.width / 2;
      const x = -width / 2 - FRAME_OFFSET;
      return (
        <mesh key={o.id} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[o.width, o.height, FRAME_DEPTH]} />
          {mat}
        </mesh>
      );
    }
    // east
    const z = -length / 2 + o.offset + o.width / 2;
    const x = width / 2 + FRAME_OFFSET;
    return (
      <mesh key={o.id} position={[x, y, z]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[o.width, o.height, FRAME_DEPTH]} />
        {mat}
      </mesh>
    );
  };

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Back Wall (along length, at -width/2) */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Front Wall (along length, at +width/2) */}
      <mesh
        position={[width / 2, height / 2, 0]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Left Wall (along width, at -length/2) */}
      <mesh
        position={[0, height / 2, -length / 2]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Wall (along width, at +length/2) */}
      <mesh
        position={[0, height / 2, length / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Door/Window frames */}
      {openings.map(renderOpeningFrame)}
    </group>
  );
};
