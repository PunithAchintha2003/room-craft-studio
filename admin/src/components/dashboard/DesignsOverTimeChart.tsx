import React from 'react';
import { CardContent, CardHeader, Box, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesPoint } from '@/types/dashboard.types';
import { GlassCard } from '@/components/common/GlassCard';

interface DesignsOverTimeChartProps {
  data: TimeSeriesPoint[];
}

const formatXAxis = (value: string) => {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const DesignsOverTimeChart: React.FC<DesignsOverTimeChartProps> = ({ data }) => {
  const theme = useTheme();

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
          background: `radial-gradient(circle at top left, ${theme.palette.primary.main}1C 0, transparent 55%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            Designs created over time
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Last 30 days
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: 280 }}>
        {data.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No design activity yet.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
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
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </GlassCard>
  );
};

export default DesignsOverTimeChart;

