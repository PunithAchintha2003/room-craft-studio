import React, { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
  TransformControls,
  Environment,
  SoftShadows,
  ContactShadows,
  BakeShadows,
} from '@react-three/drei';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import { BlendFunction } from 'postprocessing';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { setSelectedFurnitureIds } from '@/features/editor/editorSlice';
import { updateFurnitureInDesign } from '@/features/design/designSlice';
import { Design, Furniture, FurnitureItem } from '../../types/design.types';
import { Room3D } from './Room3D';
import { FurnitureModel3D } from './FurnitureModel3D';
import { LightingConfig } from './LightingControlPanel';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import * as THREE from 'three';

export interface Canvas3DEditorProps {
  design: Design;
  furniture: Furniture[];
  width?: number | string;
  height?: number | string;
  onGroundClick?: (position: { x: number; z: number }) => void;
  lightingConfig?: LightingConfig;
}

type TransformMode = 'translate' | 'rotate' | 'scale';
type CameraPreset = 'corner' | 'top' | 'front' | 'isometric';

// ── Environment preset derived from time-of-day ───────────────────────────────
type EnvironmentPreset = 'apartment' | 'city' | 'dawn' | 'night' | 'sunset' | 'warehouse';

const TIME_TO_ENV: Record<string, EnvironmentPreset> = {
  morning: 'dawn',
  noon: 'apartment',
  evening: 'sunset',
  night: 'night',
};

// ── Sun position derived from time-of-day ────────────────────────────────────
const TIME_TO_SUN: Record<string, [number, number, number]> = {
  morning: [5, 8, 8],
  noon: [0, 15, 5],
  evening: [-5, 6, 8],
  night: [0, 5, 5],
};

// ── Interactive Furniture with TransformControls ──────────────────────────────
// Position is stored as top-left (same as 2D). We place the group at the furniture
// center so the 3D model (which is centered in local space) aligns with the 2D rect.
const InteractiveFurniture: React.FC<{
  item: FurnitureItem;
  furniture: Furniture;
  isSelected: boolean;
  transformMode: TransformMode;
  onClick: (id: string) => void;
  onTransform: (id: string, updates: Partial<FurnitureItem>) => void;
}> = ({ item, furniture, isSelected, transformMode, onClick, onTransform }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const w = furniture.dimensions.width * item.scale;
  const l = furniture.dimensions.length * item.scale;
  const centerX = item.position.x + w / 2;
  const centerZ = item.position.y + l / 2;

  useEffect(() => {
    if (!transformRef.current || !isSelected) return;
    const controls = transformRef.current;

    const handleChange = () => {
      if (!groupRef.current) return;
      const group = groupRef.current;
      const scale = group.scale.x;
      const halfW = (furniture.dimensions.width * scale) / 2;
      const halfL = (furniture.dimensions.length * scale) / 2;
      onTransform(item.id, {
        position: {
          x: group.position.x - halfW,
          y: group.position.z - halfL,
        },
        rotation: (group.rotation.y * 180) / Math.PI,
        scale,
      });
    };

    controls.addEventListener('objectChange', handleChange);
    return () => controls.removeEventListener('objectChange', handleChange);
  }, [isSelected, item.id, onTransform, furniture.dimensions.width, furniture.dimensions.length]);

  return (
    <>
      <group
        ref={groupRef}
        position={[centerX, 0, centerZ]}
        rotation={[0, (item.rotation * Math.PI) / 180, 0]}
        scale={[item.scale, item.scale, item.scale]}
      >
        <Suspense fallback={null}>
          <FurnitureModel3D
            furnitureItem={item}
            furniture={furniture}
            isSelected={isSelected}
            onClick={onClick}
          />
        </Suspense>
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode={transformMode}
          camera={camera}
          domElement={gl.domElement}
          translationSnap={0.25}
          rotationSnap={THREE.MathUtils.degToRad(15)}
          scaleSnap={0.1}
        />
      )}
    </>
  );
};

