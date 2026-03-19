import React, { useState } from 'react';
import { Line, Text, Circle, Group } from 'react-konva';
import Konva from 'konva';

interface MeasurementPoint {
  x: number;
  y: number;
}

interface MeasurementLayerProps {
  isActive: boolean;
  pixelsPerMeter: number;
  onMeasurementComplete?: (distance: number) => void;
}

export const MeasurementLayer: React.FC<MeasurementLayerProps> = ({
  isActive,
  pixelsPerMeter,
  onMeasurementComplete,
}) => {
  const [startPoint, setStartPoint] = useState<MeasurementPoint | null>(null);
  const [currentPoint, setCurrentPoint] = useState<MeasurementPoint | null>(null);
  const [measurements, setMeasurements] = useState<
    Array<{ start: MeasurementPoint; end: MeasurementPoint }>
  >([]);

  if (!isActive && !measurements.length) return null;

  const calculateDistance = (p1: MeasurementPoint, p2: MeasurementPoint): number => {
    const dx = (p2.x - p1.x) / pixelsPerMeter;
    const dy = (p2.y - p1.y) / pixelsPerMeter;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const scale = stage.scaleX();
    const clickPos = { x: pos.x / scale, y: pos.y / scale };

    if (!startPoint) {
      setStartPoint(clickPos);
      setCurrentPoint(clickPos);
    } else {
      const distance = calculateDistance(startPoint, clickPos);
      setMeasurements([...measurements, { start: startPoint, end: clickPos }]);
      onMeasurementComplete?.(distance);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !startPoint) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const scale = stage.scaleX();
    setCurrentPoint({ x: pos.x / scale, y: pos.y / scale });
  };

  const renderMeasurementLine = (start: MeasurementPoint, end: MeasurementPoint, isTemp = false) => {
    const distance = calculateDistance(start, end);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    return (
      <Group key={`measurement-${start.x}-${start.y}-${end.x}-${end.y}`}>
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke={isTemp ? '#FF9800' : '#2196F3'}
          strokeWidth={2}
          dash={isTemp ? [5, 5] : undefined}
        />
        <Circle x={start.x} y={start.y} radius={4} fill={isTemp ? '#FF9800' : '#2196F3'} />
        <Circle x={end.x} y={end.y} radius={4} fill={isTemp ? '#FF9800' : '#2196F3'} />

        <Group x={midX} y={midY} rotation={(angle * 180) / Math.PI}>
          <Text
            text={`${distance.toFixed(2)}m`}
            fontSize={14}
            fontStyle="bold"
            fill={isTemp ? '#FF9800' : '#2196F3'}
            offsetX={30}
            offsetY={15}
            padding={4}
            cornerRadius={4}
          />
        </Group>

        <Line
          points={[
            start.x + 5 * Math.sin(angle),
            start.y - 5 * Math.cos(angle),
            start.x - 5 * Math.sin(angle),
            start.y + 5 * Math.cos(angle),
          ]}
          stroke={isTemp ? '#FF9800' : '#2196F3'}
          strokeWidth={2}
        />
        <Line
          points={[
            end.x + 5 * Math.sin(angle),
            end.y - 5 * Math.cos(angle),
            end.x - 5 * Math.sin(angle),
            end.y + 5 * Math.cos(angle),
          ]}
          stroke={isTemp ? '#FF9800' : '#2196F3'}
          strokeWidth={2}
        />
      </Group>
    );
  };

  return (
    <>
      {measurements.map((m, idx) => (
        <React.Fragment key={`completed-${idx}`}>
          {renderMeasurementLine(m.start, m.end, false)}
        </React.Fragment>
      ))}
      {startPoint && currentPoint && renderMeasurementLine(startPoint, currentPoint, true)}

      {isActive && (
        <Group onClick={handleStageClick} onMouseMove={handleStageMouseMove} listening={isActive} />
      )}
    </>
  );
};

export default MeasurementLayer;

