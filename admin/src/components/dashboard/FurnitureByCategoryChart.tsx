import React from 'react';
import { CardContent, CardHeader, Box, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { FurnitureCategoryCount } from '@/types/dashboard.types';
import { GlassCard } from '@/components/common/GlassCard';

interface FurnitureByCategoryChartProps {
  data: FurnitureCategoryCount[];
}

const CATEGORY_LABELS: Record<string, string> = {
  chair: 'Chairs',
  table: 'Tables',
  sofa: 'Sofas',
  bed: 'Beds',
  storage: 'Storage',
};

export const FurnitureByCategoryChart: React.FC<FurnitureByCategoryChartProps> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map((item) => ({
    ...item,
    label: CATEGORY_LABELS[item.category] ?? item.category,
  }));

  return (
    <GlassCard
      elevation={0}
      sx={{
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at top right, ${theme.palette.secondary.main}1C 0, transparent 55%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            Furniture catalog by category
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Distribution of items in your library
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: 280 }}>
        {chartData.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No furniture items yet.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[3],
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill={theme.palette.secondary.main}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default FurnitureByCategoryChart;

