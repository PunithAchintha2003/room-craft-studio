import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Divider,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { HexColorPicker } from 'react-colorful';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { updateFurnitureInDesign, removeFurnitureFromDesign } from '@/features/design/designSlice';
import { clearSelection } from '@/features/editor/editorSlice';
import { GLASS } from '@/theme/tokens';

export const FurniturePropertiesPanel: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const glass = isDark ? GLASS.dark : GLASS.light;
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

  const emptyStateSx = {
    height: '100%',
    p: 2,
    background: glass.background,
    border: `1px solid ${glass.border}`,
    borderRadius: 2,
    margin: 1,
    mx: 2,
    mb: 2,
    backdropFilter: `blur(${glass.blur}px)`,
    WebkitBackdropFilter: `blur(${glass.blur}px)`,
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.06)',
  };

  const alertSx = {
    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${glass.border}`,
    '& .MuiAlert-message': { color: 'text.primary' },
  };

  if (!currentDesign) {
    return (
      <Box sx={emptyStateSx}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Properties
        </Typography>
        <Alert severity="info" sx={alertSx}>Create or load a design to view properties</Alert>
      </Box>
    );
  }

  if (selectedFurnitureIds.length === 0) {
    return (
      <Box sx={emptyStateSx}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Properties
        </Typography>
        <Alert severity="info" sx={alertSx}>Select furniture to edit properties</Alert>
      </Box>
    );
  }

  if (selectedFurnitureIds.length > 1) {
    return (
      <Box sx={emptyStateSx}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Properties
        </Typography>
        <Alert severity="info" sx={alertSx}>
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
      </Box>
    );
  }

  if (!selectedItem || !furnitureData) {
    return (
      <Box sx={emptyStateSx}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Properties
        </Typography>
        <Alert severity="error" sx={alertSx}>Selected furniture not found</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        mx: 2,
        mb: 2,
        borderRadius: 2,
        background: glass.background,
        border: `1px solid ${glass.border}`,
        backdropFilter: `blur(${glass.blur}px)`,
        WebkitBackdropFilter: `blur(${glass.blur}px)`,
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${glass.border}` }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {furnitureData.name}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.primary">
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

          <Divider sx={{ borderColor: glass.border }} />

          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.primary">
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

          <Divider sx={{ borderColor: glass.border }} />

          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.primary">
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
              <Divider sx={{ borderColor: glass.border }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom color="text.primary">
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

          <Divider sx={{ borderColor: glass.border }} />

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

      <Box sx={{ p: 2, borderTop: `1px solid ${glass.border}` }}>
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
    </Box>
  );
};

export default FurniturePropertiesPanel;
