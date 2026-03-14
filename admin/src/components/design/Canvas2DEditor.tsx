import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Line, Transformer } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper } from '@mui/material';
import { RootState } from '@/app/store';
import { updateFurnitureInDesign, removeFurnitureFromDesign } from '@/features/design/designSlice';
import { setSelectedFurnitureIds, clearSelection } from '@/features/editor/editorSlice';
import Konva from 'konva';

const PIXELS_PER_METER = 50;
const GRID_SIZE = 0.5;

interface Canvas2DEditorProps {
  width?: number;
  height?: number;
}

export const Canvas2DEditor: React.FC<Canvas2DEditorProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const dispatch = useDispatch();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const currentDesign = useSelector((state: RootState) => state.design.currentDesign);
  const { selectedFurnitureIds, zoom, showGrid, snapToGrid } = useSelector(
    (state: RootState) => state.editor
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedFurnitureIds.forEach(id => {
          dispatch(removeFurnitureFromDesign(id));
        });
        dispatch(clearSelection());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFurnitureIds, dispatch]);

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedFurnitureIds
        .map(id => stage.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedFurnitureIds]);

  if (!currentDesign) {
    return (
      <Paper elevation={2} sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>No design loaded</Box>
      </Paper>
    );
  }

  const roomWidth = currentDesign.room.width * PIXELS_PER_METER;
  const roomLength = currentDesign.room.length * PIXELS_PER_METER;

  const renderGrid = () => {
    if (!showGrid) return null;
    
    const lines = [];
    const gridPixels = GRID_SIZE * PIXELS_PER_METER;
    
    for (let i = 0; i <= currentDesign.room.width / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridPixels, 0, i * gridPixels, roomLength]}
          stroke="#E0E0E0"
          strokeWidth={0.5}
        />
      );
    }
    
    for (let i = 0; i <= currentDesign.room.length / GRID_SIZE; i++) {
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

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    const gridPixels = GRID_SIZE * PIXELS_PER_METER;
    return Math.round(value / gridPixels) * gridPixels;
  };

  const handleSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.shiftKey) {
      const newSelection = selectedFurnitureIds.includes(id)
        ? selectedFurnitureIds.filter(fid => fid !== id)
        : [...selectedFurnitureIds, id];
      dispatch(setSelectedFurnitureIds(newSelection));
    } else {
      dispatch(setSelectedFurnitureIds([id]));
    }
  };

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const x = snapToGridValue(node.x()) / PIXELS_PER_METER;
    const y = snapToGridValue(node.y()) / PIXELS_PER_METER;
    
    const boundedX = Math.max(0, Math.min(x, currentDesign.room.width - 0.5));
    const boundedY = Math.max(0, Math.min(y, currentDesign.room.length - 0.5));
    
    dispatch(updateFurnitureInDesign({
      id,
      updates: { position: { x: boundedX, y: boundedY } }
    }));
    
    node.x(boundedX * PIXELS_PER_METER);
    node.y(boundedY * PIXELS_PER_METER);
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const rotation = node.rotation();
    const scaleX = node.scaleX();
    
    dispatch(updateFurnitureInDesign({
      id,
      updates: { 
        rotation: rotation % 360,
        scale: Math.max(0.5, Math.min(2.0, scaleX))
      }
    }));
  };

  return (
    <Paper elevation={2} sx={{ width, height, overflow: 'hidden', position: 'relative' }}>
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            dispatch(clearSelection());
          }
        }}
      >
        <Layer>
          {renderGrid()}
          
          <Rect
            x={0}
            y={0}
            width={roomWidth}
            height={roomLength}
            fill={currentDesign.room.wallColor}
            opacity={0.1}
            stroke={currentDesign.room.wallColor}
            strokeWidth={2}
          />

          {currentDesign.furniture.map((item) => {
            const furnitureData = { width: 0.5, length: 0.5 };
            const rectWidth = furnitureData.width * PIXELS_PER_METER;
            const rectHeight = furnitureData.length * PIXELS_PER_METER;
            
            return (
              <Group
                key={item.id}
                id={item.id}
                x={item.position.x * PIXELS_PER_METER}
                y={item.position.y * PIXELS_PER_METER}
                rotation={item.rotation}
                scaleX={item.scale}
                scaleY={item.scale}
                draggable
                onClick={(e) => handleSelect(item.id, e)}
                onDragEnd={(e) => handleDragEnd(item.id, e)}
                onTransformEnd={(e) => handleTransformEnd(item.id, e)}
              >
                <Rect
                  width={rectWidth}
                  height={rectHeight}
                  fill={item.color || '#8B4513'}
                  stroke={selectedFurnitureIds.includes(item.id) ? '#1976d2' : '#666'}
                  strokeWidth={selectedFurnitureIds.includes(item.id) ? 3 : 1}
                  cornerRadius={4}
                />
              </Group>
            );
          })}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </Paper>
  );
};

export default Canvas2DEditor;
