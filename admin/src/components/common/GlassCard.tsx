import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { GLASS } from '@/theme/tokens';

export type GlassCardProps = CardProps;

export const GlassCard: React.FC<GlassCardProps> = ({ sx, ...props }) => {
  const theme = useTheme();
  const glass = theme.palette.mode === 'dark' ? GLASS.dark : GLASS.light;

  return (
    <Card
      className="glass-surface"
      sx={{
        borderRadius: 3,
        backdropFilter: `blur(${glass.blur}px)`,
        WebkitBackdropFilter: `blur(${glass.blur}px)`,
        backgroundColor: glass.background,
        border: `1px solid ${glass.border}`,
        boxShadow: 'none',
        ...sx,
      }}
      {...props}
    />
  );
};

export default GlassCard;

