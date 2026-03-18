import React, { Suspense, useMemo } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface RoomPreviewProps {
  minimal?: boolean;
}

const getHeroModelUrl = () => {
  const apiBase =
    (import.meta as { env: Record<string, string> }).env['VITE_API_URL'] ||
    'http://localhost:5001/api';
  const assetBase = apiBase.replace(/\/api\/?$/, '');
  return `${assetBase}/uploads/hero-models/hero-model.glb`;
};

const HeroModel: React.FC = () => {
  const url = getHeroModelUrl();
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const center = new THREE.Vector3();
    box.getCenter(center);
    s.position.sub(center);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    return s;
  }, [scene]);
  return <primitive object={cloned} />;
};

useGLTF.preload(getHeroModelUrl());

const FOCUS_TARGET: [number, number, number] = [0, 0, 0];
const CAMERA_DISTANCE = 7;
const CAMERA_HEIGHT = 1.5;

export const HeroRoomPreview: React.FC<RoomPreviewProps> = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minWidth: '100%',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          '& canvas': { display: 'block', width: '100% !important', height: '100% !important' },
        }}
      >
        <Canvas
          shadows
          style={{ width: '100%', height: '100%', display: 'block' }}
          camera={{ position: [0, CAMERA_HEIGHT, CAMERA_DISTANCE], fov: 45 }}
          gl={{ antialias: true }}
        >
        <Suspense
          fallback={
            <Html center>
              <CircularProgress size={28} />
            </Html>
          }
        >
          <PerspectiveCamera makeDefault position={[0, CAMERA_HEIGHT, CAMERA_DISTANCE]} fov={45} near={0.1} far={100} />

          <ambientLight intensity={0.7} />
          <directionalLight
            castShadow
            intensity={1.1}
            position={[3, 6, 4]}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
          />

          <HeroModel />
        </Suspense>

        <OrbitControls
          target={FOCUS_TARGET}
          enablePan={false}
          enableDamping
          dampingFactor={0.12}
          minDistance={2}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
        </Canvas>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          color: theme.palette.text.secondary,
          typography: 'body2',
        }}
      >
        {/* Non-WebGL fallback text (only shows if Canvas fails) */}
      </Box>
    </Box>
  );
};

export default HeroRoomPreview;



