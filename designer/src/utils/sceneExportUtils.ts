import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
import { OBJExporter } from 'three-stdlib';

export type SceneExportFormat = 'glb' | 'gltf' | 'obj';

export interface SceneExportOptions {
  format: SceneExportFormat;
  binary?: boolean; // For GLTF: true for GLB, false for GLTF+bin
  includeTextures?: boolean;
  embedImages?: boolean;
}

/**
 * Export a Three.js scene to GLB/GLTF format
 */
async function exportGLTF(
  scene: THREE.Scene,
  options: SceneExportOptions
): Promise<Blob> {
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (options.binary) {
          // GLB format (binary)
          const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
          resolve(blob);
        } else {
          // GLTF format (JSON)
          const output = JSON.stringify(result, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          resolve(blob);
        }
      },
      (error) => {
        reject(error);
      },
      {
        binary: options.binary,
        embedImages: options.embedImages ?? true,
        includeCustomExtensions: false,
      }
    );
  });
}

/**
 * Export a Three.js scene to OBJ format
 */
function exportOBJ(scene: THREE.Scene): Blob {
  const exporter = new OBJExporter();
  const result = exporter.parse(scene);
  return new Blob([result], { type: 'text/plain' });
}

/**
 * Main export function that handles all formats
 */
export async function exportScene(
  scene: THREE.Scene,
  filename: string,
  options: SceneExportOptions
): Promise<void> {
  let blob: Blob;
  let extension: string;

  try {
    switch (options.format) {
      case 'glb':
        blob = await exportGLTF(scene, { ...options, binary: true });
        extension = 'glb';
        break;
      case 'gltf':
        blob = await exportGLTF(scene, { ...options, binary: false });
        extension = 'gltf';
        break;
      case 'obj':
        blob = exportOBJ(scene);
        extension = 'obj';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Scene export failed:', error);
    throw new Error(`Failed to export scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export scene with metadata as a package (includes a README)
 */
export async function exportScenePackage(
  scene: THREE.Scene,
  filename: string,
  metadata: {
    designName: string;
    description?: string;
    roomDimensions: { width: number; length: number; height: number };
    furnitureCount: number;
  }
): Promise<void> {
  // Export the 3D scene
  await exportScene(scene, filename, { format: 'glb', binary: true, embedImages: true });

  // Create a README file with metadata
  const readmeContent = `# ${metadata.designName}

## Scene Information
${metadata.description || 'No description provided'}

## Room Dimensions
- Width: ${metadata.roomDimensions.width}m
- Length: ${metadata.roomDimensions.length}m
- Height: ${metadata.roomDimensions.height}m
- Area: ${(metadata.roomDimensions.width * metadata.roomDimensions.length).toFixed(2)}m²

## Contents
- Furniture Items: ${metadata.furnitureCount}
- Format: GLB (GL Transmission Format)
- Exported from: RoomCraft Studio
- Date: ${new Date().toISOString().split('T')[0]}

## Usage
This GLB file can be imported into various 3D applications:
- Blender
- Unity
- Unreal Engine
- Three.js web applications
- 3D viewers (e.g., model-viewer, Sketchfab)

## Notes
- All textures and materials are embedded in the GLB file
- The file uses PBR (Physically Based Rendering) materials
- Y-axis is up, Z-axis is forward
`;

  const readmeBlob = new Blob([readmeContent], { type: 'text/plain' });
  const readmeUrl = URL.createObjectURL(readmeBlob);
  const readmeLink = document.createElement('a');
  readmeLink.href = readmeUrl;
  readmeLink.download = `${filename}_README.txt`;
  readmeLink.click();
  URL.revokeObjectURL(readmeUrl);
}
