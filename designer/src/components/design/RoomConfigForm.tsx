import React from 'react';
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
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { RoomConfig, RoomOpening } from '@/types/design.types';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

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
  const { control, handleSubmit, watch, setValue } = useForm<RoomConfig>({
    defaultValues: {
      ...initialConfig,
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

  const onSubmit = (data: RoomConfig) => {
    onApply(data);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Room Configuration
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Dimensions (meters)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="width"
                  control={control}
                  rules={{ min: 1, max: 20 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Width"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 1, max: 20, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="length"
                  control={control}
                  rules={{ min: 1, max: 20 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Length"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 1, max: 20, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="height"
                  control={control}
                  rules={{ min: 2, max: 5 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Height"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 2, max: 5, step: 0.1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">Doors &amp; Windows</Typography>
              <Box display="flex" gap={1}>
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
            </Box>

            {openingFields.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No doors or windows defined. Use the buttons above to add openings.
              </Typography>
            )}

            <Stack spacing={2} mt={1}>
              {openingFields.map((field, index) => (
                <Paper
                  key={field.fieldId}
                  variant="outlined"
                  sx={{ p: 1.5, borderStyle: 'dashed' }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight={600}>
                      Opening {index + 1}
                    </Typography>
                    <IconButton size="small" onClick={() => remove(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={1}>
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

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Apply Changes
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RoomConfigForm;
