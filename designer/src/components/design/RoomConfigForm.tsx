import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { RoomConfig, RoomOpening, RoomLayout, CutoutPosition } from '@/types/design.types';
import { GLASS } from '@/theme/tokens';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface RoomConfigFormProps {
  initialConfig: RoomConfig;
  onApply: (config: RoomConfig) => void;
}

const DEFAULT_OPENING: Omit<RoomOpening, 'id'> = {
  type: 'door',
  wall: 'north',
  width: 0.9,
  height: 2.1,
  bottom: 0,
  offset: 1,
};

export const RoomConfigForm: React.FC<RoomConfigFormProps> = ({ initialConfig, onApply }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const glass = isDark ? GLASS.dark : GLASS.light;

  const { control, watch, setValue, getValues, subscribe } = useForm<RoomConfig>({
    defaultValues: {
      ...initialConfig,
      layout: initialConfig.layout ?? 'rectangle',
      cutoutPosition: initialConfig.cutoutPosition ?? 'bottom-right',
      cutoutWidth: initialConfig.cutoutWidth ?? 2,
      cutoutLength: initialConfig.cutoutLength ?? 2,
      wallTexture: initialConfig.wallTexture ?? '',
      floorTexture: initialConfig.floorTexture ?? '',
      wallTextureScale: initialConfig.wallTextureScale ?? 1,
      floorTextureScale: initialConfig.floorTextureScale ?? 1,
      openings: initialConfig.openings ?? [],
    },
  });

  const { fields: openingFields, append, remove } = useFieldArray({
    control,
    name: 'openings',
    keyName: 'fieldId',
  });

  const wallColor = watch('wallColor');
  const floorColor = watch('floorColor');
  const wallTexture = watch('wallTexture');
  const floorTexture = watch('floorTexture');
  const layout = watch('layout') ?? 'rectangle';
  const needsCutout = layout !== 'rectangle';

  useEffect(() => {
    let isFirst = true;
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (isFirst) {
          isFirst = false;
          return;
        }
        if (values) onApply(values as RoomConfig);
      },
    });
    return unsubscribe;
  }, [subscribe, onApply]);

  const cornerPositions: CutoutPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const sidePositions: CutoutPosition[] = ['top', 'bottom', 'left', 'right'];

  useEffect(() => {
    if (!needsCutout) return;
    const pos = getValues('cutoutPosition') as CutoutPosition | undefined;
    if (layout === 't-shape' || layout === 'u-shape') {
      if (pos && cornerPositions.includes(pos)) setValue('cutoutPosition', 'bottom');
    } else if (layout === 'l-shape' || layout === 'angled-bay') {
      if (pos && sidePositions.includes(pos)) setValue('cutoutPosition', 'bottom-right');
    }
  }, [layout, needsCutout, setValue, getValues]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Room Configuration
      </Typography>

      <Box component="div">
        <Stack spacing={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">Dimensions (meters)</Typography>
              <Tooltip
                arrow
                placement="right"
                title={
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      Width: Min 2m, Max 30m
                    </Typography>
                    <Typography variant="body2">
                      Length: Min 2m, Max 30m
                    </Typography>
                    <Typography variant="body2">
                      Height: Min 1m, Max 5m
                    </Typography>
                  </Box>
                }
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: glass.background,
                      color: theme.palette.text.primary,
                      border: `1px solid ${glass.border}`,
                      borderRadius: 2,
                      boxSizing: 'border-box',
                      backdropFilter: `blur(${glass.blur}px)`,
                      WebkitBackdropFilter: `blur(${glass.blur}px)`,
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(0,0,0,0.4)'
                          : '0 8px 32px rgba(0,0,0,0.08)',
                      maxWidth: 220,
                    },
                  },
                  arrow: {
                    sx: {
                      color: glass.background,
                      '&::before': {
                        border: `1px solid ${glass.border}`,
                      },
                    },
                  },
                }}
              >
                <IconButton size="small" aria-label="Dimension limits">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Controller
                  name="width"
                  control={control}
                  rules={{ min: 2, max: 30 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Width"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 2, max: 30, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="length"
                  control={control}
                  rules={{ min: 2, max: 30 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Length"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 2, max: 30, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="height"
                  control={control}
                  rules={{ min: 1, max: 5 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Height"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 1, max: 5, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Room Layout
            </Typography>
            <Controller
              name="layout"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    {...field}
                    value={field.value ?? 'rectangle'}
                    displayEmpty
                    renderValue={(v) => {
                      const labels: Record<RoomLayout, string> = {
                        rectangle: 'Rectangle',
                        'l-shape': 'L shape',
                        't-shape': 'T shape',
                        'u-shape': 'U shape',
                        'angled-bay': 'Angled Bay',
                      };
                      return labels[v as RoomLayout] ?? v;
                    }}
                  >
                    <MenuItem value="rectangle">Rectangle</MenuItem>
                    <MenuItem value="l-shape">L shape</MenuItem>
                    <MenuItem value="t-shape">T shape</MenuItem>
                    <MenuItem value="u-shape">U shape</MenuItem>
                    <MenuItem value="angled-bay">Angled Bay</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {needsCutout && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cutout
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="cutoutPosition"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel id="cutout-position-label">Cutout position</InputLabel>
                        <Select
                          {...field}
                          value={
                            layout === 't-shape' || layout === 'u-shape'
                              ? (cornerPositions.includes((field.value as CutoutPosition) ?? '') ? 'bottom' : (field.value ?? 'bottom'))
                              : (sidePositions.includes((field.value as CutoutPosition) ?? '') ? 'bottom-right' : (field.value ?? 'bottom-right'))
                          }
                          labelId="cutout-position-label"
                          label="Cutout position"
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          {(layout === 'l-shape' || layout === 'angled-bay') && [
                            <MenuItem key="top-left" value="top-left">Top left</MenuItem>,
                            <MenuItem key="top-right" value="top-right">Top right</MenuItem>,
                            <MenuItem key="bottom-left" value="bottom-left">Bottom left</MenuItem>,
                            <MenuItem key="bottom-right" value="bottom-right">Bottom right</MenuItem>,
                          ]}
                          {(layout === 't-shape' || layout === 'u-shape') && [
                            <MenuItem key="top" value="top">Top</MenuItem>,
                            <MenuItem key="bottom" value="bottom">Bottom</MenuItem>,
                            <MenuItem key="left" value="left">Left</MenuItem>,
                            <MenuItem key="right" value="right">Right</MenuItem>,
                          ]}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="cutoutWidth"
                    control={control}
                    rules={{ min: 0.5 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cutout width (m)"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 0.5, max: 30, step: 0.1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="cutoutLength"
                    control={control}
                    rules={{ min: 0.5 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cutout length (m)"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 0.5, max: 30, step: 0.1 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Wall Color
            </Typography>
            <HexColorPicker
              color={wallColor}
              onChange={(color) => setValue('wallColor', color)}
              style={{ width: '100%', height: 150 }}
            />
            <TextField
              value={wallColor}
              onChange={(e) => setValue('wallColor', e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Floor Color
            </Typography>
            <HexColorPicker
              color={floorColor}
              onChange={(color) => setValue('floorColor', color)}
              style={{ width: '100%', height: 150 }}
            />
            <TextField
              value={floorColor}
              onChange={(e) => setValue('floorColor', e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Wall & Floor Textures */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Wall Texture
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="wall-texture-label">Preset</InputLabel>
              <Controller
                name="wallTexture"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || ''}
                    labelId="wall-texture-label"
                    label="Preset"
                  >
                    <MenuItem value="">None (Color Only)</MenuItem>
                    <MenuItem value="wall-concrete">Concrete</MenuItem>
                    <MenuItem value="wall-brick">Brick</MenuItem>
                    <MenuItem value="wall-plaster">Plaster</MenuItem>
                    <MenuItem value="wall-wallpaper">Wallpaper</MenuItem>
                    {field.value &&
                      !['wall-concrete', 'wall-brick', 'wall-plaster', 'wall-wallpaper'].includes(
                        field.value,
                      ) && <MenuItem value={field.value}>Custom (from URL)</MenuItem>}
                  </Select>
                )}
              />
            </FormControl>
            <TextField
              label="Custom Wall Texture URL"
              value={wallTexture || ''}
              onChange={(e) => setValue('wallTexture', e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
            <Controller
              name="wallTextureScale"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Wall Texture Tiling"
                  type="number"
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                  inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                />
              )}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Floor Texture
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="floor-texture-label">Preset</InputLabel>
              <Controller
                name="floorTexture"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || ''}
                    labelId="floor-texture-label"
                    label="Preset"
                  >
                    <MenuItem value="">None (Color Only)</MenuItem>
                    <MenuItem value="floor-wood-light">Light Wood</MenuItem>
                    <MenuItem value="floor-wood-dark">Dark Wood</MenuItem>
                    <MenuItem value="floor-tile">Tile</MenuItem>
                    <MenuItem value="floor-carpet">Carpet</MenuItem>
                    {field.value &&
                      !['floor-wood-light', 'floor-wood-dark', 'floor-tile', 'floor-carpet'].includes(
                        field.value,
                      ) && <MenuItem value={field.value}>Custom (from URL)</MenuItem>}
                  </Select>
                )}
              />
            </FormControl>
            <TextField
              label="Custom Floor Texture URL"
              value={floorTexture || ''}
              onChange={(e) => setValue('floorTexture', e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
            <Controller
              name="floorTextureScale"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Floor Texture Tiling"
                  type="number"
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                  inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                />
              )}
            />
          </Box>

          {/* Doors & Windows */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Doors &amp; Windows
            </Typography>
            <Box display="flex" gap={1} sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    ...DEFAULT_OPENING,
                    id: crypto.randomUUID(),
                  })
                }
              >
                Add Door
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    ...DEFAULT_OPENING,
                    id: crypto.randomUUID(),
                    type: 'window',
                    bottom: 1,
                    height: 1.2,
                  })
                }
              >
                Add Window
              </Button>
            </Box>

            {openingFields.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No doors or windows defined. Use the buttons above to add openings.
              </Typography>
            )}

            <Stack spacing={2}>
              {openingFields.map((field, index) => (
                <Paper key={field.fieldId} variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="body2" fontWeight={600}>
                      Opening {index + 1}
                    </Typography>
                    <IconButton size="small" onClick={() => remove(index)} aria-label={`Remove opening ${index + 1}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.type`}
                        control={control}
                        render={({ field: openingField }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel id={`opening-type-label-${index}`}>Type</InputLabel>
                            <Select
                              {...openingField}
                              labelId={`opening-type-label-${index}`}
                              label="Type"
                            >
                              <MenuItem value="door">Door</MenuItem>
                              <MenuItem value="window">Window</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.wall`}
                        control={control}
                        render={({ field: openingField }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel id={`opening-wall-label-${index}`}>Wall</InputLabel>
                            <Select
                              {...openingField}
                              labelId={`opening-wall-label-${index}`}
                              label="Wall"
                            >
                              <MenuItem value="north">North (back)</MenuItem>
                              <MenuItem value="south">South (front)</MenuItem>
                              <MenuItem value="east">East (right)</MenuItem>
                              <MenuItem value="west">West (left)</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.width`}
                        control={control}
                        render={({ field: openingField }) => (
                          <TextField
                            {...openingField}
                            label="Width (m)"
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0.3, max: 5, step: 0.1 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.height`}
                        control={control}
                        render={({ field: openingField }) => (
                          <TextField
                            {...openingField}
                            label="Height (m)"
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0.3, max: 5, step: 0.1 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.bottom`}
                        control={control}
                        render={({ field: openingField }) => (
                          <TextField
                            {...openingField}
                            label="Bottom (m from floor)"
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0, max: 5, step: 0.1 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`openings.${index}.offset`}
                        control={control}
                        render={({ field: openingField }) => (
                          <TextField
                            {...openingField}
                            label="Offset along wall (m)"
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0, step: 0.1 }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RoomConfigForm;
