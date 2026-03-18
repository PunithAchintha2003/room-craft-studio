import React, { useMemo, Suspense } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureItem, Furniture } from '../../types/design.types';
import { CircularProgress, Box, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { resolveFurnitureModelUrl } from '@/utils/furnitureModels';

interface FurnitureModel3DProps {
  furnitureItem: FurnitureItem;
  furniture: Furniture;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  onLoadStart?: (id: string) => void;
  onLoadComplete?: (id: string) => void;
  onLoadError?: (id: string, error: string) => void;
}

// ── Fallback box (shown when GLB fails to load) ───────────────────────────────
const FallbackBox: React.FC<{
  furniture: Furniture;
  furnitureItem: FurnitureItem;
  isSelected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void;
}> = ({ furniture, furnitureItem, isSelected, onClick }) => {
  const { width, height, length } = furniture.dimensions;
  const color = furnitureItem.color || furniture.defaultColor;

  return (
    <group
      position={[0, height / 2, 0]}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width * 0.92, height * 0.92, length * 0.92]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Legs (for chair/table-like items) */}
      {(furniture.category === 'chair' || furniture.category === 'table') &&
        [
          [-width / 2 + 0.05, -height / 2 + 0.15, -length / 2 + 0.05],
          [width / 2 - 0.05, -height / 2 + 0.15, -length / 2 + 0.05],
          [-width / 2 + 0.05, -height / 2 + 0.15, length / 2 - 0.05],
          [width / 2 - 0.05, -height / 2 + 0.15, length / 2 - 0.05],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, height * 0.3, 8]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
          </mesh>
        ))}

      {/* Selection wireframe */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry
            args={[new THREE.BoxGeometry(width * 1.05, height * 1.05, length * 1.05)]}
          />
          <lineBasicMaterial color="#2196F3" />
        </lineSegments>
      )}
    </group>
  );
};

// ── Loading spinner ───────────────────────────────────────────────────────────
const LoadingSpinner: React.FC = () => (
  <Html center>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'rgba(255,255,255,0.9)',
        px: 1.5,
        py: 1,
        borderRadius: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <CircularProgress size={20} thickness={4} />
      <Typography variant="caption" sx={{ mt: 0.5, fontSize: 10, color: 'text.secondary' }}>
        Loading…
      </Typography>
    </Box>
  </Html>
);

// ── Actual GLB model ──────────────────────────────────────────────────────────
const Model3D: React.FC<{
  url: string;
  furnitureItem: FurnitureItem;
  furniture: Furniture;
  isSelected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void;
  onLoadComplete?: () => void;
}> = ({ url, furnitureItem, furniture, isSelected, onClick, onLoadComplete }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gltf = useGLTF(url) as any;
  const scene = gltf.scene;

  React.useEffect(() => {
    if (scene && onLoadComplete) onLoadComplete();
  }, [scene, onLoadComplete]);

  const { width, height, length } = furniture.dimensions;

  const processedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);

    // Compute bounding box to auto-scale model to fit furniture dimensions
    const bbox = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const scaleX = size.x > 0 ? width / size.x : 1;
    const scaleY = size.y > 0 ? height / size.y : 1;
    const scaleZ = size.z > 0 ? length / size.z : 1;
    const uniformScale = Math.min(scaleX, scaleY, scaleZ);

    cloned.scale.setScalar(uniformScale);

    // Re-center after scaling
    const bbox2 = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    bbox2.getCenter(center);
    cloned.position.sub(center);
    cloned.position.y += bbox2.getSize(new THREE.Vector3()).y / 2;

    // Apply optional tint ONLY when the mesh isn't textured.
    // Textured glTF materials carry their "real" colors in baseColor textures (map),
    // so overriding .color would wash them out.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;

      const tint = furnitureItem.color;
      if (!tint || !furniture.isColorizable) return;

      const applyTint = (mat: any) => {
        if (!mat) return mat;
        if (mat.map) return mat; // keep authored/texture color
        const clonedMat = mat.clone();
        if (clonedMat.color) clonedMat.color = new THREE.Color(tint);
        clonedMat.needsUpdate = true;
        return clonedMat;
      };

      if (Array.isArray(child.material)) {
        child.material = child.material.map(applyTint);
      } else {
        child.material = applyTint(child.material);
      }
    });

    return cloned;
  }, [scene, furnitureItem.color, furniture.isColorizable, width, height, length]);

  if (!processedScene) return null;

  return (
    <group onClick={onClick}>
      <primitive object={processedScene} />

      {/* Selection highlight — animated pulsing outline */}
      {isSelected && (
        <>
          <mesh>
            <boxGeometry args={[width * 1.08, height * 1.08, length * 1.08]} />
            <meshBasicMaterial
              color="#2196F3"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
          {/* Bottom selection ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[Math.max(width, length) * 0.52, Math.max(width, length) * 0.58, 32]} />
            <meshBasicMaterial color="#2196F3" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
};

// ── Main exported component ───────────────────────────────────────────────────
export const FurnitureModel3D: React.FC<FurnitureModel3DProps> = ({
  furnitureItem,
  furniture,
  isSelected = false,
  onClick,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}) => {
  React.useEffect(() => {
    onLoadStart?.(furnitureItem.id);
  }, [furnitureItem.id, onLoadStart]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.(furnitureItem.id);
  };

  const handleLoadComplete = () => onLoadComplete?.(furnitureItem.id);
  const handleError = (error: Error) => {
    console.warn(`3D model load failed for ${furniture.name}:`, error.message);
    onLoadError?.(furnitureItem.id, error.message ?? 'Failed to load model');
  };

  const resolvedUrl = resolveFurnitureModelUrl(furniture.model3D.url, furniture.category);

  return (
    <ErrorBoundary
      fallback={
        <FallbackBox
          furniture={furniture}
          furnitureItem={furnitureItem}
          isSelected={isSelected}
          onClick={handleClick}
        />
      }
      onError={(error: unknown) => {
        if (error instanceof Error) handleError(error);
      }}
      resetKeys={[resolvedUrl]}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Model3D
          url={resolvedUrl}
          furnitureItem={furnitureItem}
          furniture={furniture}
          isSelected={isSelected}
          onClick={handleClick}
          onLoadComplete={handleLoadComplete}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

