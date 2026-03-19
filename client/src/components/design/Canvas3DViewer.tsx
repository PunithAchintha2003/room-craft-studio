import React, { Suspense, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Design, Furniture } from '../../types/design.types';
import { Room3D } from './Room3D';
import { FurnitureModel3D } from './FurnitureModel3D';

interface Canvas3DViewerProps {
  design: Design;
  furniture: Furniture[];
  width?: number | string;
  height?: number | string;
  enableControls?: boolean;
  showStats?: boolean;
  showRoom?: boolean;
  onFurnitureClick?: (id: string) => void;
  selectedFurnitureIds?: string[];
}

export interface Canvas3DViewerHandle {
  takeScreenshot: (filename?: string) => string | null;
  getScreenshotBlob: (type?: string, quality?: number) => Promise<Blob | null>;
}

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="body1" color="text.secondary">
      Loading 3D scene...
    </Typography>
  </Box>
);

// Scene component containing all 3D elements
const Scene: React.FC<{
  design: Design;
  furniture: Furniture[];
  showRoom: boolean;
  onFurnitureClick?: (id: string) => void;
  selectedFurnitureIds?: string[];
}> = ({ design, furniture, showRoom, onFurnitureClick, selectedFurnitureIds }) => {
  // Create a map of furniture items for quick lookup
  const furnitureMap = new Map(furniture.map((f) => [f._id, f]));

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight intensity={0.3} groundColor="#444444" />

      {/* Room: same world space as designer (0..width, 0..length) */}
      {showRoom && (
        <group position={[design.room.width / 2, 0, design.room.length / 2]}>
          <Room3D room={design.room} />
        </group>
      )}

      {/* Furniture */}
      {design.furniture.map((item) => {
        const furnitureData = furnitureMap.get(item.furnitureId);
        if (!furnitureData) return null;

        return (
          <Suspense key={item.id} fallback={null}>
            <FurnitureModel3D
              furnitureItem={item}
              furniture={furnitureData}
              isSelected={selectedFurnitureIds?.includes(item.id)}
              onClick={onFurnitureClick}
            />
          </Suspense>
        );
      })}

      {/* Shadows */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={Math.max(design.room.width, design.room.length) * 2}
        blur={2}
        far={10}
      />
    </>
  );
};

export const Canvas3DViewer = forwardRef<Canvas3DViewerHandle, Canvas3DViewerProps>(
  (
    {
      design,
      furniture,
      width = '100%',
      height = '100%',
      enableControls = true,
      showStats = false,
      showRoom = true,
      onFurnitureClick,
      selectedFurnitureIds = [],
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Calculate optimal camera position based on room size
    const cameraDistance = Math.max(design.room.width, design.room.length) * 1.2;
    const cameraPosition: [number, number, number] = [
      cameraDistance,
      cameraDistance * 0.8,
      cameraDistance,
    ];

    useEffect(() => {
      // Simulate loading delay
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }, []);

    // Expose screenshot methods to parent components
    useImperativeHandle(ref, () => ({
      takeScreenshot: (filename: string = 'design-screenshot.png') => {
        if (!canvasRef.current) return null;
        try {
          const dataURL = canvasRef.current.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return dataURL;
        } catch (error) {
          console.error('Failed to take screenshot:', error);
          return null;
        }
      },
      getScreenshotBlob: async (type: string = 'image/png', quality: number = 0.92) => {
        if (!canvasRef.current) return null;
        return new Promise((resolve) => {
          canvasRef.current!.toBlob(
            (blob) => {
              resolve(blob);
            },
            type,
            quality
          );
        });
      },
    }));

    return (
      <Box
        sx={{
          width,
          height,
          position: 'relative',
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Canvas
          ref={canvasRef}
          shadows
          camera={{
            position: cameraPosition,
            fov: 50,
          }}
          gl={{
            antialias: true,
            alpha: true,
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={cameraPosition} />

            {enableControls && (
              <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={2}
                maxDistance={cameraDistance * 2}
                maxPolarAngle={Math.PI / 2 - 0.1}
                target={[0, 0, 0]}
              />
            )}

            <Scene
              design={design}
              furniture={furniture}
              showRoom={showRoom}
              onFurnitureClick={onFurnitureClick}
              selectedFurnitureIds={selectedFurnitureIds}
            />
          </Suspense>

          {/* Performance stats (optional) */}
          {showStats && <axesHelper args={[5]} />}
        </Canvas>

        {isLoading && <LoadingFallback />}
      </Box>
    );
  }
);

Canvas3DViewer.displayName = 'Canvas3DViewer';
