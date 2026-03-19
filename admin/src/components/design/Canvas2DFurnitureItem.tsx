import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { Furniture, FurnitureItem } from '@/types/design.types';

interface Canvas2DFurnitureItemProps {
  item: FurnitureItem;
  furniture: Furniture;
  isSelected: boolean;
  pixelsPerMeter: number;
  onSelect: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragMove?: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (id: string, e: Konva.KonvaEventObject<Event>) => void;
}

export const Canvas2DFurnitureItem: React.FC<Canvas2DFurnitureItemProps> = ({
  item,
  furniture,
  isSelected,
  pixelsPerMeter,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}) => {
  const rectWidth = furniture.dimensions.width * pixelsPerMeter;
  const rectHeight = furniture.dimensions.length * pixelsPerMeter;

  return (
    <Group
      id={item.id}
      x={item.position.x * pixelsPerMeter}
      y={item.position.y * pixelsPerMeter}
      rotation={item.rotation}
      scaleX={item.scale}
      scaleY={item.scale}
      draggable
      onClick={(e) => onSelect(item.id, e)}
      onDragMove={onDragMove ? (e) => onDragMove(item.id, e) : undefined}
      onDragEnd={(e) => onDragEnd(item.id, e)}
      onTransformEnd={(e) => onTransformEnd(item.id, e)}
    >
      <Rect
        width={rectWidth}
        height={rectHeight}
        fill={item.color || furniture.defaultColor}
        stroke={isSelected ? '#1565C0' : '#78909C'}
        strokeWidth={isSelected ? 2.5 : 1}
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.4)"
        shadowBlur={isSelected ? 12 : 4}
        shadowOpacity={1}
        shadowOffsetY={isSelected ? 3 : 1}
      />

      {isSelected && (
        <Rect
          width={rectWidth}
          height={rectHeight}
          fill="rgba(21, 101, 192, 0.15)"
          stroke="#1565C0"
          strokeWidth={2}
          cornerRadius={4}
          dash={[6, 3]}
        />
      )}

      <Text
        text={furniture.name}
        fontSize={Math.max(9, Math.min(12, Math.min(rectWidth, rectHeight) / 6))}
        fill={isSelected ? '#0D47A1' : '#37474F'}
        fontStyle="bold"
        width={rectWidth}
        align="center"
        verticalAlign="middle"
        height={rectHeight}
        y={0}
        listening={false}
      />
    </Group>
  );
};

export default Canvas2DFurnitureItem;

