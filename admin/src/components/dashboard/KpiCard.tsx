import React from 'react';
import { Box, CardContent, Typography, useTheme } from '@mui/material';
import { GlassCard } from '@/components/common/GlassCard';

interface KpiCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  accentColor?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  helperText,
  accentColor,
  icon,
}) => {
  const theme = useTheme();
  const color = accentColor ?? theme.palette.primary.main;

  return (
    <GlassCard
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at top left, ${color}22 0, transparent 55%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 0.5, fontWeight: 700 }}
            >
              {value}
            </Typography>
          </Box>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}14`,
                color,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        {helperText && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {helperText}
          </Typography>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default KpiCard;

