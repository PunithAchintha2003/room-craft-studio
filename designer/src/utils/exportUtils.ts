import * as THREE from 'three';

export interface ExportOptions {
  resolution: 'low' | 'medium' | 'high' | 'ultra';
  transparentBackground: boolean;
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  filename: string;
}

const resolutionMap = {
  low: { width: 800, height: 600 },
  medium: { width: 1920, height: 1080 },
  high: { width: 2560, height: 1440 },
  ultra: { width: 3840, height: 2160 },
};

/**
 * Capture a screenshot from a Three.js renderer
 * @param scene Scene
 * @param camera Camera
 * @param options Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportScreenshot(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: ExportOptions
): Promise<void> {
  const resolution = resolutionMap[options.resolution];
  
  // Create an offscreen canvas for high-res rendering
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = resolution.width;
  offscreenCanvas.height = resolution.height;
  
  // Create temporary renderer
  const tempRenderer = new THREE.WebGLRenderer({
    canvas: offscreenCanvas,
    antialias: true,
    alpha: options.transparentBackground,
    preserveDrawingBuffer: true,
  });
  
  tempRenderer.setSize(resolution.width, resolution.height);
  tempRenderer.setPixelRatio(1);
  tempRenderer.setClearColor(options.transparentBackground ? 0x000000 : 0xffffff, options.transparentBackground ? 0 : 1);
  
  // Render the scene
  tempRenderer.render(scene, camera);
  
  // Convert to blob
  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : `image/${options.format}`;
  const quality = options.quality / 100;
  
  return new Promise((resolve, reject) => {
    offscreenCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${options.filename}.${options.format}`;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        tempRenderer.dispose();
        
        resolve();
      },
      mimeType,
      quality
    );
  });
}

/**
 * Export batch screenshots with different angles/presets
 */
export async function exportBatchScreenshots(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  options: ExportOptions,
  cameraPositions: Array<{ name: string; position: THREE.Vector3; lookAt: THREE.Vector3 }>
): Promise<void> {
  const originalPosition = camera.position.clone();
  const originalRotation = camera.rotation.clone();
  
  for (const preset of cameraPositions) {
    camera.position.copy(preset.position);
    camera.lookAt(preset.lookAt);
    camera.updateProjectionMatrix();
    
    await exportScreenshot(scene, camera, {
      ...options,
      filename: `${options.filename}_${preset.name}`,
    });
  }
  
  // Restore original camera
  camera.position.copy(originalPosition);
  camera.rotation.copy(originalRotation);
  camera.updateProjectionMatrix();
}
