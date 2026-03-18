import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Tooltip,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness5Icon from '@mui/icons-material/Brightness5';

export interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  hemisphereIntensity: number;
  shadowsEnabled: boolean;
  timeOfDay: 'morning' | 'noon' | 'evening' | 'night';
}

interface LightingControlPanelProps {
  config: LightingConfig;
  onChange: (config: LightingConfig) => void;
}

export const LightingControlPanel: React.FC<LightingControlPanelProps> = ({ config, onChange }) => {
  const handleAmbientChange = (_event: Event, value: number | number[]) => {
    onChange({ ...config, ambientIntensity: value as number });
  };

  const handleDirectionalChange = (_event: Event, value: number | number[]) => {
    onChange({ ...config, directionalIntensity: value as number });
  };

  const handleHemisphereChange = (_event: Event, value: number | number[]) => {
    onChange({ ...config, hemisphereIntensity: value as number });
  };

  const handleShadowsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, shadowsEnabled: event.target.checked });
  };

  const handleTimeOfDayChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'morning' | 'noon' | 'evening' | 'night' | null
  ) => {
    if (newValue) {
      onChange({ ...config, timeOfDay: newValue });
      // Apply preset lighting values based on time of day
      applyTimeOfDayPreset(newValue);
    }
  };

  const applyTimeOfDayPreset = (time: 'morning' | 'noon' | 'evening' | 'night') => {
    const presets: Record<string, Partial<LightingConfig>> = {
      morning: {
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        hemisphereIntensity: 0.5,
        shadowsEnabled: true,
        timeOfDay: 'morning',
      },
      noon: {
        ambientIntensity: 0.6,
        directionalIntensity: 1.2,
        hemisphereIntensity: 0.4,
        shadowsEnabled: true,
        timeOfDay: 'noon',
      },
      evening: {
        ambientIntensity: 0.3,
        directionalIntensity: 0.6,
        hemisphereIntensity: 0.6,
        shadowsEnabled: true,
        timeOfDay: 'evening',
      },
      night: {
        ambientIntensity: 0.2,
        directionalIntensity: 0.3,
        hemisphereIntensity: 0.8,
        shadowsEnabled: false,
        timeOfDay: 'night',
      },
    };

    onChange({ ...config, ...presets[time] });
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Brightness5Icon />
        <Typography variant="h6">Lighting Controls</Typography>
      </Box>

      {/* Time of Day Presets */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Time of Day Presets
        </Typography>
        <ToggleButtonGroup
          value={config.timeOfDay}
          exclusive
          onChange={handleTimeOfDayChange}
          size="small"
          fullWidth
          sx={{ mt: 1 }}
        >
          <ToggleButton value="morning">
            <Tooltip title="Morning - Soft warm light">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <WbTwilightIcon fontSize="small" />
                <Typography variant="caption">Morning</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="noon">
            <Tooltip title="Noon - Bright overhead light">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <WbSunnyIcon fontSize="small" />
                <Typography variant="caption">Noon</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="evening">
            <Tooltip title="Evening - Warm golden hour">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <LightModeIcon fontSize="small" />
                <Typography variant="caption">Evening</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="night">
            <Tooltip title="Night - Dim ambient light">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <DarkModeIcon fontSize="small" />
                <Typography variant="caption">Night</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Manual Controls */}
      <Typography variant="subtitle2" gutterBottom>
        Manual Adjustments
      </Typography>

      {/* Ambient Light Intensity */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ambient Intensity
        </Typography>
        <Slider
          value={config.ambientIntensity}
          onChange={handleAmbientChange}
          min={0}
          max={2}
          step={0.1}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]}
        />
      </Box>

      {/* Directional Light Intensity */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Directional Intensity
        </Typography>
        <Slider
          value={config.directionalIntensity}
          onChange={handleDirectionalChange}
          min={0}
          max={2}
          step={0.1}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]}
        />
      </Box>

      {/* Hemisphere Light Intensity */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Hemisphere Intensity
        </Typography>
        <Slider
          value={config.hemisphereIntensity}
          onChange={handleHemisphereChange}
          min={0}
          max={2}
          step={0.1}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Shadows Toggle */}
      <FormControlLabel
        control={<Switch checked={config.shadowsEnabled} onChange={handleShadowsToggle} />}
        label={
          <Tooltip title="Enable or disable shadow rendering for better performance">
            <Typography variant="body2">Enable Shadows</Typography>
          </Tooltip>
        }
      />

      {/* Info hint */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Use presets for quick setup, then fine-tune with manual controls
        </Typography>
      </Box>
    </Paper>
  );
};

export default LightingControlPanel;
