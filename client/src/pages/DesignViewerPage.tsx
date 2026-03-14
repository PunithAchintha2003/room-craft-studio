import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { GlassCard } from '@/components/common/GlassCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchDesignById, fetchPublicDesign } from '@/features/design/designSlice';
import { fetchFurniture } from '@/features/furniture/furnitureSlice';
import { ReadOnlyCanvas2DViewer } from '@/components/design/ReadOnlyCanvas2DViewer';
import toast from 'react-hot-toast';

export const DesignViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentDesign, loading, error } = useSelector((state: RootState) => state.design);
  const { furniture } = useSelector((state: RootState) => state.furniture);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      if (user) {
        dispatch(fetchDesignById(id));
      } else {
        dispatch(fetchPublicDesign(id));
      }
      dispatch(fetchFurniture());
    }
  }, [id, user, dispatch]);

  useEffect(() => {
    if (currentDesign && user) {
      setIsOwner(currentDesign.userId === user._id);
    }
  }, [currentDesign, user]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/design-viewer/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const handleBuyAllItems = () => {
    if (!currentDesign) return;
    toast.success(`${currentDesign.furniture.length} items added to cart`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!currentDesign) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Design not found
        </Alert>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {currentDesign.name}
                </Typography>
                {currentDesign.description && (
                  <Typography variant="body1" color="text.secondary">
                    {currentDesign.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Share Design">
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              {isOwner && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/my-designs`)}
                >
                  Edit
                </Button>
              )}
              {currentDesign.furniture.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleBuyAllItems}
                >
                  Buy All Items
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={`Room: ${currentDesign.room.width}m × ${currentDesign.room.length}m`} />
            <Chip label={`${currentDesign.furniture.length} furniture items`} />
            {currentDesign.isPublic && <Chip label="Public" color="primary" />}
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatDate(currentDesign.updatedAt)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <GlassCard sx={{ p: 2, display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ReadOnlyCanvas2DViewer design={currentDesign} width={900} height={700} />
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassCard sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Room Details
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dimensions
                </Typography>
                <Typography variant="body1">
                  {currentDesign.room.width}m × {currentDesign.room.length}m × {currentDesign.room.height}m
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Wall Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: currentDesign.room.wallColor,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant="body1">{currentDesign.room.wallColor}</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Floor Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: currentDesign.room.floorColor,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant="body1">{currentDesign.room.floorColor}</Typography>
                </Box>
              </Box>

              {currentDesign.furniture.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Furniture Items ({currentDesign.furniture.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentDesign.furniture.map((item) => {
                      const furnitureData = furniture.find((f) => f._id === item.furnitureId);
                      return (
                        <GlassCard key={item.id} sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {furnitureData?.name || 'Unknown Item'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Position: {item.position.x.toFixed(1)}m, {item.position.y.toFixed(1)}m
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Rotation: {item.rotation.toFixed(0)}°
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Scale: {item.scale.toFixed(2)}x
                          </Typography>
                          {furnitureData?.price && (
                            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                              ${furnitureData.price.toFixed(2)}
                            </Typography>
                          )}
                        </GlassCard>
                      );
                    })}
                  </Box>
                </>
              )}
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DesignViewerPage;
