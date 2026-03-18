import { Box, Typography, Button } from '@mui/material';
import { HighlightOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 2.5, md: 3 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Payment unsuccessful
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We couldn't process your payment. No charges were made.
          </Typography>
        </Box>
      }
      bottom={
        <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 4, textAlign: 'center' }}>
          <HighlightOff color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Payment failed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please double-check your card details or try a different test card number. You can return
            home to try again.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Box>
      }
    />
  );
}
