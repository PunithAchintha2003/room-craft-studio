import { Drawer, Box, Typography, Stack, Button, Divider, IconButton } from '@mui/material';
import { Close, ShoppingCart } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { CartItem } from './CartItem';
import { formatCurrencyLKR } from '@/utils/currency';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleCheckout = () => {
    navigate('/payment');
    onClose();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: (theme) => ({
          width: { xs: '100%', sm: 420 },
          maxWidth: '100vw',
          background: `linear-gradient(145deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
          borderLeft: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 24px 70px rgba(15, 23, 42, 0.9)'
              : '0 24px 70px rgba(15, 23, 42, 0.35)',
        }),
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
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={(theme) => ({
                width: 34,
                height: 34,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.primary.dark
                    : theme.palette.primary.light,
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.primary.contrastText
                    : theme.palette.primary.main,
              })}
            >
              <ShoppingCart fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Your bag
              </Typography>
              <Typography variant="h6" component="h2">
                {itemCount === 0
                  ? 'Start building your room'
                  : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} added`}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close cart"
            size="small"
            sx={{ ml: 1 }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            px: 2.5,
            py: 2,
          }}
        >
          {loading ? (
            <Stack spacing={2} sx={{ py: 4 }}>
              <Box
                sx={{
                  height: 18,
                  width: '40%',
                  borderRadius: 999,
                  bgcolor: 'action.hover',
                }}
              />
              <Box
                sx={{
                  height: 110,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              />
              <Box
                sx={{
                  height: 110,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              />
            </Stack>
          ) : items.length === 0 ? (
            <Stack spacing={2.5} alignItems="center" sx={{ py: 7, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  color: 'text.disabled',
                }}
              >
                <ShoppingCart sx={{ fontSize: 34 }} />
              </Box>
              <Box>
                <Typography variant="h6">Your cart is empty</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Explore curated furniture to bring your 3D designs to life.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="medium"
                onClick={() => {
                  navigate('/furniture');
                  onClose();
                }}
              >
                Browse furniture
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2.25}>
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
            <Box
              sx={{
                px: 2.5,
                py: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1.25 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated total
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrencyLKR(subtotal)}
                </Typography>
              </Box>
              <Stack spacing={1.25}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  Go to checkout
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
