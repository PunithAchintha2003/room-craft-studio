import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Slider,
  Chip,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  alpha,
} from '@mui/material';
import TextureIcon from '@mui/icons-material/Texture';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface MaterialConfig {
  type: 'wood' | 'fabric' | 'metal' | 'leather' | 'plastic' | 'glass';
  color: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
  textureName?: string;
}

interface MaterialPickerProps {
  selectedMaterial: MaterialConfig;
  onChange: (material: MaterialConfig) => void;
}

// Predefined material presets
const materialPresets: Record<string, MaterialConfig[]> = {
  wood: [
    { type: 'wood', color: '#8B4513', roughness: 0.8, metalness: 0.1, textureName: 'Oak' },
    { type: 'wood', color: '#654321', roughness: 0.7, metalness: 0.1, textureName: 'Walnut' },
    { type: 'wood', color: '#D2B48C', roughness: 0.6, metalness: 0.1, textureName: 'Pine' },
    { type: 'wood', color: '#A0522D', roughness: 0.75, metalness: 0.1, textureName: 'Mahogany' },
    { type: 'wood', color: '#DEB887', roughness: 0.65, metalness: 0.1, textureName: 'Birch' },
    { type: 'wood', color: '#704214', roughness: 0.9, metalness: 0.1, textureName: 'Cherry' },
  ],
  fabric: [
    { type: 'fabric', color: '#F5F5DC', roughness: 0.9, metalness: 0.0, textureName: 'Linen' },
    { type: 'fabric', color: '#4A4A4A', roughness: 0.85, metalness: 0.0, textureName: 'Cotton' },
    { type: 'fabric', color: '#2F4F4F', roughness: 0.8, metalness: 0.0, textureName: 'Velvet' },
    { type: 'fabric', color: '#8B0000', roughness: 0.95, metalness: 0.0, textureName: 'Canvas' },
    { type: 'fabric', color: '#556B2F', roughness: 0.88, metalness: 0.0, textureName: 'Tweed' },
    { type: 'fabric', color: '#F0E68C', roughness: 0.92, metalness: 0.0, textureName: 'Silk' },
  ],
  metal: [
    { type: 'metal', color: '#C0C0C0', roughness: 0.2, metalness: 0.9, textureName: 'Aluminum' },
    { type: 'metal', color: '#B87333', roughness: 0.3, metalness: 0.85, textureName: 'Copper' },
    { type: 'metal', color: '#404040', roughness: 0.4, metalness: 0.9, textureName: 'Steel' },
    { type: 'metal', color: '#FFD700', roughness: 0.1, metalness: 0.95, textureName: 'Gold' },
    { type: 'metal', color: '#708090', roughness: 0.5, metalness: 0.8, textureName: 'Iron' },
    { type: 'metal', color: '#E5E4E2', roughness: 0.15, metalness: 0.92, textureName: 'Chrome' },
  ],
  leather: [
    { type: 'leather', color: '#8B4513', roughness: 0.6, metalness: 0.1, textureName: 'Brown Leather' },
    { type: 'leather', color: '#000000', roughness: 0.5, metalness: 0.15, textureName: 'Black Leather' },
    { type: 'leather', color: '#D2691E', roughness: 0.65, metalness: 0.1, textureName: 'Tan Leather' },
    { type: 'leather', color: '#8B0000', roughness: 0.55, metalness: 0.12, textureName: 'Red Leather' },
    { type: 'leather', color: '#F5DEB3', roughness: 0.7, metalness: 0.08, textureName: 'Beige Leather' },
    { type: 'leather', color: '#2F4F4F', roughness: 0.6, metalness: 0.14, textureName: 'Dark Leather' },
  ],
  plastic: [
    { type: 'plastic', color: '#FFFFFF', roughness: 0.3, metalness: 0.0, textureName: 'White Plastic' },
    { type: 'plastic', color: '#FF0000', roughness: 0.4, metalness: 0.0, textureName: 'Red Plastic' },
    { type: 'plastic', color: '#0000FF', roughness: 0.35, metalness: 0.0, textureName: 'Blue Plastic' },
    { type: 'plastic', color: '#000000', roughness: 0.2, metalness: 0.0, textureName: 'Black Plastic' },
    { type: 'plastic', color: '#FFFF00', roughness: 0.38, metalness: 0.0, textureName: 'Yellow Plastic' },
    { type: 'plastic', color: '#808080', roughness: 0.32, metalness: 0.0, textureName: 'Gray Plastic' },
  ],
  glass: [
    { type: 'glass', color: '#E0F7FA', roughness: 0.05, metalness: 0.0, textureName: 'Clear Glass' },
    { type: 'glass', color: '#B3E5FC', roughness: 0.1, metalness: 0.0, textureName: 'Blue Glass' },
    { type: 'glass', color: '#C8E6C9', roughness: 0.08, metalness: 0.0, textureName: 'Green Glass' },
    { type: 'glass', color: '#F0F4C3', roughness: 0.12, metalness: 0.0, textureName: 'Frosted Glass' },
    { type: 'glass', color: '#FFE0B2', roughness: 0.09, metalness: 0.0, textureName: 'Amber Glass' },
    { type: 'glass', color: '#D1C4E9', roughness: 0.07, metalness: 0.0, textureName: 'Tinted Glass' },
  ],
};