// ── Loading fallback ──────────────────────────────────────────────────────────
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(15,15,25,0.6)',
      backdropFilter: 'blur(6px)',
      zIndex: 5,
      gap: 2,
    }}
  >
    <CircularProgress size={52} thickness={3} sx={{ color: 'primary.light' }} />
    <Typography variant="body2" color="grey.300">
      Rendering scene…
    </Typography>
  </Box>
);

// ── Scene ─────────────────────────────────────────────────────────────────────
const Scene: React.FC<{
  design: Design;
  furniture: Furniture[];
  selectedIds: string[];
  transformMode: TransformMode;
  onFurnitureClick: (id: string) => void;
  onFurnitureTransform: (id: string, updates: Partial<FurnitureItem>) => void;
  showGrid: boolean;
  onGroundClick?: (position: { x: number; z: number }) => void;
  lightingConfig: LightingConfig;
  postProcessing: boolean;
}> = ({
  design,
  furniture,
  selectedIds,
  transformMode,
  onFurnitureClick,
  onFurnitureTransform,
  showGrid,
  onGroundClick,
  lightingConfig,
  postProcessing: _postProcessing,
}) => {
  const furnitureMap = new Map(furniture.map(f => [f._id, f]));
  const roomDiag = Math.sqrt(design.room.width ** 2 + design.room.length ** 2);

  const envPreset = TIME_TO_ENV[lightingConfig.timeOfDay] ?? 'apartment';
  const sunPos = TIME_TO_SUN[lightingConfig.timeOfDay] ?? TIME_TO_SUN.noon;
  const centerX = design.room.width / 2;
  const centerZ = design.room.length / 2;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGroundClick = (event: any) => {
    if (!onGroundClick || selectedIds.length > 0) return;
    const pt = event.intersections?.[0]?.point;
    if (!pt) return;
    onGroundClick({
      x: Math.max(0, Math.min(design.room.width, pt.x + centerX)),
      z: Math.max(0, Math.min(design.room.length, pt.z + centerZ)),
    });
  };

  return (
    <>
      {/* ── Soft shadow presets ── */}
      {lightingConfig.shadowsEnabled && <SoftShadows size={40} samples={16} focus={0.5} />}

      {/* ── Environment / IBL ── */}
      <Suspense fallback={null}>
        <Environment preset={envPreset} background={false} />
      </Suspense>

      {/* ── Fog for depth ── */}
      <fog attach="fog" args={['#e8eaf0', roomDiag * 4, roomDiag * 10]} />

      {/* ── Ambient ── */}
      <ambientLight intensity={lightingConfig.ambientIntensity * 0.6} color="#ffffff" />

      {/* ── Hemisphere (sky / ground bounce) ── */}
      <hemisphereLight
        intensity={lightingConfig.hemisphereIntensity}
        color="#ddeeff"
        groundColor="#443322"
      />

      {/* ── Main directional (sun) ── */}
      <directionalLight
        position={sunPos}
        intensity={lightingConfig.directionalIntensity}
        castShadow={lightingConfig.shadowsEnabled}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={roomDiag * 4}
        shadow-camera-left={-roomDiag}
        shadow-camera-right={roomDiag}
        shadow-camera-top={roomDiag}
        shadow-camera-bottom={-roomDiag}
        shadow-bias={-0.0005}
        color={lightingConfig.timeOfDay === 'evening' ? '#FFB74D' : lightingConfig.timeOfDay === 'morning' ? '#FFCC80' : '#FFF9F0'}
      />

      {/* ── Fill light (opposite side) ── */}
      <pointLight
        position={[-sunPos[0] * 0.5, sunPos[1] * 0.4, -sunPos[2] * 0.5]}
        intensity={lightingConfig.directionalIntensity * 0.15}
        color="#aaccff"
        distance={roomDiag * 3}
      />

      {/* ── Grid ── */}
      {showGrid && (
        <Grid
          args={[roomDiag * 3, roomDiag * 3]}
          cellSize={0.5}
          cellThickness={0.4}
          cellColor="#8090a0"
          sectionSize={1}
          sectionThickness={0.8}
          sectionColor="#6080a0"
          fadeDistance={roomDiag * 2.5}
          fadeStrength={1.2}
          position={[0, 0.002, 0]}
        />
      )}

      {/* ── Room geometry ── */}
      <group position={[centerX, 0, centerZ]}>
        <Room3D room={design.room} />
      </group>

      {/* ── Contact shadows ── */}
      {lightingConfig.shadowsEnabled && (
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.35}
          scale={roomDiag * 2.5}
          blur={2.5}
          far={8}
          color="#000020"
        />
      )}

      {/* ── Invisible ground for click detection ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleGroundClick}
        visible={false}
      >
        <planeGeometry args={[roomDiag * 4, roomDiag * 4]} />
        <meshBasicMaterial />
      </mesh>

      {/* ── Furniture ── */}
      {design.furniture.map(item => {
        const furnitureData = furnitureMap.get(item.furnitureId);
        if (!furnitureData) return null;
        return (
          <InteractiveFurniture
            key={item.id}
            item={item}
            furniture={furnitureData}
            isSelected={selectedIds.includes(item.id)}
            transformMode={transformMode}
            onClick={onFurnitureClick}
            onTransform={onFurnitureTransform}
          />
        );
      })}

      {/* ── Post-processing disabled (EffectComposer stability issues) ── */}
      {/* Relying on Three.js ACES tone mapping + material emissive for highlights */}

      {/* ── Bake shadows for static geometry ── */}
      {lightingConfig.shadowsEnabled && <BakeShadows />}
    </>
  );
};

