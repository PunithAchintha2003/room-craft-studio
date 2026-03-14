import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import View3DIcon from '@mui/icons-material/ViewInAr';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import {
  createDesign,
  updateDesign,
  fetchDesigns,
  setCurrentDesign,
  undo,
  redo,
  updateCurrentDesign,
} from '@/features/design/designSlice';
import { toggleShowGrid, zoomIn, zoomOut, resetEditor } from '@/features/editor/editorSlice';
import { RoomConfigForm } from '@/components/design/RoomConfigForm';
import { Canvas2DEditor } from '@/components/design/Canvas2DEditor';
import { FurnitureLibraryPanel } from '@/components/design/FurnitureLibraryPanel';
import { FurniturePropertiesPanel } from '@/components/design/FurniturePropertiesPanel';
import toast from 'react-hot-toast';

export const DesignEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    currentDesign,
    isLoading: loading,
    isSaving: saving,
    error,
    history,
    historyIndex,
  } = useSelector((state: RootState) => state.design);
  const { showGrid, zoom } = useSelector((state: RootState) => state.editor);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const user = useSelector((state: RootState) => state.auth.user);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleRoomConfigApply = useCallback(
    (config: import('@/types/design.types').RoomConfig) => {
      if (!currentDesign) return;
      dispatch(updateCurrentDesign({ room: config }));
      setHasUnsavedChanges(true);
    },
    [currentDesign, dispatch]
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchDesigns()).then((action) => {
        if (fetchDesigns.fulfilled.match(action)) {
          const design = action.payload.find((d) => d._id === id);
          if (design) {
            dispatch(setCurrentDesign(design));
            setDesignName(design.name);
            setDesignDescription(design.description || '');
          } else {
            toast.error('Design not found');
            navigate('/dashboard');
          }
        }
      });
    } else {
      if (!currentDesign) {
        dispatch(
          setCurrentDesign({
            _id: '',
            userId: user?._id || '',
            name: 'New Design',
            description: '',
            room: {
              width: 5,
              length: 5,
              height: 3,
              wallColor: '#F5F5F5',
              floorColor: '#D2B48C',
            },
            furniture: [],
            isPublic: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
      }
    }

    return () => {
      dispatch(resetEditor());
    };
  }, [id, dispatch, navigate, user, currentDesign]);

  const handleSave = useCallback(async () => {
    if (!currentDesign) return;

    if (!currentDesign._id) {
      setSaveDialogOpen(true);
      return;
    }

    try {
      await dispatch(
        updateDesign({
          id: currentDesign._id,
          input: {
            name: currentDesign.name,
            description: currentDesign.description,
            room: currentDesign.room,
            furniture: currentDesign.furniture,
          },
        })
      ).unwrap();
      toast.success('Design saved successfully');
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error('Failed to save design');
      console.error(err);
    }
  }, [currentDesign, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) dispatch(undo());
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) dispatch(redo());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, dispatch, handleSave]);

  const handleSaveNew = async () => {
    if (!currentDesign) return;

    try {
      const result = await dispatch(
        createDesign({
          name: designName || 'Untitled Design',
          description: designDescription,
          room: currentDesign.room,
          furniture: currentDesign.furniture,
        })
      ).unwrap();
      
      toast.success('Design created successfully');
      setSaveDialogOpen(false);
      setHasUnsavedChanges(false);
      navigate(`/editor/${result._id}`);
    } catch (err) {
      toast.error('Failed to create design');
      console.error(err);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentDesign) {
    return (
      <Box p={3}>
        <Alert severity="info">No design loaded</Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {currentDesign.name || 'New Design'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Undo (Cmd+Z)">
              <span>
                <IconButton onClick={() => dispatch(undo())} disabled={!canUndo}>
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Redo (Cmd+Shift+Z)">
              <span>
                <IconButton onClick={() => dispatch(redo())} disabled={!canRedo}>
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Zoom In">
              <IconButton onClick={() => dispatch(zoomIn())} disabled={zoom >= 2}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Zoom Out">
              <IconButton onClick={() => dispatch(zoomOut())} disabled={zoom <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'}>
              <IconButton onClick={() => dispatch(toggleShowGrid())}>
                {showGrid ? <GridOffIcon /> : <GridOnIcon />}
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Button
              variant="outlined"
              startIcon={<View3DIcon />}
              disabled
              sx={{ mr: 1 }}
            >
              3D View (Phase 3)
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            width: 300,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Room Configuration
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <RoomConfigForm
              initialConfig={currentDesign.room}
              onApply={handleRoomConfigApply}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'grey.50',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Canvas2DEditor width={900} height={700} />
          </Box>
        </Box>

        <Box
          sx={{
            width: 300,
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, borderBottom: 1, borderColor: 'divider', overflow: 'hidden' }}>
            <FurnitureLibraryPanel />
          </Box>
          <Box sx={{ height: 400, overflow: 'hidden' }}>
            <FurniturePropertiesPanel />
          </Box>
        </Box>
      </Box>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save New Design</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Design Name"
            fullWidth
            variant="outlined"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={designDescription}
            onChange={(e) => setDesignDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained" disabled={!designName.trim() || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignEditorPage;
