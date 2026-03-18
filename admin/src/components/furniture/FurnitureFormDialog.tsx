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
  Chip,
  DialogContentText,
} from '@mui/material';
import type { Furniture, FurnitureCategory } from '@/types/design.types';
import type { CreateFurnitureInput, UpdateFurnitureInput } from '@/features/furniture/furnitureSlice';

type Mode = 'create' | 'edit';

interface FurnitureFormDialogProps {
  open: boolean;
  mode: Mode;
  initialValue?: Furniture;
  onClose: () => void;
  onSubmit: (values: CreateFurnitureInput | UpdateFurnitureInput | FormData) => Promise<void> | void;
  isSubmitting: boolean;
  categories: FurnitureCategory[];
  onAddCategory: (label: string) => Promise<FurnitureCategory>;
}

export const FurnitureFormDialog: React.FC<FurnitureFormDialogProps> = ({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FurnitureCategory>('chair');
  const [width, setWidth] = useState<string>('1');
  const [length, setLength] = useState<string>('1');
  const [height, setHeight] = useState<string>('1');
  const [thumbnailAlt, setThumbnailAlt] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [defaultColor, setDefaultColor] = useState('#8B4513');
  const [isColorizable, setIsColorizable] = useState(true);
  const [price, setPrice] = useState<string>('0');
  const [stock, setStock] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialValue && mode === 'edit') {
      setName(initialValue.name);
      setCategory(initialValue.category);
      setWidth(String(initialValue.dimensions.width));
      setLength(String(initialValue.dimensions.length));
      setHeight(String(initialValue.dimensions.height));
      setThumbnailAlt(initialValue.thumbnailAlt ?? '');
      setThumbnailFile(null);
      setModelFile(null);
      setDefaultColor(initialValue.defaultColor);
      setIsColorizable(initialValue.isColorizable);
      setPrice(String(initialValue.price));
      setStock(String(initialValue.stock));
    } else {
      setName('');
      setCategory(categories[0] ?? 'chair');
      setWidth('1');
      setLength('1');
      setHeight('1');
      setThumbnailAlt('');
      setThumbnailFile(null);
      setModelFile(null);
      setDefaultColor('#8B4513');
      setIsColorizable(true);
      setPrice('0');
      setStock('0');
    }
    setError(null);
  }, [open, mode, initialValue, categories]);

  useEffect(() => {
    if (!open) return;
    // If the currently selected category is not in the list (or list just loaded),
    // pick a reasonable default.
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [open, categories, category]);

  const handleAddCategory = async () => {
    const label = newCategoryLabel.trim();
    if (!label) return;
    setAddingCategory(true);
    setError(null);
    try {
      const createdSlug = await onAddCategory(label);
      setCategory(createdSlug);
      setAddCategoryOpen(false);
      setNewCategoryLabel('');
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Failed to create category.');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (mode === 'create') {
      if (!thumbnailFile) {
        setError('Thumbnail image is required.');
        return;
      }
      if (!modelFile) {
        setError('3D model file (.glb or .gltf) is required.');
        return;
      }
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

    const thumbnailAltValue = thumbnailAlt.trim() || undefined;

    try {
      if (mode === 'create') {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('category', category);
        formData.append('width', String(numWidth));
        formData.append('length', String(numLength));
        formData.append('height', String(numHeight));
        if (thumbnailAltValue) formData.append('thumbnailAlt', thumbnailAltValue);
        formData.append('defaultColor', defaultColor.trim());
        formData.append('isColorizable', String(isColorizable));
        formData.append('price', String(numPrice));
        formData.append('stock', String(numStock));
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
        if (modelFile) formData.append('model', modelFile);
        await onSubmit(formData);
      } else {
        const payload: UpdateFurnitureInput = {
          name: name.trim(),
          category,
          dimensions: { width: numWidth, length: numLength, height: numHeight },
          thumbnailAlt: thumbnailAltValue,
          defaultColor: defaultColor.trim(),
          isColorizable,
          price: numPrice,
          stock: numStock,
        };
        await onSubmit(payload);
      }
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
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setAddCategoryOpen(true)} disabled={isSubmitting}>
              Add category
            </Button>
          </Box>

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

          {mode === 'create' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Thumbnail image
              </Typography>
              <Button variant="outlined" component="label" disabled={isSubmitting}>
                Choose image
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {thumbnailFile && <Chip size="small" label={thumbnailFile.name} />}
            </Box>
          ) : (
            <Alert severity="info">
              Thumbnail image can be changed from the table using the <b>Image</b> action.
            </Alert>
          )}

          <TextField
            label="Thumbnail alt text"
            fullWidth
            value={thumbnailAlt}
            onChange={(e) => setThumbnailAlt(e.target.value)}
            placeholder={name || 'E.g. Modern dining chair'}
          />

          {mode === 'create' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                3D model file
              </Typography>
              <Button variant="outlined" component="label" disabled={isSubmitting}>
                Choose .glb / .gltf
                <input
                  hidden
                  type="file"
                  accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                  onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {modelFile && <Chip size="small" label={modelFile.name} />}
              <Typography variant="caption" color="text.secondary">
                The format is inferred from the file extension.
              </Typography>
            </Box>
          )}

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

      <Dialog open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a display name. The backend will generate a kebab-case slug automatically.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Category name"
            fullWidth
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            placeholder="E.g. Outdoor"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCategoryOpen(false)} disabled={addingCategory}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCategory}
            disabled={addingCategory || !newCategoryLabel.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FurnitureFormDialog;

