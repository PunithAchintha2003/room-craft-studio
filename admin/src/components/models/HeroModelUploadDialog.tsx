import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogProps,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '@/services/api';

interface HeroModelUploadDialogProps extends Pick<DialogProps, 'open' | 'onClose'> {
  /** Optional callback when upload succeeds; can be used to refresh client config */
  onUploaded?: (result: { url: string }) => void;
}

export const HeroModelUploadDialog: React.FC<HeroModelUploadDialogProps> = ({
  open,
  onClose,
  onUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setDisplayName('');
    setError(null);
    onClose?.({}, 'backdropClick');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose a .glb or .gltf file to upload.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      setError('Unsupported file type. Only .glb and .gltf models are allowed.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (displayName.trim()) {
        formData.append('name', displayName.trim());
      }

      const { data } = await api.post<{ data: { url: string } }>(
        '/admin/hero-model',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const url = data.data.url;
      onUploaded?.({ url });
      handleClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Upload 3D model for homepage preview</DialogTitle>
        <DialogContent dividers>
          {isUploading && <LinearProgress sx={{ mb: 2 }} />}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This model will appear in the customer-facing 3D Room Preview on the welcome page.
            Use an optimised <strong>.glb</strong> or <strong>.gltf</strong> file (ideally under
            20&nbsp;MB) for best performance.
          </Typography>

          <FormControl fullWidth margin="normal" error={Boolean(error)}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              disabled={isUploading}
            >
              {file ? 'Change file' : 'Choose 3D model file'}
              <input
                type="file"
                hidden
                accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                onChange={handleFileChange}
              />
            </Button>
            <FormHelperText>
              {file ? `Selected: ${file.name}` : 'Supported formats: .glb, .gltf'}
            </FormHelperText>
            {error && (
              <FormHelperText sx={{ mt: 1 }} error>
                {error}
              </FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Display name (optional)"
            margin="normal"
            fullWidth
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            disabled={isUploading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUploading || !file}
            sx={{ textTransform: 'none' }}
          >
            {isUploading ? 'Uploading…' : 'Upload model'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HeroModelUploadDialog;

