import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  People,
  DesignServices,
  HowToReg,
  TrendingUp,
  ArrowForward,
  ViewInAr,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserStats } from '@/services/users.api';
import { UserStats } from '@/types/user.types';

interface StatCard {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? null,
      icon: <People />,
      color: '#10B981',
      description: 'Registered client accounts',
    },
    {
      label: 'Active Designers',
      value: stats?.activeDesigners ?? null,
      icon: <HowToReg />,
      color: '#3B82F6',
      description: 'Designers currently active',
    },
    {
      label: 'Total Designers',
      value: stats?.totalDesigners ?? null,
      icon: <DesignServices />,
      color: '#E8A045',
      description: 'All designer accounts',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers ?? null,
      icon: <TrendingUp />,
      color: '#8B5CF6',
      description: 'Users with active status',
    },
  ];

  const quickLinks = [
    {
      label: 'User Management',
      description: 'View, edit and manage client accounts',
      path: '/users',
      color: '#10B981',
      icon: <People sx={{ fontSize: 32 }} />,
    },
    {
      label: 'Designer Management',
      description: 'Manage designer accounts and access',
      path: '/designers',
      color: '#3B82F6',
      icon: <DesignServices sx={{ fontSize: 32 }} />,
    },
  ];

  return (
    <Box>
      {/* Welcome header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here&apos;s an overview of your RoomCraft Studio platform.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={6} lg={3} key={stat.label}>
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
                {loading ? (
                  <Skeleton variant="text" width={60} height={48} />
                ) : (
                  <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stat.value ?? '—'}
                  </Typography>
                )}
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick links */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickLinks.map((link) => (
          <Grid item xs={12} sm={6} key={link.path}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 32px ${alpha(link.color, 0.2)}`,
                  borderColor: alpha(link.color, 0.4),
                },
              }}
              onClick={() => navigate(link.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      backgroundColor: alpha(link.color, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: link.color,
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {link.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {link.description}
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      sx={{ color: link.color, p: 0, minHeight: 'auto', fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); navigate(link.path); }}
                    >
                      Go to {link.label}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Coming soon card */}
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <ViewInAr sx={{ fontSize: 56, color: alpha('#E8A045', 0.4), mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Room Designer Coming Soon
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 480, mx: 'auto' }}>
            The 2D layout editor and 3D visualisation tools will be available in Phase 2.
            Design analytics will appear here.
          </Typography>
          <Chip
            label="Phase 2 — In Development"
            sx={{ backgroundColor: alpha('#E8A045', 0.12), color: 'primary.main', fontWeight: 600 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
