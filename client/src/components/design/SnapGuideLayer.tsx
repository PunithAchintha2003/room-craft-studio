import React from 'react';
import { Layer, Line, Text, Rect } from 'react-konva';
import { FurnitureItem, Furniture } from '@/types/design.types';

const SNAP_THRESHOLD_PX = 6;

export interface SnapTarget {
  value: number;
  type: 'room-edge' | 'room-center' | 'furniture-edge' | 'furniture-center';
  label?: string;
}

export interface ActiveSnapGuides {
  x: number | null;
  y: number | null;
  xLabel?: string;
  yLabel?: string;
}

interface SnapGuideLayerProps {
  roomWidth: number;
  roomLength: number;
  pixelsPerMeter: number;
  canvasWidth: number;
  canvasHeight: number;
  snapGuides: ActiveSnapGuides;
}

export const SnapGuideLayer: React.FC<SnapGuideLayerProps> = ({
  roomWidth,
  roomLength,
  pixelsPerMeter,
  canvasWidth,
  canvasHeight,
  snapGuides,
}) => {
  const roomWidthPx = roomWidth * pixelsPerMeter;
  const roomLengthPx = roomLength * pixelsPerMeter;

  return (
    <Layer listening={false}>
      {snapGuides.x !== null && (
        <>
          <Line
            points={[snapGuides.x, 0, snapGuides.x, Math.max(roomLengthPx, canvasHeight)]}
            stroke="#E53935"
            strokeWidth={1}
            dash={[6, 3]}
            opacity={0.85}
          />
          {snapGuides.xLabel && (
            <Rect
              x={snapGuides.x + 4}
              y={8}
              width={snapGuides.xLabel.length * 6.5 + 8}
              height={18}
              fill="rgba(229,57,53,0.85)"
              cornerRadius={3}
            />
          )}
          {snapGuides.xLabel && (
            <Text
              x={snapGuides.x + 8}
              y={11}
              text={snapGuides.xLabel}
              fontSize={10}
              fill="#fff"
              fontStyle="bold"
            />
          )}
        </>
      )}

      {snapGuides.y !== null && (
        <>
          <Line
            points={[0, snapGuides.y, Math.max(roomWidthPx, canvasWidth), snapGuides.y]}
            stroke="#1565C0"
            strokeWidth={1}
            dash={[6, 3]}
            opacity={0.85}
          />
          {snapGuides.yLabel && (
            <Rect
              x={8}
              y={snapGuides.y + 4}
              width={snapGuides.yLabel.length * 6.5 + 8}
              height={18}
              fill="rgba(21,101,192,0.85)"
              cornerRadius={3}
            />
          )}
          {snapGuides.yLabel && (
            <Text
              x={12}
              y={snapGuides.y + 7}
              text={snapGuides.yLabel}
              fontSize={10}
              fill="#fff"
              fontStyle="bold"
            />
          )}
        </>
      )}
    </Layer>
  );
};

export const computeSnapTargetsX = (
  roomWidth: number,
  pixelsPerMeter: number,
  furnitureItems: FurnitureItem[],
  furnitureCatalog: Furniture[],
  excludeId?: string
): SnapTarget[] => {
  const targets: SnapTarget[] = [
    { value: 0, type: 'room-edge', label: 'left edge' },
    { value: roomWidth * pixelsPerMeter, type: 'room-edge', label: 'right edge' },
    { value: (roomWidth / 2) * pixelsPerMeter, type: 'room-center', label: 'center X' },
  ];

  furnitureItems
    .filter((item) => item.id !== excludeId)
    .forEach((item) => {
      const cat = furnitureCatalog.find((f) => f._id === item.furnitureId);
      if (!cat) return;
      const x = item.position.x * pixelsPerMeter;
      const w = cat.dimensions.width * pixelsPerMeter * item.scale;
      targets.push({ value: x, type: 'furniture-edge', label: cat.name });
      targets.push({ value: x + w, type: 'furniture-edge', label: cat.name });
      targets.push({ value: x + w / 2, type: 'furniture-center', label: cat.name });
    });

  return targets;
};

export const computeSnapTargetsY = (
  roomLength: number,
  pixelsPerMeter: number,
  furnitureItems: FurnitureItem[],
  furnitureCatalog: Furniture[],
  excludeId?: string
): SnapTarget[] => {
  const targets: SnapTarget[] = [
    { value: 0, type: 'room-edge', label: 'top edge' },
    { value: roomLength * pixelsPerMeter, type: 'room-edge', label: 'bottom edge' },
    { value: (roomLength / 2) * pixelsPerMeter, type: 'room-center', label: 'center Y' },
  ];

  furnitureItems
    .filter((item) => item.id !== excludeId)
    .forEach((item) => {
      const cat = furnitureCatalog.find((f) => f._id === item.furnitureId);
      if (!cat) return;
      const y = item.position.y * pixelsPerMeter;
      const h = cat.dimensions.length * pixelsPerMeter * item.scale;
      targets.push({ value: y, type: 'furniture-edge', label: cat.name });
      targets.push({ value: y + h, type: 'furniture-edge', label: cat.name });
      targets.push({ value: y + h / 2, type: 'furniture-center', label: cat.name });
    });

  return targets;
};

export const findSnap = (
  value: number,
  targets: SnapTarget[],
  threshold = SNAP_THRESHOLD_PX
): { snapped: number; guide: number | null; label?: string } => {
  let nearest: SnapTarget | null = null;
  let nearestDist = threshold + 1;

  for (const t of targets) {
    const dist = Math.abs(value - t.value);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = t;
    }
  }

  if (nearest) {
    return { snapped: nearest.value, guide: nearest.value, label: nearest.label };
  }

  return { snapped: value, guide: null };
};

export default SnapGuideLayer;
