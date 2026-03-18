import { Box, Typography, Divider, Stack, Button } from '@mui/material';
import { GlassCard } from '@/components/common/GlassCard';
import { formatCurrencyLKR } from '@/utils/currency';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shippingCost?: number;
  total: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
  showShipping?: boolean;
}

export function CartSummary({
  subtotal,
  tax,
  shippingCost = 0,
  total,
  onCheckout,
  checkoutDisabled = false,
  checkoutLabel = 'Proceed to Checkout',
  showShipping = true,
}: CartSummaryProps) {
  const freeShippingThreshold = 50;
  const isFreeShipping = subtotal >= freeShippingThreshold || shippingCost === 0;

  return (
    <GlassCard
      sx={{
        p: 3,
        position: { md: 'sticky' },
        top: { md: 100 },
      }}
      aria-label="Order summary"
    >
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>

      <Stack spacing={2} sx={{ my: 2 }}>
        {/* Subtotal */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body1">Subtotal:</Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatCurrencyLKR(subtotal)}
          </Typography>
        </Box>

        {/* Tax */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Tax (VAT 10%):
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrencyLKR(tax)}
          </Typography>
        </Box>

        {/* Shipping */}
        {showShipping && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Shipping:
            </Typography>
            {isFreeShipping ? (
              <Typography variant="body2" color="success.main" fontWeight="medium">
                Free
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {formatCurrencyLKR(shippingCost)}
              </Typography>
            )}
          </Box>
        )}

        {/* Free shipping message */}
        {showShipping && !isFreeShipping && (
          <Typography variant="caption" color="info.main">
            Add {formatCurrencyLKR(freeShippingThreshold - subtotal)} more for free shipping
          </Typography>
        )}

        <Divider />

        {/* Total */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatCurrencyLKR(total)}
          </Typography>
        </Box>
      </Stack>

      {/* Checkout Button */}
      {onCheckout && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onCheckout}
          disabled={checkoutDisabled}
          sx={{ mt: 2 }}
          aria-label={checkoutLabel}
        >
          {checkoutLabel}
        </Button>
      )}

      {/* Info Text */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 2, textAlign: 'center' }}
      >
        Taxes calculated at checkout. Secure payment powered by Stripe.
      </Typography>
    </GlassCard>
  );
}
