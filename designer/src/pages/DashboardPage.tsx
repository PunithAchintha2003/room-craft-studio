import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  GridView,
  ViewInAr,
  People,
  TrendingUp,
  Add,
  Logout,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { designerLogout } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const STAT_CARDS = [
  { label: 'Total Designs', value: '0', icon: <GridView />, color: '#0EA5E9' },
  { label: '3D Visualisations', value: '0', icon: <ViewInAr />, color: '#8B5CF6' },
  { label: 'Customers Helped', value: '0', icon: <People />, color: '#10B981' },
  { label: 'This Month', value: '0', icon: <TrendingUp />, color: '#F59E0B' },
];

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(designerLogout());
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha('#374151', 0.5)}`,
          backgroundColor: 'background.paper',
          px: { xs: 2, sm: 4 },
          py: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#FFFFFF',
              fontSize: '0.9rem',
            }}
          >
            RC
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
              RoomCraft Studio
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Designer Portal
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: alpha('#0EA5E9', 0.2), color: 'primary.main', fontWeight: 700, width: 36, height: 36 }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'D'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Designer</Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ borderColor: alpha('#374151', 0.6), color: 'text.secondary', minHeight: 40 }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Welcome back, {user?.name?.split(' ')[0] ?? 'Designer'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Manage your designs and help customers visualise their perfect rooms.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              size="large"
              sx={{ flexShrink: 0 }}
            >
              New Design
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {STAT_CARDS.map((stat) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      backgroundColor: alpha(stat.color, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <ViewInAr sx={{ fontSize: 64, color: alpha('#0EA5E9', 0.4), mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Room Designer Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 480, mx: 'auto' }}>
              The 2D layout editor and 3D visualisation tools will be available in Phase 2.
              Your design portfolio will appear here.
            </Typography>
            <Chip label="Phase 2 — In Development" sx={{ backgroundColor: alpha('#0EA5E9', 0.12), color: 'primary.main', fontWeight: 600 }} />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DashboardPage;
