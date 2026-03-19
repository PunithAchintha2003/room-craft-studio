import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { GLASS } from '@/theme/tokens';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ShortcutItem: React.FC<{
  keys: string[];
  description: string;
  glass: { background: string; border: string; blur: number };
  isDark: boolean;
}> = ({ keys, description, glass, isDark }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
    <Typography variant="body2" color="text.primary">
      {description}
    </Typography>
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {keys.map((key, idx) => (
        <Box
          key={idx}
          sx={{
            px: 1.5,
            py: 0.5,
            background: glass.background,
            border: '1px solid',
            borderColor: glass.border,
            borderRadius: 1,
            minWidth: 32,
            textAlign: 'center',
            backdropFilter: `blur(${glass.blur}px)`,
            WebkitBackdropFilter: `blur(${glass.blur}px)`,
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography variant="caption" fontWeight="bold" fontFamily="monospace" color="text.primary">
            {key}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const glass = isDark ? GLASS.dark : GLASS.light;

  const paperSx = {
    background: glass.background,
    border: `1px solid ${glass.border}`,
    borderRadius: 2,
    backdropFilter: `blur(${glass.blur}px)`,
    WebkitBackdropFilter: `blur(${glass.blur}px)`,
    boxShadow: isDark
      ? '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)'
      : '0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
  } as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: paperSx }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${glass.border}`, color: 'text.primary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardIcon color="primary" />
            <Typography variant="h6" color="inherit">
              Keyboard Shortcuts
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5, color: 'text.primary' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${glass.border}` }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
              Global
            </Typography>
            <Divider sx={{ mb: 2, borderColor: glass.border }} />
            <ShortcutItem keys={['Cmd/Ctrl', 'S']} description="Save design" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Cmd/Ctrl', 'Z']} description="Undo" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Cmd/Ctrl', 'Shift', 'Z']} description="Redo" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['?']} description="Show this help dialog" glass={glass} isDark={isDark} />
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${glass.border}` }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
              2D Editor
            </Typography>
            <Divider sx={{ mb: 2, borderColor: glass.border }} />
            <ShortcutItem keys={['Delete']} description="Delete selected furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Backspace']} description="Delete selected furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Shift', 'Click']} description="Multi-select furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Esc']} description="Deselect all" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['M']} description="Activate measurement tool" glass={glass} isDark={isDark} />
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${glass.border}` }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
              3D Editor
            </Typography>
            <Divider sx={{ mb: 2, borderColor: glass.border }} />
            <ShortcutItem keys={['G']} description="Move (translate) selected furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['R']} description="Rotate selected furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['S']} description="Scale selected furniture" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Scroll']} description="Zoom in/out" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Click + Drag']} description="Rotate camera" glass={glass} isDark={isDark} />
            <ShortcutItem keys={['Right Click + Drag']} description="Pan camera" glass={glass} isDark={isDark} />
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, background: glass.background, border: `1px solid ${glass.border}`, backdropFilter: `blur(${glass.blur}px)`, WebkitBackdropFilter: `blur(${glass.blur}px)`, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.06)' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">
              Pro Tips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use the grid snap feature to align furniture precisely
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • In 3D mode, press G/R/S and then drag to transform furniture
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Hold Shift while scaling to maintain proportions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Double-click furniture in 2D to jump to 3D view
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;

