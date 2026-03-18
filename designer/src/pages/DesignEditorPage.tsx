import React, { useCallback, useEffect, useState, Suspense, useRef } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  Chip,
  Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StraightenIcon from '@mui/icons-material/Straighten';
import View2DIcon from '@mui/icons-material/CropFree';
import View3DIcon from '@mui/icons-material/ViewInAr';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import RulerIcon from '@mui/icons-material/Straighten';
import MagnetIcon from '@mui/icons-material/MyLocation';
import WeekendIcon from '@mui/icons-material/Weekend';
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
import { fetchFurniture } from '@/features/furniture/furnitureSlice';
import {
  toggleShowGrid,
  zoomIn,
  zoomOut,
  resetEditor,
  setTool,
  setViewMode,
  toggleShowRuler,
  toggleAlignmentGuides,
  toggleSnapToGrid,
  toggleShowCeiling,
  ViewMode,
} from '@/features/editor/editorSlice';
import { RoomConfigForm } from '@/components/design/RoomConfigForm';
import { Canvas2DEditor } from '@/components/design/Canvas2DEditor';
import { Canvas3DEditor } from '@/components/design/Canvas3DEditor';
import { FurnitureLibraryPanel } from '@/components/design/FurnitureLibraryPanel';
import { FurniturePropertiesPanel } from '@/components/design/FurniturePropertiesPanel';
import { KeyboardShortcutsDialog } from '@/components/common/KeyboardShortcutsDialog';
import { LightingControlPanel, LightingConfig } from '@/components/design/LightingControlPanel';
import { DesignerTutorial } from '@/components/tutorial/DesignerTutorial';
import { ExportDialog } from '@/components/design/ExportDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import toast from 'react-hot-toast';

