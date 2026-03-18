import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { FavoriteBorder } from '@mui/icons-material';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchWishlist, selectWishlistItems } from '@/features/wishlist/wishlistSlice';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const wishlistState = useAppSelector((state) => state.wishlist);
  const items = useAppSelector(selectWishlistItems);

  const { loading, error } = wishlistState;

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const hasItems = items.length > 0;

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasItems
              ? 'All the pieces you\'ve saved for later.'
              : 'You haven\'t added any items to your wishlist yet.'}
          </Typography>
        </Box>
      }
      bottom={
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && !hasItems ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : !hasItems ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
              }}
            >
              <FavoriteBorder sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
              <Typography variant="h4" gutterBottom>
                Your wishlist is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Tap the heart icon on any product to save it here for later.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/furniture')}
                >
                  Browse Furniture
                </Button>
              </Stack>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {items.map((item) => {
                const furniture =
                  typeof item.furnitureId === 'object'
                    ? item.furnitureId
                    : // Fallback shape if backend returns just an ID (should normally be populated)
                      {
                        _id: String(item.furnitureId),
                        name: 'Saved item',
                        category: '',
                        price: 0,
                        thumbnail: '',
                      };

                return (
                  <Grid key={furniture._id} item xs={12} sm={6} md={4} lg={3}>
                    <ProductCard furniture={furniture} />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      }
    />
  );
}

