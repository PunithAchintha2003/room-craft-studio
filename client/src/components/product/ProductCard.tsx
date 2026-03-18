import { Card, CardMedia, CardContent, Typography, Box, Chip, IconButton, Button, Rating } from '@mui/material';
import { Favorite, FavoriteBorder, ShoppingCart, Visibility } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist, selectWishlistItems } from '@/features/wishlist/wishlistSlice';
import { formatCurrencyLKR } from '@/utils/currency';

interface ProductCardProps {
  furniture: {
    _id: string;
    name: string;
    category: string;
    price: number;
    thumbnail: string;
    stock?: number;
    averageRating?: number;
    reviewCount?: number;
    featured?: boolean;
    tags?: string[];
  };
  onQuickView?: (id: string) => void;
  compact?: boolean;
}

export function ProductCard({ furniture, onQuickView, compact = false }: ProductCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  
  const wishlistItems = useAppSelector(selectWishlistItems);
  const isInWishlist = wishlistItems.some(
    (item) =>
      (typeof item.furnitureId === 'object' ? item.furnitureId._id : item.furnitureId) ===
      furniture._id
  );
  
  const stock = furniture.stock;
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = !isOutOfStock && stock !== undefined && stock <= 10;

  const handleCardClick = () => {
    navigate(`/furniture/${furniture._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      dispatch(addToCart({ furnitureId: furniture._id, quantity: 1 }));
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(furniture._id));
    } else {
      dispatch(addToWishlist(furniture._id));
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(furniture._id);
    }
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={compact ? 160 : 240}
          image={furniture.thumbnail}
          alt={`${furniture.name} - ${furniture.category}`}
          sx={{
            width: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        
        {/* Badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {furniture.featured && (
            <Chip
              label="Featured"
              size="small"
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
          )}
          {isOutOfStock && (
            <Chip
              label="Out of Stock"
              size="small"
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                fontWeight: 'bold',
              }}
            />
          )}
          {isLowStock && (
            <Chip
              label={`Low Stock (${furniture.stock} left)`}
              size="small"
              sx={{
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
              }}
            />
          )}
        </Box>

        {/* Wishlist Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? (
            <Favorite color="error" />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>

        {/* Quick View Button (shows on hover) */}
        {isHovered && onQuickView && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Visibility />}
            onClick={handleQuickView}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'fadeIn 0.2s',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            Quick View
          </Button>
        )}
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          py: compact ? 1.5 : undefined,
        }}
      >
        <Chip
          label={furniture.category}
          size="small"
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        />
        
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {furniture.name}
        </Typography>

        {/* Rating */}
        {furniture.averageRating !== undefined && furniture.reviewCount !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
            <Rating
              value={furniture.averageRating}
              readOnly
              size="small"
              precision={0.1}
            />
            <Typography variant="caption" color="text.secondary">
              ({furniture.reviewCount})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mt: 'auto', mb: 2 }}>
          {formatCurrencyLKR(furniture.price)}
        </Typography>

        {/* Add to Cart Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${furniture.name} to cart`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
