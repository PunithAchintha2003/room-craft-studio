import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { ShoppingCartCheckout, ArrowBack } from '@mui/icons-material';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { fetchCart, clearCart, addDesignToCart } from '@/features/cart/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import type { IDesign } from '@/types/design.types';
import api from '@/services/api';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax ?? 0;
  const total = cart?.total ?? 0;
  const [designs, setDesigns] = useState<IDesign[]>([]);
  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await api.get('/designs');
        // @ts-expect-error API typing is loose here
        setDesigns(response.data.designs || response.data.data?.designs || []);
      } catch (err) {
        console.error('Failed to fetch designs:', err);
      }
    };
    fetchDesigns();
  }, []);

  const handleProceedToCheckout = () => {
    navigate('/payment');
  };

  const handleContinueShopping = () => {
    navigate('/furniture');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setClearDialogOpen(false);
  };

  const handleAddDesign = (designId: string) => {
    dispatch(addDesignToCart(designId));
    setDesignModalOpen(false);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const finalTotal = total + shippingCost;

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Shopping Cart
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {itemCount > 0
              ? `You have ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`
              : 'Your cart is empty'}
          </Typography>
        </Box>
      }
      bottom={
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={handleContinueShopping}
          sx={{ mb: 3 }}
          aria-label="Continue shopping"
        >
          Continue Shopping
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !items.length ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          // Empty State
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <ShoppingCartCheckout
              sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }}
            />
            <Typography variant="h4" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Looks like you haven't added any furniture to your cart yet.
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
                onClick={handleContinueShopping}
              >
                Browse Furniture
              </Button>
              {designs.length > 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setDesignModalOpen(true)}
                >
                  Shop a Design
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          // Cart Contents
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
              gap: 4,
              alignItems: 'start',
            }}
          >
            {/* Left Column - Cart Items */}
            <Box>
              <Stack spacing={2}>
                {items.map((item) => (
                  <CartItem key={item.furniture._id} item={item} />
                ))}
              </Stack>

              {/* Action Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 3 }}
              >
                {designs.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setDesignModalOpen(true)}
                  >
                    Add Design to Cart
                  </Button>
                )}
                <Button
                  variant="text"
                  color="error"
                  onClick={() => setClearDialogOpen(true)}
                >
                  Clear Cart
                </Button>
              </Stack>
            </Box>

            {/* Right Column - Order Summary */}
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shippingCost={shippingCost}
              total={finalTotal}
              onCheckout={handleProceedToCheckout}
              checkoutDisabled={loading || items.length === 0}
              checkoutLabel="Proceed to Checkout"
              showShipping
            />
          </Box>
        )}

        {/* Design Selection Modal */}
        <Dialog
          open={designModalOpen}
          onClose={() => setDesignModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Select a Design</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add all furniture from a design to your cart with one click.
            </Typography>
            {designs.length === 0 ? (
              <Alert severity="info">
                You don't have any saved designs yet.{' '}
                <Button
                  size="small"
                  onClick={() => {
                    setDesignModalOpen(false);
                    navigate('/designs');
                  }}
                >
                  View Designs
                </Button>
              </Alert>
            ) : (
              <List>
                {designs.map((design) => (
                  <ListItem key={design._id} disablePadding>
                    <ListItemButton onClick={() => handleAddDesign(design._id)}>
                      <ListItemText
                        primary={design.roomName || `Design ${design._id.slice(-6)}`}
                        secondary={`${design.roomWidth}m × ${design.roomLength}m • ${design.furnitureItems?.length || 0} items`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDesignModalOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Clear Cart Confirmation */}
        <Dialog
          open={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
        >
          <DialogTitle>Clear Cart?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove all items from your cart?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClearCart} color="error">
              Clear Cart
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      }
    />
  );
}
