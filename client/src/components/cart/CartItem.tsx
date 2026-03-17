import { Box, Typography, Button, IconButton, Stack, Chip } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useAppDispatch } from '@/app/hooks';
import { updateCartItem, removeFromCart } from '@/features/cart/cartSlice';
import type { ICartItem } from '@/features/cart/cartSlice';

interface CartItemProps {
  item: ICartItem;
  readonly?: boolean;
}

export function CartItem({ item, readonly = false }: CartItemProps) {
  const dispatch = useAppDispatch();

  const handleIncrement = () => {
    if (!readonly) {
      dispatch(updateCartItem({ 
        furnitureId: item.furnitureId._id, 
        quantity: item.quantity + 1 
      }));
    }
  };

  const handleDecrement = () => {
    if (!readonly && item.quantity > 1) {
      dispatch(updateCartItem({ 
        furnitureId: item.furnitureId._id, 
        quantity: item.quantity - 1 
      }));
    }
  };

  const handleRemove = () => {
    if (!readonly) {
      dispatch(removeFromCart(item.furnitureId._id));
    }
  };

  const itemTotal = item.priceSnapshot * item.quantity;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
        },
      }}
    >
      {/* Product Image */}
      <Box
        component="img"
        src={item.furnitureId.thumbnail}
        alt={`${item.furnitureId.name} - ${item.furnitureId.category}`}
        sx={{
          width: 100,
          height: 100,
          objectFit: 'cover',
          borderRadius: 1,
          flexShrink: 0,
        }}
      />

      {/* Product Info */}
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Box>
          <Typography variant="h6" component="h3" gutterBottom>
            {item.furnitureId.name}
          </Typography>
          <Chip 
            label={item.furnitureId.category} 
            size="small" 
            sx={{ mr: 1 }} 
          />
          {item.selectedColor && (
            <Chip
              label={item.selectedColor}
              size="small"
              sx={{
                bgcolor: item.selectedColor.toLowerCase(),
                color: 'white',
                textTransform: 'capitalize',
              }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary">
          £{item.priceSnapshot.toFixed(2)} each
        </Typography>

        {/* Quantity Controls */}
        {!readonly ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Remove />
            </IconButton>
            <Typography
              sx={{
                minWidth: 40,
                textAlign: 'center',
                fontWeight: 'medium',
              }}
              aria-label={`Quantity: ${item.quantity}`}
            >
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={handleIncrement}
              disabled={item.quantity >= (item.furnitureId.stock || 0)}
              aria-label="Increase quantity"
            >
              <Add />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Quantity: {item.quantity}
          </Typography>
        )}
      </Stack>

      {/* Price and Remove */}
      <Stack spacing={1} alignItems="flex-end">
        <Typography variant="h6" color="primary" fontWeight="bold">
          £{itemTotal.toFixed(2)}
        </Typography>
        {!readonly && (
          <IconButton
            size="small"
            color="error"
            onClick={handleRemove}
            aria-label={`Remove ${item.furnitureId.name} from cart`}
          >
            <Delete />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
