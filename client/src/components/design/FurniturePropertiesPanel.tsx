import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Slider,
  Button,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { HexColorPicker } from 'react-colorful';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { updateFurnitureInDesign, removeFurnitureFromDesign } from '@/features/design/designSlice';
import { clearSelection } from '@/features/editor/editorSlice';

export const FurniturePropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const currentDesign = useSelector((state: RootState) => state.design.currentDesign);
  const { selectedFurnitureIds } = useSelector((state: RootState) => state.editor);
  const furniture = useSelector((state: RootState) => state.furniture.furniture);

  const selectedItem =
    currentDesign && selectedFurnitureIds.length === 1
      ? currentDesign.furniture.find((f) => f.id === selectedFurnitureIds[0])
      : null;

  const furnitureData = selectedItem
    ? furniture.find((f) => f._id === selectedItem.furnitureId)
    : null;

  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [localRotation, setLocalRotation] = useState(0);
  const [localScale, setLocalScale] = useState(1);
  const [localColor, setLocalColor] = useState('#8B4513');

  useEffect(() => {
    if (selectedItem) {
      setLocalPosition(selectedItem.position);
      setLocalRotation(selectedItem.rotation);
      setLocalScale(selectedItem.scale);
      setLocalColor(selectedItem.color || '#8B4513');
    }
  }, [selectedItem]);

  const handleUpdatePosition = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || !selectedItem) return;

    const newPosition = { ...localPosition, [axis]: numValue };
    setLocalPosition(newPosition);
    
    dispatch(
      updateFurnitureInDesign({
        id: selectedItem.id,
        updates: { position: newPosition },
      })
    );
  };

  const handleUpdateRotation = (_event: Event, value: number | number[]) => {
    if (!selectedItem) return;
    const rotation = Array.isArray(value) ? value[0] : value;
    setLocalRotation(rotation);
    
    dispatch(
      updateFurnitureInDesign({
        id: selectedItem.id,
        updates: { rotation },
      })
    );
  };

  const handleUpdateScale = (_event: Event, value: number | number[]) => {
    if (!selectedItem) return;
    const scale = Array.isArray(value) ? value[0] : value;
    setLocalScale(scale);
    
    dispatch(
      updateFurnitureInDesign({
        id: selectedItem.id,
        updates: { scale },
      })
    );
  };

  const handleUpdateColor = (color: string) => {
    if (!selectedItem || !furnitureData?.isColorizable) return;
    setLocalColor(color);
    
    dispatch(
      updateFurnitureInDesign({
        id: selectedItem.id,
        updates: { color },
      })
    );
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    dispatch(removeFurnitureFromDesign(selectedItem.id));
    dispatch(clearSelection());
  };

  if (!currentDesign) {
    return (
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Alert severity="info">Create or load a design to view properties</Alert>
      </Paper>
    );
  }

  if (selectedFurnitureIds.length === 0) {
    return (
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Alert severity="info">Select furniture to edit properties</Alert>
      </Paper>
    );
  }

  if (selectedFurnitureIds.length > 1) {
    return (
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Alert severity="info">
          {selectedFurnitureIds.length} items selected
        </Alert>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => {
            selectedFurnitureIds.forEach((id) => {
              dispatch(removeFurnitureFromDesign(id));
            });
            dispatch(clearSelection());
          }}
          sx={{ mt: 2 }}
        >
          Delete All Selected
        </Button>
      </Paper>
    );
  }

  if (!selectedItem || !furnitureData) {
    return (
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Alert severity="error">Selected furniture not found</Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {furnitureData.name}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Position (meters)
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="X"
                type="number"
                size="small"
                fullWidth
                value={localPosition.x.toFixed(2)}
                onChange={(e) => handleUpdatePosition('x', e.target.value)}
                inputProps={{ step: 0.1, min: 0, max: currentDesign.room.width }}
              />
              <TextField
                label="Y"
                type="number"
                size="small"
                fullWidth
                value={localPosition.y.toFixed(2)}
                onChange={(e) => handleUpdatePosition('y', e.target.value)}
                inputProps={{ step: 0.1, min: 0, max: currentDesign.room.length }}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Rotation: {localRotation.toFixed(0)}°
            </Typography>
            <Slider
              value={localRotation}
              onChange={handleUpdateRotation}
              min={0}
              max={360}
              step={15}
              marks={[
                { value: 0, label: '0°' },
                { value: 90, label: '90°' },
                { value: 180, label: '180°' },
                { value: 270, label: '270°' },
                { value: 360, label: '360°' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Scale: {localScale.toFixed(2)}x
            </Typography>
            <Slider
              value={localScale}
              onChange={handleUpdateScale}
              min={0.5}
              max={2.0}
              step={0.1}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1.0, label: '1x' },
                { value: 1.5, label: '1.5x' },
                { value: 2.0, label: '2x' },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Dimensions: {(furnitureData.dimensions.width * localScale).toFixed(2)}m × 
              {' '}{(furnitureData.dimensions.length * localScale).toFixed(2)}m
            </Typography>
          </Box>

          {furnitureData.isColorizable && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <HexColorPicker color={localColor} onChange={handleUpdateColor} />
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Hex Color"
                  value={localColor}
                  onChange={(e) => handleUpdateColor(e.target.value)}
                  inputProps={{ maxLength: 7 }}
                />
              </Box>
            </>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Dimensions (Original)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Width: {furnitureData.dimensions.width}m<br />
              Length: {furnitureData.dimensions.length}m<br />
              Height: {furnitureData.dimensions.height}m
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete Furniture
        </Button>
      </Box>
    </Paper>
  );
};

export default FurniturePropertiesPanel;
