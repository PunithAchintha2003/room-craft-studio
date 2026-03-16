import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Fade,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChairIcon from '@mui/icons-material/Chair';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/store';
import {
  fetchDashboardSummary,
  selectDashboardSummary,
  selectDashboardLoading,
  selectDashboardError,
} from '@/features/dashboard/dashboardSlice';
import KpiCard from '@/components/dashboard/KpiCard';
import DesignsOverTimeChart from '@/components/dashboard/DesignsOverTimeChart';
import FurnitureByCategoryChart from '@/components/dashboard/FurnitureByCategoryChart';

const getLast7DaysTotal = (counts: { date: string; count: number }[]): number => {
  if (!counts.length) return 0;
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  return counts
    .filter((point) => new Date(point.date) >= cutoff)
    .reduce((sum, point) => sum + point.count, 0);
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const summary = useSelector(selectDashboardSummary as (state: RootState) => ReturnType<typeof selectDashboardSummary>);
  const isLoading = useSelector(selectDashboardLoading as (state: RootState) => boolean);
  const error = useSelector(selectDashboardError as (state: RootState) => string | null);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const totalDesigns = summary?.design.totalDesigns ?? 0;
  const designsLast7Days = summary ? getLast7DaysTotal(summary.design.designsPerDay) : 0;
  const totalFurnitureItems = summary?.furniture.totalFurnitureItems ?? 0;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.name ?? 'Admin'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  High-level overview of design activity and your furniture catalog.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/editor')}
                  sx={{ textTransform: 'none' }}
                >
                  New Design
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DesignServicesIcon />}
                  onClick={() => navigate('/designs')}
                  sx={{ textTransform: 'none' }}
                >
                  All Designs
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isLoading && !summary ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 8,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <KpiCard
                      label="Total designs"
                      value={totalDesigns}
                      helperText="All room designs created across your workspace."
                      icon={<DashboardIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <KpiCard
                      label="Designs in last 7 days"
                      value={designsLast7Days}
                      helperText="Recent design activity to track engagement."
                      accentColor="#FF6B6B"
                      icon={<TimelineIcon fontSize="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <KpiCard
                      label="Furniture items"
                      value={totalFurnitureItems}
                      helperText="Unique furniture assets in your catalog."
                      accentColor="#4ECDC4"
                      icon={<ChairIcon fontSize="small" />}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <DesignsOverTimeChart data={summary?.design.designsPerDay ?? []} />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <FurnitureByCategoryChart data={summary?.furniture.furnitureByCategory ?? []} />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default DashboardPage;