export const MaterialPicker: React.FC<MaterialPickerProps> = ({ selectedMaterial, onChange }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof materialPresets>(selectedMaterial.type);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: keyof typeof materialPresets) => {
    setActiveTab(newValue);
  };

  const handleMaterialSelect = (material: MaterialConfig) => {
    onChange(material);
  };

  const handleRoughnessChange = (_event: Event, value: number | number[]) => {
    onChange({ ...selectedMaterial, roughness: value as number });
  };

  const handleMetalnessChange = (_event: Event, value: number | number[]) => {
    onChange({ ...selectedMaterial, metalness: value as number });
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TextureIcon />
        <Typography variant="h6">Material Picker</Typography>
      </Box>

      {/* Material Type Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Wood" value="wood" />
        <Tab label="Fabric" value="fabric" />
        <Tab label="Metal" value="metal" />
        <Tab label="Leather" value="leather" />
        <Tab label="Plastic" value="plastic" />
        <Tab label="Glass" value="glass" />
      </Tabs>

      {/* Material Presets Grid */}
      <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
        <Grid container spacing={1.5}>
          {materialPresets[activeTab].map((material, index) => (
            <Grid item xs={6} key={index}>
              <Tooltip title={`${material.textureName} - R:${material.roughness} M:${material.metalness}`}>
                <Card
                  onClick={() => handleMaterialSelect(material)}
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    border: 2,
                    borderColor:
                      selectedMaterial.color === material.color &&
                      selectedMaterial.type === material.type
                        ? 'primary.main'
                        : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.light',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 80,
                      bgcolor: material.color,
                      position: 'relative',
                      background: `linear-gradient(135deg, ${material.color} 0%, ${alpha(material.color, 0.7)} 100%)`,
                    }}
                  >
                    {selectedMaterial.color === material.color &&
                      selectedMaterial.type === material.type && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                          }}
                        >
                          <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                      )}
                  </CardMedia>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" fontWeight="bold" noWrap>
                      {material.textureName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label={`R:${material.roughness}`}
                        size="small"
                        sx={{ height: 16, fontSize: '0.65rem' }}
                      />
                      <Chip
                        label={`M:${material.metalness}`}
                        size="small"
                        sx={{ height: 16, fontSize: '0.65rem' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* PBR Property Controls */}
      <Typography variant="subtitle2" gutterBottom>
        PBR Settings
      </Typography>

      {/* Roughness Slider */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Roughness: {selectedMaterial.roughness.toFixed(2)}
        </Typography>
        <Slider
          value={selectedMaterial.roughness}
          onChange={handleRoughnessChange}
          min={0}
          max={1}
          step={0.05}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: 'Smooth' },
            { value: 1, label: 'Rough' },
          ]}
        />
      </Box>

      {/* Metalness Slider */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Metalness: {selectedMaterial.metalness.toFixed(2)}
        </Typography>
        <Slider
          value={selectedMaterial.metalness}
          onChange={handleMetalnessChange}
          min={0}
          max={1}
          step={0.05}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: 'Non-Metal' },
            { value: 1, label: 'Metal' },
          ]}
        />
      </Box>

      {/* Info Box */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Selected:</strong> {selectedMaterial.textureName || selectedMaterial.type}
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          <strong>PBR:</strong> Roughness affects surface smoothness, Metalness determines reflectivity
        </Typography>
      </Box>
    </Paper>
  );
};

export default MaterialPicker;
