import { Drawer, Box, Typography, Stack, Button, Divider, IconButton } from '@mui/material';
import { Close, ShoppingCart } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { CartItem } from './CartItem';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart />
            <Typography variant="h6" component="h2">
              Shopping Cart
            </Typography>
            {itemCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Close cart">
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {loading ? (
            <Typography align="center" color="text.secondary">
              Loading...
            </Typography>
          ) : items.length === 0 ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
              <ShoppingCart sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  navigate('/furniture');
                  onClose();
                }}
              >
                Browse Furniture
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {items.map((item) => (
                <CartItem key={item.furnitureId._id} item={item} />
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  £{total.toFixed(2)}
                </Typography>
              </Box>

              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  Checkout
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleViewCart}
                >
                  View Cart
                </Button>
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 2, textAlign: 'center' }}
              >
                Free shipping on orders over £50
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
