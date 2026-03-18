import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
  ThreeDRotation,
  LocalShipping,
  AssignmentReturn,
} from '@mui/icons-material';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { ProductCard } from '@/components/product/ProductCard';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchFurnitureById, fetchRelatedFurniture } from '@/features/furniture/furnitureSlice';
import { addToCart } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist, selectWishlistItems } from '@/features/wishlist/wishlistSlice';
import { formatCurrencyLKR } from '@/utils/currency';
import { getAssetUrl } from '@/utils/assetUrl';

export default function ProductDetailPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedFurniture: furniture, relatedFurniture, loading, error } = useAppSelector(
    (state) => state.furniture
  );
  const wishlistItems = useAppSelector(selectWishlistItems);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const isInWishlist = furniture
    ? wishlistItems.some(
        (item) =>
          (typeof item.furnitureId === 'object' ? item.furnitureId._id : item.furnitureId) ===
          furniture._id
      )
    : false;

  useEffect(() => {
    if (id) {
      dispatch(fetchFurnitureById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (furniture?._id) {
      dispatch(fetchRelatedFurniture({ id: furniture._id }));
    }
  }, [furniture?._id, dispatch]);

  const handleAddToCart = () => {
    if (furniture) {
      dispatch(addToCart({ furnitureId: furniture._id, quantity }));
    }
  };

  const handleToggleWishlist = () => {
    if (furniture) {
      if (isInWishlist) {
        dispatch(removeFromWishlist(furniture._id));
      } else {
        dispatch(addToWishlist(furniture._id));
      }
    }
  };

  const handleIncrement = () => {
    if (furniture && quantity < (furniture.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isLoadingState = loading || (!furniture && !error);

  const headerTitle = useMemo(() => {
    if (isLoadingState) return 'Loading product...';
    if (error || !furniture) return 'Product Not Found';
    return furniture.name;
  }, [isLoadingState, error, furniture]);

  const topSection = (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        <Typography
          component={Link}
          to="/"
          variant="overline"
          color="text.secondary"
          sx={{
            textDecoration: 'none',
            '&:hover': { color: 'primary.main' },
          }}
        >
          Home
        </Typography>
        <Typography variant="overline" color="text.secondary">
          /
        </Typography>
        <Typography
          component={Link}
          to="/furniture"
          variant="overline"
          color="text.secondary"
          sx={{
            textDecoration: 'none',
            '&:hover': { color: 'primary.main' },
          }}
        >
          Furniture
        </Typography>
        {furniture && (
          <>
            <Typography variant="overline" color="text.secondary">
              /
            </Typography>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ textTransform: 'capitalize' }}
            >
              {furniture.category}
            </Typography>
          </>
        )}
      </Stack>

      {/* Title + key meta */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 3 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          {headerTitle}
        </Typography>

        {furniture && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
          >
            <Chip label={furniture.category} size="small" sx={{ textTransform: 'capitalize' }} />
            {(furniture as { featured?: boolean }).featured && (
              <Chip label="Featured" color="secondary" size="small" sx={{ fontWeight: 600 }} />
            )}
            {furniture.price != null && (
              <Typography
                variant="h5"
                color="primary"
                fontWeight="bold"
                sx={{ ml: { xs: 0, md: 1 } }}
              >
                {formatCurrencyLKR(furniture.price)}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );

  if (isLoadingState) {
    return (
      <TwoTonePageLayout
        top={topSection}
        bottom={
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        }
      />
    );
  }

  if (error || !furniture) {
    return (
      <TwoTonePageLayout
        top={topSection}
        bottom={
          <Box sx={{ maxWidth: 600, mx: 'auto', py: 8, px: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Product not found'}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/furniture')}>
              Back to Catalog
            </Button>
          </Box>
        }
      />
    );
  }

  const images = [getAssetUrl(furniture.thumbnail)];

  const isOutOfStock = (furniture.stock || 0) === 0;
  const isLowStock = !isOutOfStock && (furniture.stock || 0) <= 10;

  return (
    <TwoTonePageLayout
      top={topSection}
      bottom={
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Left Column - Image Gallery */}
            <Grid item xs={12} md={7}>
              <GlassCard>
                <Box
                  component="img"
                  src={images[selectedImage]}
                  alt={`${furniture.name} - view ${selectedImage + 1}`}
                  sx={{
                    width: '100%',
                    height: { xs: 280, md: 460 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 2,
                  }}
                />

                {images.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                    {images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        alt={`${furniture.name} thumbnail ${index + 1}`}
                        onClick={() => setSelectedImage(index)}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor:
                            selectedImage === index ? 'primary.main' : 'transparent',
                          opacity: selectedImage === index ? 1 : 0.6,
                          '&:hover': { opacity: 1 },
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </GlassCard>
            </Grid>

            {/* Right Column - Product Info & CTAs */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                {/* Stock Status */}
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {isOutOfStock && (
                    <Chip
                      label="Out of Stock"
                      sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  {isLowStock && (
                    <Chip
                      label={`Only ${furniture.stock} left in stock`}
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                      }}
                    />
                  )}
                  {!isOutOfStock && !isLowStock && (
                    <Chip
                      label="In Stock"
                      sx={{
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                      }}
                    />
                  )}
                </Box>

                <Divider />

                {/* Quantity + Add to Cart */}
                {!isOutOfStock && (
                  <Stack
                    direction={isMobile ? 'column' : 'row'}
                    spacing={2}
                    alignItems={isMobile ? 'stretch' : 'center'}
                  >
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Quantity
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Remove />
                        </IconButton>
                        <Typography
                          sx={{
                            minWidth: 60,
                            textAlign: 'center',
                            fontWeight: 'medium',
                            fontSize: '1.2rem',
                          }}
                        >
                          {quantity}
                        </Typography>
                        <IconButton
                          onClick={handleIncrement}
                          disabled={quantity >= (furniture.stock || 0)}
                          aria-label="Increase quantity"
                        >
                          <Add />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<ShoppingCart />}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                      >
                        Add to Cart
                      </Button>
                      <IconButton
                        size="large"
                        onClick={handleToggleWishlist}
                        color={isInWishlist ? 'error' : 'default'}
                        aria-label={
                          isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                        }
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        {isInWishlist ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Stack>
                  </Stack>
                )}

                {/* View in 3D Button */}
                {furniture.model3D && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<ThreeDRotation />}
                    onClick={() =>
                      navigate(`/design-viewer/preview?furniture=${furniture._id}`)
                    }
                  >
                    View in 3D
                  </Button>
                )}

                {/* Delivery & returns trust panel */}
                <GlassCard sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Delivery & Returns
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocalShipping fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Free delivery on orders over {formatCurrencyLKR(50)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentReturn fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        30-day return policy, no questions asked
                      </Typography>
                    </Stack>
                  </Stack>
                </GlassCard>
              </Stack>
            </Grid>
          </Grid>

          {/* Product details */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Product details
            </Typography>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ color: 'text.secondary' }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  Carefully selected to work beautifully with the RoomCraft Studio
                  visualiser, this piece fits comfortably in most modern living spaces.
                </Typography>
              </Box>
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                {furniture.dimensions && (
                  <Typography variant="body2">
                    Dimensions:{' '}
                    {`${furniture.dimensions.width} × ${furniture.dimensions.length} × ${furniture.dimensions.height} m`}
                  </Typography>
                )}
                {typeof furniture.stock === 'number' && (
                  <Typography variant="body2">
                    Stock:{' '}
                    {furniture.stock > 0
                      ? `${furniture.stock} units available`
                      : 'Out of stock'}
                  </Typography>
                )}
                <Typography variant="body2">Category: {furniture.category}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Related Products */}
          {relatedFurniture.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                You may also like
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Explore more pieces that complement this design.
              </Typography>
              <Grid container spacing={3}>
                {relatedFurniture.slice(0, 4).map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item._id}>
                    <ProductCard furniture={{ ...item, price: item.price ?? 0 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      }
    />
  );
}
