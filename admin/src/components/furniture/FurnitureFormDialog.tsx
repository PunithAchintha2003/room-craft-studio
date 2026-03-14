import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import type { Furniture, FurnitureCategory } from '@/types/design.types';
import type { CreateFurnitureInput, UpdateFurnitureInput } from '@/features/furniture/furnitureSlice';

type Mode = 'create' | 'edit';

interface FurnitureFormDialogProps {
  open: boolean;
  mode: Mode;
  initialValue?: Furniture;
  onClose: () => void;
  onSubmit: (values: CreateFurnitureInput | UpdateFurnitureInput) => Promise<void> | void;
  isSubmitting: boolean;
}

const CATEGORY_OPTIONS: FurnitureCategory[] = ['chair', 'table', 'sofa', 'bed', 'storage'];

export const FurnitureFormDialog: React.FC<FurnitureFormDialogProps> = ({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FurnitureCategory>('chair');
  const [width, setWidth] = useState<string>('1');
  const [length, setLength] = useState<string>('1');
  const [height, setHeight] = useState<string>('1');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailAlt, setThumbnailAlt] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [modelFormat, setModelFormat] = useState<'gltf' | 'glb'>('glb');
  const [defaultColor, setDefaultColor] = useState('#8B4513');
  const [isColorizable, setIsColorizable] = useState(true);
  const [price, setPrice] = useState<string>('0');
  const [stock, setStock] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialValue && mode === 'edit') {
      setName(initialValue.name);
      setCategory(initialValue.category);
      setWidth(String(initialValue.dimensions.width));
      setLength(String(initialValue.dimensions.length));
      setHeight(String(initialValue.dimensions.height));
      setThumbnail(initialValue.thumbnail);
      setThumbnailAlt(initialValue.thumbnailAlt ?? '');
      setModelUrl(initialValue.model3D.url);
      setModelFormat(initialValue.model3D.format);
      setDefaultColor(initialValue.defaultColor);
      setIsColorizable(initialValue.isColorizable);
      setPrice(String(initialValue.price));
      setStock(String(initialValue.stock));
    } else {
      setName('');
      setCategory('chair');
      setWidth('1');
      setLength('1');
      setHeight('1');
      setThumbnail('');
      setThumbnailAlt('');
      setModelUrl('');
      setModelFormat('glb');
      setDefaultColor('#8B4513');
      setIsColorizable(true);
      setPrice('0');
      setStock('0');
    }
    setError(null);
  }, [open, mode, initialValue]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!thumbnail.trim()) {
      setError('Thumbnail URL is required.');
      return;
    }
    if (!modelUrl.trim()) {
      setError('3D model URL is required.');
      return;
    }

    const numWidth = parseFloat(width);
    const numLength = parseFloat(length);
    const numHeight = parseFloat(height);
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);

    if (!Number.isFinite(numWidth) || !Number.isFinite(numLength) || !Number.isFinite(numHeight)) {
      setError('Dimensions must be valid numbers.');
      return;
    }

    if (!Number.isFinite(numPrice) || numPrice < 0) {
      setError('Price must be a non-negative number.');
      return;
    }

    if (!Number.isFinite(numStock) || numStock < 0) {
      setError('Stock must be a non-negative integer.');
      return;
    }

    const payload: CreateFurnitureInput = {
      name: name.trim(),
      category,
      dimensions: {
        width: numWidth,
        length: numLength,
        height: numHeight,
      },
      thumbnail: thumbnail.trim(),
      thumbnailAlt: thumbnailAlt.trim() || undefined,
      model3D: {
        url: modelUrl.trim(),
        format: modelFormat,
      },
      defaultColor: defaultColor.trim(),
      isColorizable,
      price: numPrice,
      stock: numStock,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save furniture item.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add furniture' : 'Edit furniture'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Category"
            select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Width (m)"
              type="number"
              fullWidth
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              inputProps={{ min: 0.1, step: 0.1 }}
            />
            <TextField
              label="Length (m)"
              type="number"
              fullWidth
              value={length}
              onChange={(e) => setLength(e.target.value)}
              inputProps={{ min: 0.1, step: 0.1 }}
            />
            <TextField
              label="Height (m)"
              type="number"
              fullWidth
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              inputProps={{ min: 0.1, step: 0.1 }}
            />
          </Box>

          <TextField
            label="Thumbnail URL"
            fullWidth
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://..."
          />

          <TextField
            label="Thumbnail alt text"
            fullWidth
            value={thumbnailAlt}
            onChange={(e) => setThumbnailAlt(e.target.value)}
            placeholder={name || 'E.g. Modern dining chair'}
          />

          <TextField
            label="3D model URL"
            fullWidth
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            placeholder="https://..."
          />

          <TextField
            label="3D model format"
            select
            fullWidth
            value={modelFormat}
            onChange={(e) => setModelFormat(e.target.value as 'gltf' | 'glb')}
          >
            <MenuItem value="gltf">gltf</MenuItem>
            <MenuItem value="glb">glb</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Default color (hex)"
              fullWidth
              value={defaultColor}
              onChange={(e) => setDefaultColor(e.target.value)}
              placeholder="#8B4513"
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Stock"
              type="number"
              fullWidth
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isColorizable}
                onChange={(e) => setIsColorizable(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Colorizable in editor
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FurnitureFormDialog;