// ── Canvas size observer hook ─────────────────────────────────────────────────
const useContainerSize = (ref: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

// ── View mode icons ───────────────────────────────────────────────────────────
const VIEW_MODE_CONFIG: Record<'2d' | '3d', { label: string; icon: React.ReactNode }> = {
  '2d': { label: '2D', icon: <View2DIcon fontSize="small" /> },
  '3d': { label: '3D', icon: <View3DIcon fontSize="small" /> },
};

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
  const { furniture } = useSelector((state: RootState) => state.furniture);
  const {
    showGrid,
    zoom,
    tool,
    viewMode,
    showRuler,
    showAlignmentGuides,
    snapToGrid,
    showCeiling,
  } = useSelector((state: RootState) => state.editor);
  const user = useSelector((state: RootState) => state.auth.user);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [lightingDrawerOpen, setLightingDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lightingConfig, setLightingConfig] = useState<LightingConfig>({
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    hemisphereIntensity: 0.3,
    shadowsEnabled: true,
    timeOfDay: 'noon',
  });

  const canvas2DRef = useRef<HTMLDivElement>(null);
  const canvas3DRef = useRef<HTMLDivElement>(null);
  const canvas2DSize = useContainerSize(canvas2DRef);
  const canvas3DSize = useContainerSize(canvas3DRef);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!currentDesign) return;
    if (!currentDesign._id) { setSaveDialogOpen(true); return; }
    try {
      await dispatch(updateDesign({
        id: currentDesign._id,
        input: {
          name: currentDesign.name,
          description: currentDesign.description,
          room: currentDesign.room,
          furniture: currentDesign.furniture,
        },
      })).unwrap();
      toast.success('Design saved');
      setHasUnsavedChanges(false);
    } catch {
      toast.error('Failed to save design');
    }
  }, [currentDesign, dispatch]);

  useKeyboardShortcuts({
    onSave: handleSave,
    onHelp: () => setHelpDialogOpen(true),
  });

  // ── Load design & furniture ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchFurniture());

    if (id) {
      dispatch(fetchDesigns()).then(action => {
        if (fetchDesigns.fulfilled.match(action)) {
          const design = action.payload.find(d => d._id === id);
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
    } else if (!currentDesign) {
      dispatch(setCurrentDesign({
        _id: '',
        userId: user?._id || '',
        name: 'New Design',
        description: '',
        room: { width: 5, length: 5, height: 3, wallColor: '#F5F5F5', floorColor: '#D2B48C' },
        furniture: [],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return () => { dispatch(resetEditor()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRoomConfigApply = useCallback(
    (config: import('@/types/design.types').RoomConfig) => {
      if (!currentDesign) return;
      dispatch(updateCurrentDesign({ room: config }));
      setHasUnsavedChanges(true);
    },
    [currentDesign, dispatch]
  );

  const handleSaveNew = async () => {
    if (!currentDesign) return;
    try {
      const result = await dispatch(createDesign({
        name: designName || 'Untitled Design',
        description: designDescription,
        room: currentDesign.room,
        furniture: currentDesign.furniture,
      })).unwrap();
      toast.success('Design created');
      setSaveDialogOpen(false);
      setHasUnsavedChanges(false);
      navigate(`/editor/${result._id}`);
    } catch {
      toast.error('Failed to create design');
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Leave anyway?')) navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
      </Box>
    );
  }

  if (!currentDesign) {
    return (
      <Box p={3}>
        <Alert severity="info">No design loaded</Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0F1117' }}>

      {/* ── AppBar ── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#1A1D27',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          color: '#E0E0E0',
        }}
      >
        <Toolbar variant="dense" sx={{ gap: 0.5 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton edge="start" onClick={handleBack} sx={{ color: '#9E9E9E', mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600, fontSize: 14, color: '#E0E0E0' }}>
            {currentDesign.name || 'New Design'}
            {hasUnsavedChanges && (
              <Chip
                label="Unsaved"
                size="small"
                sx={{ ml: 1, height: 18, fontSize: 10, bgcolor: 'rgba(255,183,77,0.2)', color: '#FFB74D' }}
              />
            )}
          </Typography>

          {/* ── View mode toggle ── */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, v) => v && dispatch(setViewMode(v as '2d' | '3d'))}
            size="small"
            sx={{
              mr: 1,
              '& .MuiToggleButton-root': {
                color: '#9E9E9E',
                borderColor: 'rgba(255,255,255,0.1)',
                px: 1.5,
                py: 0.5,
                fontSize: 12,
              },
              '& .Mui-selected': {
                color: '#fff',
                bgcolor: 'rgba(33,150,243,0.25) !important',
                borderColor: '#2196F3 !important',
              },
            }}
          >
            {(Object.entries(VIEW_MODE_CONFIG) as ['2d' | '3d', typeof VIEW_MODE_CONFIG['2d']][]).map(
              ([mode, { label, icon }]) => (
                <ToggleButton key={mode} value={mode}>
                  <Tooltip title={`${label} view (${mode === '2d' ? '1' : '2'})`}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {icon}
                      <span>{label}</span>
                    </Stack>
                  </Tooltip>
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

          {/* Undo/Redo */}
          <Tooltip title="Undo (Cmd+Z)">
            <span>
              <IconButton onClick={() => dispatch(undo())} disabled={!canUndo} size="small" sx={{ color: canUndo ? '#9E9E9E' : '#3E3E3E' }}>
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Cmd+Shift+Z)">
            <span>
              <IconButton onClick={() => dispatch(redo())} disabled={!canRedo} size="small" sx={{ color: canRedo ? '#9E9E9E' : '#3E3E3E' }}>
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

          {/* 2D editor tools */}
          {viewMode === '2d' && (
            <>
              <Tooltip title="Zoom In (Ctrl+=)">
                <IconButton onClick={() => dispatch(zoomIn())} disabled={zoom >= 3} size="small" sx={{ color: '#9E9E9E' }}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out (Ctrl+-)">
                <IconButton onClick={() => dispatch(zoomOut())} disabled={zoom <= 0.3} size="small" sx={{ color: '#9E9E9E' }}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'}>
                <IconButton onClick={() => dispatch(toggleShowGrid())} size="small" sx={{ color: showGrid ? '#64B5F6' : '#9E9E9E' }}>
                  {showGrid ? <GridOffIcon fontSize="small" /> : <GridOnIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title={showRuler ? 'Hide Ruler' : 'Show Ruler'}>
                <IconButton onClick={() => dispatch(toggleShowRuler())} size="small" sx={{ color: showRuler ? '#64B5F6' : '#9E9E9E' }}>
                  <RulerIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showAlignmentGuides ? 'Disable Snap Guides' : 'Enable Snap Guides'}>
                <IconButton onClick={() => dispatch(toggleAlignmentGuides())} size="small" sx={{ color: showAlignmentGuides ? '#66BB6A' : '#9E9E9E' }}>
                  <MagnetIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={snapToGrid ? 'Disable Grid Snap' : 'Enable Grid Snap'}>
                <IconButton onClick={() => dispatch(toggleSnapToGrid())} size="small" sx={{ color: snapToGrid ? '#FFB74D' : '#9E9E9E' }}>
                  <WeekendIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={tool === 'measure' ? 'Exit Measure (M)' : 'Measure Tool (M)'}>
                <IconButton
                  onClick={() => dispatch(setTool(tool === 'measure' ? 'select' : 'measure'))}
                  size="small"
                  sx={{ color: tool === 'measure' ? '#CE93D8' : '#9E9E9E' }}
                >
                  <StraightenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* 3D lighting */}
          {viewMode === '3d' && (
            <Tooltip title="Lighting Settings">
              <IconButton
                onClick={() => setLightingDrawerOpen(true)}
                size="small"
                sx={{ color: lightingDrawerOpen ? '#FFD54F' : '#9E9E9E' }}
              >
                <WbSunnyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Ceiling toggle */}
          {viewMode === '3d' && (
            <Tooltip title={showCeiling ? 'Hide Ceiling' : 'Show Ceiling'}>
              <IconButton onClick={() => dispatch(toggleShowCeiling())} size="small" sx={{ color: showCeiling ? '#80DEEA' : '#9E9E9E' }}>
                <View3DIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: '#2196F3',
              '&:hover': { bgcolor: '#1976D2' },
              fontSize: 12,
              px: 2,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>

          <Tooltip title="Help (?)">
            <IconButton onClick={() => setHelpDialogOpen(true)} size="small" sx={{ color: '#9E9E9E', ml: 0.5 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Main layout ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left panel: Room config */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#13151F',
          }}
          data-tour="room-config"
        >
          <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: '#9E9E9E', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
              Room Configuration
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
            <RoomConfigForm initialConfig={currentDesign.room} onApply={handleRoomConfigApply} />
          </Box>
        </Box>

        {/* Center: Canvas area (toggle between 2D and 3D) */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* 2D Canvas - Always mounted, hidden when not active */}
          <Box
            ref={canvas2DRef}
            sx={{
              position: 'absolute',
              inset: 0,
              display: viewMode === '2d' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1E2030',
              overflow: 'hidden',
            }}
            data-tour="canvas-2d"
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 5,
              }}
            >
              <Chip
                label="2D — Top View"
                size="small"
                sx={{ bgcolor: 'rgba(20,20,30,0.8)', color: '#9E9E9E', fontSize: 10, backdropFilter: 'blur(6px)' }}
              />
            </Box>
            <Canvas2DEditor
              width={canvas2DSize.width - 8}
              height={canvas2DSize.height - 4}
            />
          </Box>

          {/* 3D Canvas - Always mounted, hidden when not active */}
          <Box
            ref={canvas3DRef}
            sx={{
              position: 'absolute',
              inset: 0,
              display: viewMode === '3d' ? 'block' : 'none',
              bgcolor: '#0F1117',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 5,
              }}
            >
              <Chip
                label="3D — Perspective"
                size="small"
                sx={{ bgcolor: 'rgba(20,20,30,0.8)', color: '#9E9E9E', fontSize: 10, backdropFilter: 'blur(6px)' }}
              />
            </Box>
            <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress /></Box>}>
              <Canvas3DEditor
                design={currentDesign}
                furniture={furniture}
                width="100%"
                height="100%"
                lightingConfig={lightingConfig}
              />
            </Suspense>
          </Box>
        </Box>

        {/* Right panel: Furniture library + properties */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#13151F',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden' }} data-tour="furniture-library">
            <FurnitureLibraryPanel />
          </Box>
          <Box sx={{ height: 380, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }} data-tour="furniture-properties">
            <FurniturePropertiesPanel />
          </Box>
        </Box>
      </Box>

      {/* ── Lighting config drawer (slides over 3D panel) ── */}
      <Drawer
        anchor="right"
        open={lightingDrawerOpen}
        onClose={() => setLightingDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#13151F',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            mt: '48px',
            height: 'calc(100vh - 48px)',
          },
        }}
        hideBackdrop
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="caption" sx={{ color: '#9E9E9E', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
            Lighting
          </Typography>
          <IconButton size="small" onClick={() => setLightingDrawerOpen(false)} sx={{ color: '#9E9E9E' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
          <LightingControlPanel config={lightingConfig} onChange={setLightingConfig} />
        </Box>
      </Drawer>

      {/* ── Save new design dialog ── */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Design Name"
            fullWidth
            value={designName}
            onChange={e => setDesignName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={designDescription}
            onChange={e => setDesignDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained" disabled={!designName.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Export dialog ── */}
      {exportDialogOpen && (
        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          designName={currentDesign.name}
          onExport={async () => { setExportDialogOpen(false); }}
        />
      )}

      <KeyboardShortcutsDialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />
      <DesignerTutorial />
    </Box>
  );
};

export default DesignEditorPage;
