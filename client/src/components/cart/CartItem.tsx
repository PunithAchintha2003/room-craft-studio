import { Box, Typography, IconButton, Stack, Chip } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useAppDispatch } from '@/app/hooks';
import { updateCartItem, removeFromCart } from '@/features/cart/cartSlice';
import type { ICartItem } from '@/features/cart/cartSlice';
import { formatCurrencyLKR } from '@/utils/currency';
import { getAssetUrl } from '@/utils/assetUrl';

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
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0,
          background:
            'radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 55%)',
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Product Image */}
      <Box
        component="img"
        src={getAssetUrl(item.furnitureId.thumbnail)}
        alt={`${item.furnitureId.name} - ${item.furnitureId.category}`}
        sx={{
          width: 96,
          height: 96,
          objectFit: 'cover',
          borderRadius: 1.5,
          flexShrink: 0,
        }}
      />

      {/* Product Info */}
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Box>
          <Typography
            variant="subtitle1"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 600, lineHeight: 1.2 }}
          >
            {item.furnitureId.name}
          </Typography>
          <Chip 
            label={item.furnitureId.category} 
            size="small" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Typography
            variant="h6"
            color="primary.main"
            fontWeight="bold"
            sx={{ lineHeight: 1.2 }}
          >
            {formatCurrencyLKR(itemTotal)}
          </Typography>
        </Box>

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

      {/* Remove Button */}
      {!readonly && (
        <Stack spacing={1} alignItems="flex-end">
          <IconButton
            size="small"
            color="error"
            onClick={handleRemove}
            aria-label={`Remove ${item.furnitureId.name} from cart`}
          >
            <Delete />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}