// ── Main Canvas3DEditor ───────────────────────────────────────────────────────
export const Canvas3DEditor: React.FC<Canvas3DEditorProps> = React.memo(({
  design,
  furniture,
  width = '100%',
  height = '100%',
  onGroundClick,
  lightingConfig,
}) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitControlsRef = useRef<any>(null);
  const { selectedFurnitureIds } = useSelector((state: RootState) => state.editor);

  const [isLoading, setIsLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('corner');
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [postProcessing, setPostProcessing] = useState(false);
  const [webglLost, setWebglLost] = useState(false);

  const defaultLightingConfig: LightingConfig = useMemo(() => ({
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    hemisphereIntensity: 0.3,
    shadowsEnabled: true,
    timeOfDay: 'noon',
  }), []);
  
  const activeLighting = lightingConfig ?? defaultLightingConfig;

  const roomDiag = Math.max(design.room.width, design.room.length);
  const cameraPositions: Record<CameraPreset, [number, number, number]> = {
    corner: [roomDiag * 1.2, roomDiag * 1.0, roomDiag * 1.2],
    top:    [0, roomDiag * 2.0, 0.001],
    front:  [0, roomDiag * 0.6, roomDiag * 1.6],
    isometric: [roomDiag * 1.4, roomDiag * 1.4, roomDiag * 1.4],
  };
  const cameraPos = cameraPositions[cameraPreset];
  const cameraTarget: [number, number, number] = [0, 0, 0];

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcuts (G/R/S for transform modes, handled here for 3D context)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (selectedFurnitureIds.length === 0) return;
      switch (e.key.toLowerCase()) {
        case 'g': e.preventDefault(); setTransformMode('translate'); break;
        case 'r': e.preventDefault(); setTransformMode('rotate'); break;
        case 's': e.preventDefault(); setTransformMode('scale'); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedFurnitureIds]);

  const handleFurnitureClick = useCallback(
    (id: string) => {
      dispatch(
        setSelectedFurnitureIds(
          selectedFurnitureIds.includes(id)
            ? selectedFurnitureIds.filter(fid => fid !== id)
            : [id]
        )
      );
    },
    [dispatch, selectedFurnitureIds]
  );

  const handleFurnitureTransform = useCallback(
    (id: string, updates: Partial<FurnitureItem>) => {
      dispatch(updateFurnitureInDesign({ id, updates }));
    },
    [dispatch]
  );

  const cycleCameraPreset = useCallback(() => {
    const presets: CameraPreset[] = ['corner', 'top', 'front', 'isometric'];
    setCameraPreset(presets[(presets.indexOf(cameraPreset) + 1) % presets.length]);
  }, [cameraPreset]);

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        bgcolor: '#0F1117',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* ── Floating toolbar ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Transform mode (only when item selected) */}
        {selectedFurnitureIds.length > 0 && (
          <ToggleButtonGroup
            value={transformMode}
            exclusive
            onChange={(_e, v) => v && setTransformMode(v)}
            size="small"
            sx={{
              bgcolor: 'rgba(20,20,30,0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              '& .MuiToggleButton-root': { color: '#ccc', borderColor: 'transparent' },
              '& .Mui-selected': { color: '#fff', bgcolor: 'rgba(33,150,243,0.35)' },
            }}
          >
            <ToggleButton value="translate">
              <Tooltip title="Move (G)"><OpenWithIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="rotate">
              <Tooltip title="Rotate (R)"><RotateRightIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="scale">
              <Tooltip title="Scale (S)"><ZoomOutMapIcon fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Camera + Grid buttons */}
        <Stack
          direction="column"
          spacing={0.5}
          sx={{
            bgcolor: 'rgba(20,20,30,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <Tooltip title={`Camera: ${cameraPreset} (cycle)`} placement="left">
            <IconButton onClick={cycleCameraPreset} size="small" sx={{ color: '#ccc' }}>
              <CameraswitchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'} placement="left">
            <IconButton onClick={() => setShowGrid(g => !g)} size="small" sx={{ color: showGrid ? '#64B5F6' : '#888' }}>
              {showGrid ? <GridOffIcon fontSize="small" /> : <GridOnIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={postProcessing ? 'Disable FX' : 'Enable FX (Bloom+AO)'} placement="left">
            <IconButton
              onClick={() => setPostProcessing(p => !p)}
              size="small"
              sx={{ color: postProcessing ? '#A5D6A7' : '#888', fontSize: 11 }}
            >
              FX
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Camera label */}
      <Chip
        label={`📷 ${cameraPreset.charAt(0).toUpperCase() + cameraPreset.slice(1)}`}
        size="small"
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 10,
          bgcolor: 'rgba(20,20,30,0.75)',
          color: '#ccc',
          fontSize: 11,
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Keyboard hint */}
      {selectedFurnitureIds.length > 0 && (
        <Chip
          label="G Move · R Rotate · S Scale · Del Remove"
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            bgcolor: 'rgba(20,20,30,0.75)',
            color: '#aaa',
            fontSize: 10,
            backdropFilter: 'blur(6px)',
          }}
        />
      )}

      {/* Three.js Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          alpha: false,
        }}
        dpr={[1, 1.5]}
        frameloop="demand"
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          // Ensure textures/materials render with correct (sRGB) authored colors.
          gl.outputColorSpace = THREE.SRGBColorSpace;

          // Surface WebGL context loss with an actionable message instead of silently freezing.
          const canvas = gl.domElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            setWebglLost(true);
          };
          const onRestored = () => setWebglLost(false);
          canvas.addEventListener('webglcontextlost', onLost as EventListener, false);
          canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false);
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={cameraPos} fov={45} near={0.1} far={200} />

          <OrbitControls
            ref={orbitControlsRef}
            target={cameraTarget}
            enablePan
            enableZoom
            enableRotate
            minDistance={1}
            maxDistance={roomDiag * 4}
            maxPolarAngle={Math.PI / 2 - 0.02}
            enabled={selectedFurnitureIds.length === 0}
            dampingFactor={0.08}
            enableDamping
          />

          <Scene
            design={design}
            furniture={furniture}
            selectedIds={selectedFurnitureIds}
            transformMode={transformMode}
            onFurnitureClick={handleFurnitureClick}
            onFurnitureTransform={handleFurnitureTransform}
            showGrid={showGrid}
            onGroundClick={onGroundClick}
            lightingConfig={activeLighting}
            postProcessing={postProcessing}
          />
        </Suspense>
      </Canvas>

      {isLoading && <LoadingFallback />}

      {webglLost && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(10,10,14,0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 30,
            p: 2,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'grey.100' }}>
              3D renderer reset
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.300', maxWidth: 520 }}>
              Your browser lost the WebGL context (usually GPU/driver memory pressure).
              Try closing other heavy tabs, then refresh the page.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default Canvas3DEditor;
