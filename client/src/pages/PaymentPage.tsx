import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Grid,
  Button,
  MenuItem,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import toast from 'react-hot-toast';
import { Lock, ArrowBack } from '@mui/icons-material';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createOrder } from '@/features/order/orderSlice';
import { clearCart } from '@/features/cart/cartSlice';
import { formatCurrencyLKR } from '@/utils/currency';

const TEST_DECLINE_CARD = '4000 0000 0000 0002';

function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/\D/g, '').slice(0, 16);
  return v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) return `${v.slice(0, 2)} / ${v.slice(2)}`;
  return v;
}

const fieldSx = {
  '& .MuiInputBase-root': { borderRadius: 2 },
  '& .MuiOutlinedInput-input': { py: 1.5 },
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { cart } = useAppSelector((state) => state.cart);
  const { loading } = useAppSelector((state) => state.orders);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax ?? 0;
  const total = cart?.total ?? 0;

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka',
  });

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleBackToHome = () => navigate('/');

  const handleChange =
    (field: keyof typeof shipping) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setShipping((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const validateForm = (): boolean => {
    if (!items.length) {
      toast.error('Your cart is empty.');
      return false;
    }
    if (!shipping.fullName || !shipping.email || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.state || !shipping.zipCode) {
      toast.error('Please complete all required fields.');
      return false;
    }
    if (!cardNumber || !cardName || !expiry || !cvc) {
      toast.error('Please enter your card details.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const normalizedCard = cardNumber.replace(/\s+/g, '');
    if (normalizedCard === TEST_DECLINE_CARD.replace(/\s+/g, '')) {
      navigate('/payment/failure');
      return;
    }
    try {
      await dispatch(createOrder({ shippingAddress: shipping, billingAddress: shipping })).unwrap();
      await dispatch(clearCart()).unwrap();
      navigate('/payment/success');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Payment could not be processed.';
      toast.error(message);
      navigate('/payment/failure');
    }
  };

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
              Checkout
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your payment securely
            </Typography>
          </Box>
          <Link
            component="button"
            variant="body2"
            onClick={handleBackToHome}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <ArrowBack sx={{ fontSize: 18 }} /> Back to home
          </Link>
        </Box>
      }
      bottom={
        <Box sx={{ maxWidth: 960, mx: 'auto', py: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Left: payment form */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                {/* Card information — Stripe-style block */}
                <GlassCard sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Card information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Lock sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Secure payment
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={2}>
                    <TextField
                      label="Card number"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumber}
                      fullWidth
                      size="medium"
                      sx={fieldSx}
                      inputProps={{ maxLength: 19 }}
                    />
                    <TextField
                      label="Name on card"
                      placeholder="Name as it appears on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      fullWidth
                      sx={fieldSx}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Expiry"
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={handleExpiry}
                          fullWidth
                          sx={fieldSx}
                          inputProps={{ maxLength: 7 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="CVC"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          fullWidth
                          sx={fieldSx}
                          inputProps={{ maxLength: 4 }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Test: 4242 4242 4242 4242 (success) · 4000 0000 0000 0002 (decline)
                  </Typography>
                </GlassCard>

                {/* Contact & shipping */}
                <GlassCard sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Contact and shipping
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Full name" value={shipping.fullName} onChange={handleChange('fullName')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email" type="email" value={shipping.email} onChange={handleChange('email')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Phone" value={shipping.phone} onChange={handleChange('phone')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Address" value={shipping.addressLine1} onChange={handleChange('addressLine1')} fullWidth required sx={fieldSx} placeholder="Street address" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Apartment, suite, etc. (optional)" value={shipping.addressLine2} onChange={handleChange('addressLine2')} fullWidth sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="City" value={shipping.city} onChange={handleChange('city')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="State" value={shipping.state} onChange={handleChange('state')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Postal code" value={shipping.zipCode} onChange={handleChange('zipCode')} fullWidth required sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Country"
                        value={shipping.country}
                        onChange={(e) => setShipping((prev) => ({ ...prev, country: e.target.value }))}
                        fullWidth
                        sx={fieldSx}
                      >
                        <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </GlassCard>
              </Stack>
            </Grid>

            {/* Right: order summary — Stripe-style sidebar */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
                <GlassCard sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Order summary
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 2, maxHeight: 220, overflow: 'auto' }}>
                    {items.map((item) => (
                      <Box key={item.furnitureId._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {item.furnitureId.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500} sx={{ flexShrink: 0 }}>
                          {formatCurrencyLKR(item.priceSnapshot * item.quantity)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Stack spacing={0.75} sx={{ pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2">{formatCurrencyLKR(subtotal)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Tax</Typography>
                      <Typography variant="body2">{formatCurrencyLKR(tax)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ pt: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Total</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary">
                        {formatCurrencyLKR(total)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading || !items.length}
                    startIcon={loading ? null : <Lock sx={{ fontSize: 18 }} />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {loading ? 'Processing…' : `Pay ${formatCurrencyLKR(total)}`}
                  </Button>
                </GlassCard>
              </Box>
            </Grid>
          </Grid>
        </Box>
      }
    />
  );
}

