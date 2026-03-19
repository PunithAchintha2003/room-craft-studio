import React, { useRef, useMemo, Suspense } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureItem, Furniture } from '../../types/design.types';
import { CircularProgress, Box, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';

interface FurnitureModel3DProps {
  furnitureItem: FurnitureItem;
  furniture: Furniture;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  onLoadStart?: (id: string) => void;
  onLoadComplete?: (id: string) => void;
  onLoadError?: (id: string, error: string) => void;
}

const FallbackBox: React.FC<{
  furniture: Furniture;
  furnitureItem: FurnitureItem;
  isSelected: boolean;
  onClick?: () => void;
}> = ({ furniture, furnitureItem, isSelected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const positionY = furniture.dimensions.height / 2;
  const w = furniture.dimensions.width * furnitureItem.scale;
  const l = furniture.dimensions.length * furnitureItem.scale;
  const centerX = furnitureItem.position.x + w / 2;
  const centerZ = furnitureItem.position.y + l / 2;

  return (
    <group
      ref={groupRef}
      position={[centerX, positionY, centerZ]}
      rotation={[0, (furnitureItem.rotation * Math.PI) / 180, 0]}
      scale={[furnitureItem.scale, furnitureItem.scale, furnitureItem.scale]}
      onClick={onClick}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={[
            furniture.dimensions.width * 0.9,
            furniture.dimensions.height * 0.9,
            furniture.dimensions.length * 0.9,
          ]}
        />
        <meshStandardMaterial
          color={furnitureItem.color || furniture.defaultColor}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      {isSelected && (
        <lineSegments>
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                furniture.dimensions.width,
                furniture.dimensions.height,
                furniture.dimensions.length
              ),
            ]}
          />
          <lineBasicMaterial color="#00ff00" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

const LoadingFallback: React.FC<{
  furnitureItem: FurnitureItem;
  furniture: Furniture;
}> = ({ furnitureItem, furniture }) => {
  const w = furniture.dimensions.width * furnitureItem.scale;
  const l = furniture.dimensions.length * furnitureItem.scale;
  const centerX = furnitureItem.position.x + w / 2;
  const centerZ = furnitureItem.position.y + l / 2;
  return (
  <group
    position={[centerX, 0, centerZ]}
    rotation={[0, (furnitureItem.rotation * Math.PI) / 180, 0]}
  >
    <Html center>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 1,
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="caption" sx={{ mt: 0.5 }}>
          Loading...
        </Typography>
      </Box>
    </Html>
  </group>
  );
};

const Model3D: React.FC<{
  url: string;
  furnitureItem: FurnitureItem;
  furniture: Furniture;
  isSelected: boolean;
  onClick?: () => void;
  onLoadComplete?: () => void;
}> = ({ url, furnitureItem, furniture, isSelected, onClick, onLoadComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  let scene;
  try {
    const gltf = useGLTF(url) as any;
    scene = gltf.scene;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }

  React.useEffect(() => {
    if (scene && onLoadComplete) {
      onLoadComplete();
    }
  }, [scene, onLoadComplete]);

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone();

    // Apply optional tint ONLY when the mesh isn't textured.
    // Textured glTF materials carry their "real" colors in baseColor textures (map),
    // so overriding .color would wash them out.
    if (furnitureItem.color && furniture.isColorizable) {
      const tint = furnitureItem.color;
      cloned.traverse((child: any) => {
        if (!child.isMesh) return;

        const applyTint = (mat: any) => {
          if (!mat) return mat;
          if (mat.map) return mat;
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
    }

    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return cloned;
  }, [scene, furnitureItem.color]);

  if (!clonedScene) return null;

  const positionY = furniture.dimensions.height / 2;
  const w = furniture.dimensions.width * furnitureItem.scale;
  const l = furniture.dimensions.length * furnitureItem.scale;
  const centerX = furnitureItem.position.x + w / 2;
  const centerZ = furnitureItem.position.y + l / 2;

  return (
    <group
      ref={groupRef}
      position={[centerX, 0, centerZ]}
      rotation={[0, (furnitureItem.rotation * Math.PI) / 180, 0]}
      scale={[furnitureItem.scale, furnitureItem.scale, furnitureItem.scale]}
      onClick={onClick}
    >
      <primitive object={clonedScene} />
      
      {isSelected && (
        <mesh position={[0, positionY, 0]}>
          <boxGeometry
            args={[
              furniture.dimensions.width * 1.1,
              furniture.dimensions.height * 1.1,
              furniture.dimensions.length * 1.1,
            ]}
          />
          <meshBasicMaterial
            color="#00ff00"
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

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
    if (onLoadStart) {
      onLoadStart(furnitureItem.id);
    }
  }, [furnitureItem.id, onLoadStart]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) {
      onClick(furnitureItem.id);
    }
  };

  const handleLoadComplete = () => {
    if (onLoadComplete) {
      onLoadComplete(furnitureItem.id);
    }
  };

  const handleError = (error: Error) => {
    console.warn(`Failed to load 3D model for ${furniture.name}:`, error.message);
    if (onLoadError) {
      onLoadError(furnitureItem.id, error.message || 'Failed to load model');
    }
  };

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
      onError={handleError}
      resetKeys={[furniture.model3D.url]}
    >
      <Suspense fallback={<LoadingFallback furnitureItem={furnitureItem} furniture={furniture} />}>
        <Model3D
          url={furniture.model3D.url}
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

export const preloadFurnitureModel = (url: string) => {
  useGLTF.preload(url);
};
