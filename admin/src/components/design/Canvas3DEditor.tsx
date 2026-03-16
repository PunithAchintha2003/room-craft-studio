import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Grid } from '@react-three/drei';
import { Box, CircularProgress, Typography, IconButton, ButtonGroup } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { setSelectedFurnitureIds } from '@/features/editor/editorSlice';
import { Design, Furniture } from '../../types/design.types';
import { Room3D } from './Room3D';
import { FurnitureModel3D } from './FurnitureModel3D';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';

interface Canvas3DEditorProps {
  design: Design;
  furniture: Furniture[];
  width?: number | string;
  height?: number | string;
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
      Loading 3D preview...
    </Typography>
  </Box>
);

// Scene component containing all 3D elements
const Scene: React.FC<{
  design: Design;
  furniture: Furniture[];
  selectedIds: string[];
  onFurnitureClick: (id: string) => void;
  showGrid: boolean;
}> = ({ design, furniture, selectedIds, onFurnitureClick, showGrid }) => {
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

      {/* Grid helper */}
      {showGrid && (
        <Grid
          args={[Math.max(design.room.width, design.room.length) * 2, Math.max(design.room.width, design.room.length) * 2]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={50}
          fadeStrength={1}
          position={[0, 0.01, 0]}
        />
      )}

      {/* Room */}
      <Room3D room={design.room} />

      {/* Furniture */}
      {design.furniture.map((item) => {
        const furnitureData = furnitureMap.get(item.furnitureId);
        if (!furnitureData) return null;

        return (
          <Suspense key={item.id} fallback={null}>
            <FurnitureModel3D
              furnitureItem={item}
              furniture={furnitureData}
              isSelected={selectedIds.includes(item.id)}
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

export const Canvas3DEditor: React.FC<Canvas3DEditorProps> = ({
  design,
  furniture,
  width = '100%',
  height = '100%',
}) => {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedFurnitureIds } = useSelector((state: RootState) => state.editor);
  const [isLoading, setIsLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'corner' | 'top' | 'front'>('corner');

  // Calculate optimal camera position based on room size and preset
  const cameraDistance = Math.max(design.room.width, design.room.length) * 1.2;
  
  const cameraPositions: Record<string, [number, number, number]> = {
    corner: [cameraDistance, cameraDistance * 0.8, cameraDistance],
    top: [0, cameraDistance * 1.5, 0],
    front: [0, cameraDistance * 0.6, cameraDistance * 1.5],
  };

  const cameraPosition = cameraPositions[cameraPreset];

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFurnitureClick = (id: string) => {
    // Toggle selection
    if (selectedFurnitureIds.includes(id)) {
      dispatch(setSelectedFurnitureIds(selectedFurnitureIds.filter((fid) => fid !== id)));
    } else {
      // For now, single selection (can be extended for multi-select with Shift key)
      dispatch(setSelectedFurnitureIds([id]));
    }
  };

  const cycleCameraPreset = () => {
    const presets: ('corner' | 'top' | 'front')[] = ['corner', 'top', 'front'];
    const currentIndex = presets.indexOf(cameraPreset);
    const nextIndex = (currentIndex + 1) % presets.length;
    setCameraPreset(presets[nextIndex]);
  };

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
      {/* Camera controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          gap: 1,
        }}
      >
        <ButtonGroup variant="contained" size="small">
          <IconButton
            onClick={cycleCameraPreset}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
            title={`Camera: ${cameraPreset}`}
          >
            <CameraswitchIcon />
          </IconButton>
          <IconButton
            onClick={() => setShowGrid(!showGrid)}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
            title={showGrid ? 'Hide Grid' : 'Show Grid'}
          >
            {showGrid ? <GridOffIcon /> : <GridOnIcon />}
          </IconButton>
        </ButtonGroup>
      </Box>

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
          
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={2}
            maxDistance={cameraDistance * 2}
            maxPolarAngle={Math.PI / 2 - 0.1}
            target={[0, 0, 0]}
          />

          <Scene
            design={design}
            furniture={furniture}
            selectedIds={selectedFurnitureIds}
            onFurnitureClick={handleFurnitureClick}
            showGrid={showGrid}
          />
        </Suspense>
      </Canvas>

      {isLoading && <LoadingFallback />}
    </Box>
  );
};
