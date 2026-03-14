import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { RoomConfig } from '@/types/design.types';

interface RoomConfigFormProps {
  initialConfig: RoomConfig;
  onApply: (config: RoomConfig) => void;
}

export const RoomConfigForm: React.FC<RoomConfigFormProps> = ({ initialConfig, onApply }) => {
  const { control, handleSubmit, watch, setValue } = useForm<RoomConfig>({
    defaultValues: initialConfig,
  });

  const wallColor = watch('wallColor');
  const floorColor = watch('floorColor');

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

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Apply Changes
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RoomConfigForm;
