import React from 'react';
import * as THREE from 'three';
import { RoomConfig } from '../../types/design.types';

interface Room3DProps {
  room: RoomConfig;
}

export const Room3D: React.FC<Room3DProps> = ({ room }) => {
  const { width, length, height, wallColor, floorColor } = room;

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
    </group>
  );
};
