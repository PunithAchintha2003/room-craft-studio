import React from 'react';
import { Group, Rect, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';
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
  const [image] = useImage(furniture.thumbnail, 'anonymous');

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
      {/* Base rectangle with color */}
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

      {/* Thumbnail overlay */}
      {image && (
        <KonvaImage
          image={image}
          width={rectWidth}
          height={rectHeight}
          opacity={0.65}
          cornerRadius={4}
        />
      )}

      {/* Selection highlight overlay */}
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

      {/* Furniture name label */}
      <Text
        text={furniture.name}
        fontSize={Math.max(8, Math.min(11, rectWidth / 8))}
        fill={isSelected ? '#0D47A1' : '#37474F'}
        fontStyle="bold"
        width={rectWidth}
        align="center"
        y={rectHeight / 2 - 6}
        listening={false}
      />

      {/* Dimensions label */}
      <Text
        text={`${furniture.dimensions.width}×${furniture.dimensions.length}m`}
        fontSize={Math.max(7, Math.min(9, rectWidth / 10))}
        fill={isSelected ? '#1565C0' : '#607D8B'}
        width={rectWidth}
        align="center"
        y={rectHeight / 2 + 6}
        listening={false}
      />
    </Group>
  );
};
