import { Box, Typography, Stack, Button } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 2.5, md: 3 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Payment successful
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thank you for your order. We're getting your furniture ready.
          </Typography>
        </Box>
      }
      bottom={
        <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 4, textAlign: 'center' }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Payment completed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your order has been created successfully. You can track its progress from your order
            history once it is processed by our team.
          </Typography>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
            <Button variant="contained" onClick={() => navigate('/')}>
              Go to Home
            </Button>
            <Button variant="outlined" onClick={() => navigate('/orders')}>
              View Order History
            </Button>
          </Stack>
        </Box>
      }
    />
  );
}
