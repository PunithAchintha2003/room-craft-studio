import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { BACKGROUND } from '@/theme/tokens';

export type TwoToneVariant = 'default' | 'inverted';

interface TwoTonePageLayoutProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  maxWidth?: 'lg' | 'xl' | 'md';
  variant?: TwoToneVariant;
}

export const TwoTonePageLayout: React.FC<TwoTonePageLayoutProps> = ({
  top,
  bottom,
  maxWidth = 'xl',
  variant = 'default',
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const palette = mode === 'dark' ? BACKGROUND.dark : BACKGROUND.light;

  const primary = variant === 'default' ? palette.primary : palette.secondary;
  const secondary = variant === 'default' ? palette.secondary : palette.primary;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: primary, display: 'flex', flexDirection: 'column' }}>
      {/* Top section */}
      <Box component="section" sx={{ bgcolor: primary }}>
        <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3 } }}>
          {top}
        </Container>
      </Box>

      {/* Bottom section */}
      <Box
        component="section"
        sx={{
          bgcolor: secondary,
          flex: 1,
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3 } }}>
          {bottom}
        </Container>
      </Box>
    </Box>
  );
};

export default TwoTonePageLayout;

