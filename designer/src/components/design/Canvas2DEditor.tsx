import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Transformer } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper } from '@mui/material';
import { RootState } from '@/app/store';
import { updateFurnitureInDesign } from '@/features/design/designSlice';
import {
  setSelectedFurnitureIds,
  clearSelection,
  setSnapGuides,
  clearSnapGuides,
} from '@/features/editor/editorSlice';
import { Canvas2DFurnitureItem } from './Canvas2DFurnitureItem';
import { MeasurementLayer } from './MeasurementLayer';
import { SnapGuideLayer, computeSnapTargetsX, computeSnapTargetsY, findSnap } from './SnapGuideLayer';
import { getFloorOutlinePoints } from '@/utils/roomShapeUtils';
import Konva from 'konva';

const PIXELS_PER_METER = 60;
const RULER_SIZE = 20;
const WALL_THICKNESS_PX = 6;

interface Canvas2DEditorProps {
  width?: number;
  height?: number;
}

export const Canvas2DEditor: React.FC<Canvas2DEditorProps> = ({
  width = 800,
  height = 600,
}) => {
  const dispatch = useDispatch();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [localSnapGuides, setLocalSnapGuides] = useState<{ x: number | null; y: number | null; xLabel?: string; yLabel?: string }>({ x: null, y: null });

  const currentDesign = useSelector((state: RootState) => state.design.currentDesign);
  const { furniture } = useSelector((state: RootState) => state.furniture);
  const {
    selectedFurnitureIds,
    zoom,
    showGrid,
    snapToGrid,
    tool,
    canvasOffset,
    showRuler,
    showAlignmentGuides,
    gridSize,
  } = useSelector((state: RootState) => state.editor);

  const gridSizePx = gridSize * PIXELS_PER_METER;

  // Sync transformer nodes when selection changes
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
      <Paper
        elevation={2}
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>No design loaded</Box>
      </Paper>
    );
  }

  const roomWidthPx = currentDesign.room.width * PIXELS_PER_METER;
  const roomLengthPx = currentDesign.room.length * PIXELS_PER_METER;

  // ── Grid rendering ────────────────────────────────────────────────────────
  const renderGrid = () => {
    if (!showGrid) return null;
    const lines: React.ReactNode[] = [];
    const cols = Math.floor(currentDesign.room.width / gridSize);
    const rows = Math.floor(currentDesign.room.length / gridSize);

    for (let i = 0; i <= cols; i++) {
      const x = i * gridSizePx;
      const isMajor = i % 2 === 0;
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, roomLengthPx]}
          stroke={isMajor ? '#BDBDBD' : '#E0E0E0'}
          strokeWidth={isMajor ? 0.8 : 0.4}
          listening={false}
        />
      );
    }
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSizePx;
      const isMajor = i % 2 === 0;
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, y, roomWidthPx, y]}
          stroke={isMajor ? '#BDBDBD' : '#E0E0E0'}
          strokeWidth={isMajor ? 0.8 : 0.4}
          listening={false}
        />
      );
    }
    return lines;
  };

  // ── Ruler rendering ───────────────────────────────────────────────────────
  const renderRuler = () => {
    if (!showRuler) return null;
    const elements: React.ReactNode[] = [];

    // Top ruler background
    elements.push(
      <Rect
        key="ruler-top-bg"
        x={-canvasOffset.x / zoom}
        y={-canvasOffset.y / zoom - RULER_SIZE / zoom}
        width={width / zoom}
        height={RULER_SIZE / zoom}
        fill="#F5F5F5"
        stroke="#E0E0E0"
        strokeWidth={0.5}
        listening={false}
      />
    );

    // Left ruler background
    elements.push(
      <Rect
        key="ruler-left-bg"
        x={-canvasOffset.x / zoom - RULER_SIZE / zoom}
        y={-canvasOffset.y / zoom}
        width={RULER_SIZE / zoom}
        height={height / zoom}
        fill="#F5F5F5"
        stroke="#E0E0E0"
        strokeWidth={0.5}
        listening={false}
      />
    );

    // Ruler ticks and labels (every meter)
    for (let i = 0; i <= currentDesign.room.width; i++) {
      const x = i * PIXELS_PER_METER;
      const tickH = i % 2 === 0 ? 8 : 4;
      elements.push(
        <Line
          key={`rt-x-${i}`}
          points={[x, -tickH / zoom, x, 0]}
          stroke="#757575"
          strokeWidth={0.8}
          listening={false}
        />
      );
      if (i % 2 === 0) {
        elements.push(
          <Text
            key={`rl-x-${i}`}
            x={x + 2}
            y={-RULER_SIZE / zoom + 2}
            text={`${i}m`}
            fontSize={9 / zoom}
            fill="#616161"
            listening={false}
          />
        );
      }
    }

    for (let i = 0; i <= currentDesign.room.length; i++) {
      const y = i * PIXELS_PER_METER;
      const tickW = i % 2 === 0 ? 8 : 4;
      elements.push(
        <Line
          key={`rt-y-${i}`}
          points={[-tickW / zoom, y, 0, y]}
          stroke="#757575"
          strokeWidth={0.8}
          listening={false}
        />
      );
      if (i % 2 === 0) {
        elements.push(
          <Text
            key={`rl-y-${i}`}
            x={-RULER_SIZE / zoom + 2}
            y={y + 2}
            text={`${i}m`}
            fontSize={9 / zoom}
            fill="#616161"
            listening={false}
          />
        );
      }
    }

    return elements;
  };

  // ── Room walls (thick) ────────────────────────────────────────────────────
  const renderRoom = () => {
    const wallColor = currentDesign.room.wallColor;
    const layout = currentDesign.room.layout ?? 'rectangle';

    if (layout === 'rectangle') {
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={roomWidthPx}
            height={roomLengthPx}
            fill={currentDesign.room.floorColor || '#F5E6D0'}
            listening={false}
          />
          <Rect x={0} y={0} width={roomWidthPx} height={WALL_THICKNESS_PX} fill={wallColor} listening={false} />
          <Rect x={0} y={roomLengthPx - WALL_THICKNESS_PX} width={roomWidthPx} height={WALL_THICKNESS_PX} fill={wallColor} listening={false} />
          <Rect x={0} y={0} width={WALL_THICKNESS_PX} height={roomLengthPx} fill={wallColor} listening={false} />
          <Rect x={roomWidthPx - WALL_THICKNESS_PX} y={0} width={WALL_THICKNESS_PX} height={roomLengthPx} fill={wallColor} listening={false} />
          <Rect
            x={0}
            y={0}
            width={roomWidthPx}
            height={roomLengthPx}
            stroke="#424242"
            strokeWidth={1.5}
            fill="transparent"
            listening={false}
          />
          <Text x={roomWidthPx / 2 - 20} y={roomLengthPx + 8} text={`${currentDesign.room.width}m`} fontSize={11} fill="#616161" listening={false} />
          <Text x={roomWidthPx + 8} y={roomLengthPx / 2 - 8} text={`${currentDesign.room.length}m`} fontSize={11} fill="#616161" listening={false} />
        </Group>
      );
    }

    const points = getFloorOutlinePoints(currentDesign.room, PIXELS_PER_METER);
    return (
      <Group>
        {/* Floor fill */}
        <Line
          points={points}
          closed
          fill={currentDesign.room.floorColor || '#F5E6D0'}
          listening={false}
        />
        {/* Walls (thick stroke along outline) */}
        <Line
          points={points}
          closed
          stroke={wallColor}
          strokeWidth={WALL_THICKNESS_PX}
          fill="transparent"
          lineJoin="miter"
          listening={false}
        />
        {/* Outer border */}
        <Line
          points={points}
          closed
          stroke="#424242"
          strokeWidth={1.5}
          fill="transparent"
          listening={false}
        />
        {/* Dimensions labels */}
        <Text x={roomWidthPx / 2 - 20} y={roomLengthPx + 8} text={`${currentDesign.room.width}m`} fontSize={11} fill="#616161" listening={false} />
        <Text x={roomWidthPx + 8} y={roomLengthPx / 2 - 8} text={`${currentDesign.room.length}m`} fontSize={11} fill="#616161" listening={false} />
      </Group>
    );
  };

  // ── Snap logic ────────────────────────────────────────────────────────────
  const computeSnap = useCallback(
    (
      itemId: string,
      rawPxX: number,
      rawPxY: number,
      itemPxW: number,
      itemPxH: number
    ): { x: number; y: number } => {
      if (!currentDesign) return { x: rawPxX, y: rawPxY };

      if (!showAlignmentGuides) {
        if (snapToGrid) {
          return {
            x: Math.round(rawPxX / gridSizePx) * gridSizePx,
            y: Math.round(rawPxY / gridSizePx) * gridSizePx,
          };
        }
        return { x: rawPxX, y: rawPxY };
      }

      const targetsX = computeSnapTargetsX(
        currentDesign.room.width,
        PIXELS_PER_METER,
        currentDesign.furniture,
        furniture,
        itemId
      );
      const targetsY = computeSnapTargetsY(
        currentDesign.room.length,
        PIXELS_PER_METER,
        currentDesign.furniture,
        furniture,
        itemId
      );

      // Try snapping left edge, center, right edge
      const leftX = findSnap(rawPxX, targetsX);
      const centerX = findSnap(rawPxX + itemPxW / 2, targetsX);
      const rightX = findSnap(rawPxX + itemPxW, targetsX);

      let snappedX = rawPxX;
      let guideX: number | null = null;
      let labelX: string | undefined;

      if (leftX.guide !== null) {
        snappedX = leftX.snapped;
        guideX = leftX.guide;
        labelX = leftX.label;
      } else if (centerX.guide !== null) {
        snappedX = centerX.snapped - itemPxW / 2;
        guideX = centerX.guide;
        labelX = centerX.label;
      } else if (rightX.guide !== null) {
        snappedX = rightX.snapped - itemPxW;
        guideX = rightX.guide;
        labelX = rightX.label;
      } else if (snapToGrid) {
        snappedX = Math.round(rawPxX / gridSizePx) * gridSizePx;
      }

      const topY = findSnap(rawPxY, targetsY);
      const centerY = findSnap(rawPxY + itemPxH / 2, targetsY);
      const bottomY = findSnap(rawPxY + itemPxH, targetsY);

      let snappedY = rawPxY;
      let guideY: number | null = null;
      let labelY: string | undefined;

      if (topY.guide !== null) {
        snappedY = topY.snapped;
        guideY = topY.guide;
        labelY = topY.label;
      } else if (centerY.guide !== null) {
        snappedY = centerY.snapped - itemPxH / 2;
        guideY = centerY.guide;
        labelY = centerY.label;
      } else if (bottomY.guide !== null) {
        snappedY = bottomY.snapped - itemPxH;
        guideY = bottomY.guide;
        labelY = bottomY.label;
      } else if (snapToGrid) {
        snappedY = Math.round(rawPxY / gridSizePx) * gridSizePx;
      }

      setLocalSnapGuides({ x: guideX, y: guideY, xLabel: labelX, yLabel: labelY });
      dispatch(setSnapGuides({ x: guideX, y: guideY, xLabel: labelX, yLabel: labelY }));

      return { x: snappedX, y: snappedY };
    },
    [currentDesign, furniture, showAlignmentGuides, snapToGrid, gridSizePx, dispatch]
  );

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'measure') return;
    if (e.evt.shiftKey) {
      const next = selectedFurnitureIds.includes(id)
        ? selectedFurnitureIds.filter(fid => fid !== id)
        : [...selectedFurnitureIds, id];
      dispatch(setSelectedFurnitureIds(next));
    } else {
      dispatch(setSelectedFurnitureIds([id]));
    }
  };

  const handleDragMove = (
    id: string,
    e: Konva.KonvaEventObject<DragEvent>,
    itemPxW: number,
    itemPxH: number
  ) => {
    if (!currentDesign) return;
    const node = e.target;
    const rawX = node.x();
    const rawY = node.y();

    const { x: snappedX, y: snappedY } = computeSnap(id, rawX, rawY, itemPxW, itemPxH);
    node.x(snappedX);
    node.y(snappedY);
  };

  const handleDragEnd = (
    id: string,
    e: Konva.KonvaEventObject<DragEvent>,
    furnitureWidth: number,
    furnitureLength: number
  ) => {
    if (!currentDesign) return;
    const node = e.target;
    const xM = Math.max(0, Math.min(node.x() / PIXELS_PER_METER, currentDesign.room.width - furnitureWidth));
    const yM = Math.max(0, Math.min(node.y() / PIXELS_PER_METER, currentDesign.room.length - furnitureLength));

    dispatch(updateFurnitureInDesign({ id, updates: { position: { x: xM, y: yM } } }));
    node.x(xM * PIXELS_PER_METER);
    node.y(yM * PIXELS_PER_METER);

    setLocalSnapGuides({ x: null, y: null });
    dispatch(clearSnapGuides());
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    dispatch(updateFurnitureInDesign({
      id,
      updates: {
        rotation: node.rotation() % 360,
        scale: Math.max(0.5, Math.min(2.0, node.scaleX())),
      },
    }));
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      dispatch(clearSelection());
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#ECEFF1',
        borderRadius: 2,
      }}
    >
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        x={canvasOffset.x}
        y={canvasOffset.y}
        onClick={handleStageClick}
        style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
      >
        {/* ── Room layer (grid + floor + walls) ── */}
        <Layer>
          {renderRoom()}
          {renderGrid()}
          {renderRuler()}
        </Layer>

        {/* ── Furniture layer ── */}
        <Layer>
          {currentDesign.furniture.map(item => {
            const furnitureData = furniture.find(f => f._id === item.furnitureId);
            if (!furnitureData) return null;
            const itemPxW = furnitureData.dimensions.width * PIXELS_PER_METER * item.scale;
            const itemPxH = furnitureData.dimensions.length * PIXELS_PER_METER * item.scale;

            return (
              <Canvas2DFurnitureItem
                key={item.id}
                item={item}
                furniture={furnitureData}
                isSelected={selectedFurnitureIds.includes(item.id)}
                pixelsPerMeter={PIXELS_PER_METER}
                onSelect={handleSelect}
                onDragMove={(id, e) => handleDragMove(id, e, itemPxW, itemPxH)}
                onDragEnd={(id, e) =>
                  handleDragEnd(
                    id,
                    e,
                    furnitureData.dimensions.width,
                    furnitureData.dimensions.length
                  )
                }
                onTransformEnd={handleTransformEnd}
              />
            );
          })}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={[
              'top-left', 'top-right', 'bottom-left', 'bottom-right',
              'middle-left', 'middle-right', 'top-center', 'bottom-center',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
            anchorStroke="#1565C0"
            anchorFill="#E3F2FD"
            anchorSize={8}
            borderStroke="#1565C0"
            borderStrokeWidth={1.5}
            borderDash={[4, 2]}
          />
        </Layer>

        {/* ── Snap guide layer ── */}
        {showAlignmentGuides && (
          <SnapGuideLayer
            roomWidth={currentDesign.room.width}
            roomLength={currentDesign.room.length}
            pixelsPerMeter={PIXELS_PER_METER}
            canvasWidth={width}
            canvasHeight={height}
            snapGuides={localSnapGuides}
          />
        )}

        {/* ── Measurement layer ── */}
        <Layer>
          <MeasurementLayer
            isActive={tool === 'measure'}
            pixelsPerMeter={PIXELS_PER_METER}
            onMeasurementComplete={distance => {
              console.info('Measurement:', distance.toFixed(2), 'm');
            }}
          />
        </Layer>
      </Stage>
    </Paper>
  );
};

export default Canvas2DEditor;
