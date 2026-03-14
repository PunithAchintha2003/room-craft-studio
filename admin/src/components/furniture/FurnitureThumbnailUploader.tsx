import React, { useCallback, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { updateFurnitureThumbnail } from '@/features/furniture/furnitureSlice';
import type { Furniture } from '@/types/design.types';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE_MB = 5;

interface FurnitureThumbnailUploaderProps {
  open: boolean;
  onClose: () => void;
  furniture: Furniture;
}

export const FurnitureThumbnailUploader: React.FC<FurnitureThumbnailUploaderProps> = ({
  open,
  onClose,
  furniture,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnailAlt, setThumbnailAlt] = useState(furniture.thumbnailAlt ?? furniture.name);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setThumbnailAlt(furniture.thumbnailAlt ?? furniture.name);
    setError(null);
    setUploading(false);
  }, [furniture.thumbnailAlt, furniture.name]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!ACCEPT.split(',').map((t) => t.trim()).includes(selected.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      setFile(null);
      setPreview(null);
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = ACCEPT;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(dropped);
      input.files = dataTransfer.files;
      handleFileChange({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (thumbnailAlt.trim()) formData.append('thumbnailAlt', thumbnailAlt.trim());

      await dispatch(
        updateFurnitureThumbnail({
          furnitureId: furniture._id,
          formData,
        })
      ).unwrap();
      handleClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change thumbnail — {furniture.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: 'action.hover',
              mb: 2,
            }}
          >
            <input
              accept={ACCEPT}
              type="file"
              id="thumbnail-upload"
              hidden
              onChange={handleFileChange}
            />
            <label htmlFor="thumbnail-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                Choose image
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" display="block">
              or drag and drop. JPEG, PNG, or WebP, max {MAX_SIZE_MB}MB.
            </Typography>
            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  mt: 2,
                  maxHeight: 200,
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            label="Alt text (accessibility)"
            value={thumbnailAlt}
            onChange={(e) => setThumbnailAlt(e.target.value)}
            placeholder={furniture.name}
            margin="dense"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FurnitureThumbnailUploader;
