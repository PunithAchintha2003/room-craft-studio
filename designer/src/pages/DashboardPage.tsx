import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
  Button,
  Alert,
} from '@mui/material';
import {
  GridView,
  ViewInAr,
  Add,
  DesignServices,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchDesigns } from '@/features/design/designSlice';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { designs, isLoading, error } = useSelector((state: RootState) => state.design);

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const totalDesigns = designs.length;
  const recentDesigns = designs.slice(0, 5);

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Welcome back, {user?.name ?? 'Designer'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Manage your designs and preview them in 3D. View all designs in the system.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                size="large"
                onClick={() => navigate('/editor')}
                sx={{ flexShrink: 0 }}
              >
                New Design
              </Button>
              <Button
                variant="outlined"
                startIcon={<DesignServices />}
                size="large"
                onClick={() => navigate('/designs')}
                sx={{ flexShrink: 0 }}
              >
                All Designs
              </Button>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: alpha('#0EA5E9', 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0EA5E9',
                    mb: 2,
                  }}
                >
                  <GridView />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {isLoading ? '—' : totalDesigns}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Designs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: alpha('#8B5CF6', 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B5CF6',
                    mb: 2,
                  }}
                >
                  <ViewInAr />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                  3D Preview
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Available in editor
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick actions
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Create a new room design or open an existing one to use the 2D editor and 3D preview.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/editor')}
              >
                New Design
              </Button>
              <Button
                variant="outlined"
                startIcon={<DesignServices />}
                onClick={() => navigate('/designs')}
              >
                View All Designs
              </Button>
            </Box>

            {recentDesigns.length > 0 && (
              <>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
                  Recent designs
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recentDesigns.map((design) => (
                    <Box
                      key={design._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {design.name}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => navigate(`/editor/${design._id}`)}
                      >
                        Open
                      </Button>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {!isLoading && designs.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                No designs yet. Click &quot;New Design&quot; to create your first room design and try the 3D preview.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DashboardPage;
