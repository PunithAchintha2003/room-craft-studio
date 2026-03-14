import React from 'react';
import { Stage, Layer, Rect, Group, Line } from 'react-konva';
import { Paper } from '@mui/material';
import { Design } from '@/types/design.types';

const PIXELS_PER_METER = 50;
const GRID_SIZE = 0.5;

interface ReadOnlyCanvas2DViewerProps {
  design: Design;
  width?: number;
  height?: number;
  showGrid?: boolean;
}

export const ReadOnlyCanvas2DViewer: React.FC<ReadOnlyCanvas2DViewerProps> = ({
  design,
  width = 800,
  height = 600,
  showGrid = true,
}) => {
  const roomWidth = design.room.width * PIXELS_PER_METER;
  const roomLength = design.room.length * PIXELS_PER_METER;

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    const gridPixels = GRID_SIZE * PIXELS_PER_METER;

    for (let i = 0; i <= design.room.width / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridPixels, 0, i * gridPixels, roomLength]}
          stroke="#E0E0E0"
          strokeWidth={0.5}
        />
      );
    }

    for (let i = 0; i <= design.room.length / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridPixels, roomWidth, i * gridPixels]}
          stroke="#E0E0E0"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  return (
    <Paper elevation={2} sx={{ width, height, overflow: 'hidden', position: 'relative' }}>
      <Stage width={width} height={height}>
        <Layer>
          {renderGrid()}

          <Rect
            x={0}
            y={0}
            width={roomWidth}
            height={roomLength}
            fill={design.room.wallColor}
            opacity={0.1}
            stroke={design.room.wallColor}
            strokeWidth={2}
          />

          {design.furniture.map((item) => {
            const rectWidth = 0.5 * PIXELS_PER_METER;
            const rectHeight = 0.5 * PIXELS_PER_METER;

            return (
              <Group
                key={item.id}
                x={item.position.x * PIXELS_PER_METER}
                y={item.position.y * PIXELS_PER_METER}
                rotation={item.rotation}
                scaleX={item.scale}
                scaleY={item.scale}
              >
                <Rect
                  width={rectWidth}
                  height={rectHeight}
                  fill={item.color || '#8B4513'}
                  stroke="#666"
                  strokeWidth={1}
                  cornerRadius={4}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </Paper>
  );
};

export default ReadOnlyCanvas2DViewer;
