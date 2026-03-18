import React, { useCallback, useEffect, useState, Suspense, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
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
  Card,
  useTheme,
  alpha,
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
import TuneIcon from '@mui/icons-material/Tune';
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
  const theme = useTheme();

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
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);
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
  useContainerSize(canvas3DRef);

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
        room: { width: 5, length: 5, height: 3, wallColor: '#F5F5F5', floorColor: '#D2B48C', layout: 'rectangle' },
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        gap: 2,
        pt: 1.5,
      }}
    >
      {/* Toolbar (glass, matches /designs theme) */}
      <Card
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.25,
            py: 1,
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="Back to Dashboard">
            <IconButton
              edge="start"
              onClick={handleBack}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ minWidth: 180, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {currentDesign.name || 'New Design'}
              {hasUnsavedChanges && (
                <Chip
                  label="Unsaved"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: 11,
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    color: theme.palette.warning.main,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
                  }}
                />
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {viewMode === '2d' ? '2D editing' : '3D preview'} • Cmd+S to save • ? for help
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, v) => v && dispatch(setViewMode(v as '2d' | '3d'))}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'text.secondary',
                borderColor: alpha(theme.palette.divider, 0.8),
                px: 1.25,
                py: 0.5,
                fontSize: 12,
              },
              '& .Mui-selected': {
                color: theme.palette.getContrastText(alpha(theme.palette.primary.main, 0.2)),
                bgcolor: `${alpha(theme.palette.primary.main, 0.18)} !important`,
                borderColor: `${alpha(theme.palette.primary.main, 0.55)} !important`,
              },
            }}
          >
            {(Object.entries(VIEW_MODE_CONFIG) as ['2d' | '3d', typeof VIEW_MODE_CONFIG['2d']][]).map(
              ([mode, { label, icon }]) => (
                <ToggleButton key={mode} value={mode}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {icon}
                    <span>{label}</span>
                  </Stack>
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha(theme.palette.divider, 0.7) }} />

          <Tooltip title="Undo (Cmd+Z)">
            <span>
              <IconButton
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
                size="small"
                sx={{ color: canUndo ? 'text.secondary' : alpha(theme.palette.text.secondary, 0.35) }}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Cmd+Shift+Z)">
            <span>
              <IconButton
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
                size="small"
                sx={{ color: canRedo ? 'text.secondary' : alpha(theme.palette.text.secondary, 0.35) }}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha(theme.palette.divider, 0.7) }} />

          {viewMode === '2d' && (
            <>
              <Tooltip title="Zoom In (Ctrl+=)">
                <IconButton
                  onClick={() => dispatch(zoomIn())}
                  disabled={zoom >= 3}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out (Ctrl+-)">
                <IconButton
                  onClick={() => dispatch(zoomOut())}
                  disabled={zoom <= 0.3}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'}>
                <IconButton
                  onClick={() => dispatch(toggleShowGrid())}
                  size="small"
                  sx={{ color: showGrid ? theme.palette.primary.main : 'text.secondary' }}
                >
                  {showGrid ? <GridOffIcon fontSize="small" /> : <GridOnIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title={showRuler ? 'Hide Ruler' : 'Show Ruler'}>
                <IconButton
                  onClick={() => dispatch(toggleShowRuler())}
                  size="small"
                  sx={{ color: showRuler ? theme.palette.primary.main : 'text.secondary' }}
                >
                  <RulerIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showAlignmentGuides ? 'Disable Snap Guides' : 'Enable Snap Guides'}>
                <IconButton
                  onClick={() => dispatch(toggleAlignmentGuides())}
                  size="small"
                  sx={{ color: showAlignmentGuides ? theme.palette.success.main : 'text.secondary' }}
                >
                  <MagnetIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={snapToGrid ? 'Disable Grid Snap' : 'Enable Grid Snap'}>
                <IconButton
                  onClick={() => dispatch(toggleSnapToGrid())}
                  size="small"
                  sx={{ color: snapToGrid ? theme.palette.warning.main : 'text.secondary' }}
                >
                  <WeekendIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={tool === 'measure' ? 'Exit Measure (M)' : 'Measure Tool (M)'}>
                <IconButton
                  onClick={() => dispatch(setTool(tool === 'measure' ? 'select' : 'measure'))}
                  size="small"
                  sx={{ color: tool === 'measure' ? theme.palette.secondary.main : 'text.secondary' }}
                >
                  <StraightenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {viewMode === '3d' && (
            <>
              <Tooltip title="Lighting Settings">
                <IconButton
                  onClick={() => setLightingDrawerOpen(true)}
                  size="small"
                  sx={{ color: lightingDrawerOpen ? theme.palette.warning.main : 'text.secondary' }}
                >
                  <WbSunnyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showCeiling ? 'Hide Ceiling' : 'Show Ceiling'}>
                <IconButton
                  onClick={() => dispatch(toggleShowCeiling())}
                  size="small"
                  sx={{ color: showCeiling ? theme.palette.info?.main ?? theme.palette.primary.light : 'text.secondary' }}
                >
                  <View3DIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Box sx={{ flex: '0 0 auto' }} />
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ minHeight: 36, px: 2, py: 0.75, fontSize: 13 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Tooltip title="Help (?)">
            <IconButton onClick={() => setHelpDialogOpen(true)} size="small" sx={{ color: 'text.secondary' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* Main layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '320px 1fr 340px' },
          gap: 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left panel */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
            '& .MuiPaper-root': {
              backgroundImage: 'none',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none',
            },
          }}
          data-tour="room-config"
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Room configuration
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2 }}>
            <RoomConfigForm initialConfig={currentDesign.room} onApply={handleRoomConfigApply} />
          </Box>
        </Card>

        {/* Center canvas */}
        <Card sx={{ position: 'relative', overflow: 'hidden', minHeight: { xs: 520, lg: 0 } }}>
          {/* 2D Canvas - Always mounted, hidden when not active */}
          <Box
            ref={canvas2DRef}
            sx={{
              position: 'absolute',
              inset: 0,
              display: viewMode === '2d' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.35 : 0.55),
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
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.65),
                  color: 'text.secondary',
                  fontSize: 11,
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  backdropFilter: 'blur(10px)',
                }}
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
              bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.25 : 0.5),
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
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.65),
                  color: 'text.secondary',
                  fontSize: 11,
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  backdropFilter: 'blur(10px)',
                }}
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
        </Card>

        {/* Right panel */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
            '& .MuiPaper-root': {
              backgroundImage: 'none',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none',
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Furniture
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TuneIcon fontSize="small" />}
              onClick={() => {
                setPropertiesDrawerOpen(true);
                setLightingDrawerOpen(false);
              }}
              sx={{
                minHeight: 30,
                px: 1.25,
                py: 0.25,
                fontSize: 12,
                borderColor: alpha(theme.palette.divider, 0.9),
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              Properties
            </Button>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }} data-tour="furniture-library">
            <FurnitureLibraryPanel />
          </Box>
        </Card>
      </Box>

      {/* ── Furniture properties drawer (right sidebar) ── */}
      <Drawer
        anchor="right"
        open={propertiesDrawerOpen}
        onClose={() => setPropertiesDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 'min(92vw, 360px)', sm: 360 },
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            mt: 0,
            height: '100%',
            backgroundImage: 'none',
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.82),
            backdropFilter: 'blur(14px)',
            boxShadow: `0 18px 60px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.6 : 0.25)}`,
          },
        }}
        hideBackdrop
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Properties
          </Typography>
          <IconButton size="small" onClick={() => setPropertiesDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }} data-tour="furniture-properties">
          <FurniturePropertiesPanel />
        </Box>
      </Drawer>

      {/* ── Lighting config drawer (slides over 3D panel) ── */}
      <Drawer
        anchor="right"
        open={lightingDrawerOpen}
        onClose={() => setLightingDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            mt: 0,
            height: '100%',
          },
        }}
        hideBackdrop
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Lighting
          </Typography>
          <IconButton size="small" onClick={() => setLightingDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
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
