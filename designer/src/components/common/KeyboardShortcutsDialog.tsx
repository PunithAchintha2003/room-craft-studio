import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
    <Typography variant="body2">{description}</Typography>
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {keys.map((key, idx) => (
        <Paper
          key={idx}
          elevation={1}
          sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            minWidth: 32,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" fontWeight="bold" fontFamily="monospace">
            {key}
          </Typography>
        </Paper>
      ))}
    </Box>
  </Box>
);

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardIcon />
            <Typography variant="h6">Keyboard Shortcuts</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Global Shortcuts */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Global
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ShortcutItem keys={['Cmd/Ctrl', 'S']} description="Save design" />
            <ShortcutItem keys={['Cmd/Ctrl', 'Z']} description="Undo" />
            <ShortcutItem keys={['Cmd/Ctrl', 'Shift', 'Z']} description="Redo" />
            <ShortcutItem keys={['?']} description="Show this help dialog" />
          </Box>

          {/* 2D Editor Shortcuts */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              2D Editor
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ShortcutItem keys={['Delete']} description="Delete selected furniture" />
            <ShortcutItem keys={['Backspace']} description="Delete selected furniture" />
            <ShortcutItem keys={['Shift', 'Click']} description="Multi-select furniture" />
            <ShortcutItem keys={['Esc']} description="Deselect all" />
            <ShortcutItem keys={['M']} description="Activate measurement tool" />
          </Box>

          {/* 3D Editor Shortcuts */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              3D Editor
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ShortcutItem keys={['G']} description="Move (translate) selected furniture" />
            <ShortcutItem keys={['R']} description="Rotate selected furniture" />
            <ShortcutItem keys={['S']} description="Scale selected furniture" />
            <ShortcutItem keys={['Scroll']} description="Zoom in/out" />
            <ShortcutItem keys={['Click + Drag']} description="Rotate camera" />
            <ShortcutItem keys={['Right Click + Drag']} description="Pan camera" />
          </Box>

          {/* Tips */}
          <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💡 Pro Tips
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
