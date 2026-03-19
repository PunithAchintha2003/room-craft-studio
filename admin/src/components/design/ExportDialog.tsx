import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  designName: string;
}

export interface ExportOptions {
  resolution: 'low' | 'medium' | 'high' | 'ultra';
  transparentBackground: boolean;
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  filename: string;
}

const resolutionMap = {
  low: { width: 800, height: 600, label: '800x600 (Low)' },
  medium: { width: 1920, height: 1080, label: '1920x1080 (Full HD)' },
  high: { width: 2560, height: 1440, label: '2560x1440 (2K)' },
  ultra: { width: 3840, height: 2160, label: '3840x2160 (4K)' },
};

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, onExport, designName }) => {
  const [options, setOptions] = useState<ExportOptions>({
    resolution: 'medium',
    transparentBackground: false,
    format: 'png',
    quality: 95,
    filename: designName.replace(/\s+/g, '_').toLowerCase() || 'design',
  });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await onExport(options);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const formatSupportsTransparency = options.format === 'png' || options.format === 'webp';
  const selectedResolution = resolutionMap[options.resolution];
  const estimatedFileSize =
    ((selectedResolution.width * selectedResolution.height * 3) / (100 - options.quality)) / 1024 / 1024;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCameraIcon />
          <Typography variant="h6">Export 3D View</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Filename"
            value={options.filename}
            onChange={(e) => setOptions({ ...options, filename: e.target.value })}
            helperText={`Will be saved as: ${options.filename}.${options.format}`}
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={options.resolution}
            label="Resolution"
            onChange={(e) => setOptions({ ...options, resolution: e.target.value as ExportOptions['resolution'] })}
          >
            <MenuItem value="low">
              <Box>
                <Typography variant="body2">{resolutionMap.low.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Quick export, smaller file size
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="medium">
              <Box>
                <Typography variant="body2">{resolutionMap.medium.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Balanced quality and size
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="high">
              <Box>
                <Typography variant="body2">{resolutionMap.high.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  High quality for presentations
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="ultra">
              <Box>
                <Typography variant="body2">{resolutionMap.ultra.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ultra HD for print materials
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Format</InputLabel>
          <Select
            value={options.format}
            label="Format"
            onChange={(e) => setOptions({ ...options, format: e.target.value as ExportOptions['format'] })}
          >
            <MenuItem value="png">PNG (Lossless, supports transparency)</MenuItem>
            <MenuItem value="jpeg">JPEG (Compressed, smaller size)</MenuItem>
            <MenuItem value="webp">WebP (Modern, efficient compression)</MenuItem>
          </Select>
        </FormControl>

        {options.format !== 'png' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Quality: {options.quality}%
            </Typography>
            <Box sx={{ px: 1 }}>
              <input
                type="range"
                min="50"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </Box>
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={options.transparentBackground}
              onChange={(e) => setOptions({ ...options, transparentBackground: e.target.checked })}
              disabled={!formatSupportsTransparency}
            />
          }
          label={
            <Box>
              <Typography variant="body2">Transparent Background</Typography>
              {!formatSupportsTransparency && (
                <Typography variant="caption" color="text.secondary">
                  Only available for PNG and WebP formats
                </Typography>
              )}
            </Box>
          }
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip
              label={`${selectedResolution.width}x${selectedResolution.height}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip label={options.format.toUpperCase()} size="small" color="primary" variant="outlined" />
            {options.transparentBackground && (
              <Chip label="Transparent" size="small" color="primary" variant="outlined" />
            )}
            <Chip label={`~${estimatedFileSize.toFixed(1)} MB`} size="small" color="primary" variant="outlined" />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
          disabled={exporting || !options.filename}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;

