import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';

export const useScreenshot = () => {
  const { gl, scene, camera } = useThree();

  const takeScreenshot = useCallback(
    (filename: string = 'screenshot.png') => {
      try {
        // Render the scene
        gl.render(scene, camera);

        // Get the canvas data as PNG
        const canvas = gl.domElement;
        const dataURL = canvas.toDataURL('image/png');

        // Create a download link
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
    [gl, scene, camera]
  );

  const getScreenshotBlob = useCallback(
    async (type: string = 'image/png', quality: number = 0.92): Promise<Blob | null> => {
      try {
        // Render the scene
        gl.render(scene, camera);

        // Get the canvas
        const canvas = gl.domElement;

        // Convert to blob
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            type,
            quality
          );
        });
      } catch (error) {
        console.error('Failed to get screenshot blob:', error);
        return null;
      }
    },
    [gl, scene, camera]
  );

  return { takeScreenshot, getScreenshotBlob };
};
