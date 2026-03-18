import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  alpha,
  useTheme,
  TextField,
  Button,
  Divider,
  Skeleton,
  Rating,
  Link as MuiLink,
} from '@mui/material';
import { StarRate } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BACKGROUND } from '@/theme/tokens';
import { useThemeMode } from '@/theme/ThemeModeProvider';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/notifications';
import { createReview, fetchPublicReviews, Review } from '@/services/reviews.api';

const MotionBox = motion.create(Box);

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z
    .string()
    .min(20, 'Review should be at least 20 characters')
    .max(1000, 'Review should be at most 1000 characters'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export const ReviewsPage: React.FC = () => {
  const theme = useTheme();
  const { resolvedMode } = useThemeMode();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const isDark = resolvedMode === 'dark';
  const pageBg = isDark
    ? `linear-gradient(135deg, ${BACKGROUND.dark.primary} 0%, ${BACKGROUND.dark.secondary} 50%, #020617 100%)`
    : `linear-gradient(135deg, ${BACKGROUND.light.primary} 0%, ${BACKGROUND.light.secondary} 40%, #E5E7EB 100%)`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicReviews();
        if (mounted) {
          setReviews(data);
        }
      } catch {
        if (mounted) {
          notify.error('Failed to load reviews. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location } });
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }
    try {
      setSubmitting(true);
      await createReview(data);
      notify.success('Thank you! Your review has been submitted and is awaiting approval.');
      reset({ rating: 0, comment: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit review. Please try again.';
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: pageBg,
        position: 'relative',
        overflow: 'hidden',
        mt: { xs: -4, sm: -7 },
      }}
    >
      {/* Left panel — reviews */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          px: 8,
          pt: 11,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(
              theme.palette.secondary.main,
              0.15
            )} 0%, transparent 70%)`,
          }}
        />
        <MotionBox
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography
            variant="h2"
            sx={{
              color: theme.palette.text.primary,
              mb: 2,
              mt: 1,
              fontSize: '2.5rem',
              lineHeight: 1.2,
            }}
          >
            Hear from the RoomCraft community
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha(theme.palette.text.primary, 0.8),
              lineHeight: 1.8,
              mb: 4,
              maxWidth: 520,
            }}
          >
            Real stories from homeowners and designers using RoomCraft Studio to plan, visualise,
            and shop for their dream spaces.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                boxShadow: '0px 10px 30px rgba(15,23,42,0.20)',
              }}
            >
              <StarRate sx={{ color: theme.palette.warning.main }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {averageRating ?? '—'} / 5.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on {reviews.length} approved review{reviews.length === 1 ? '' : 's'}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Box
            sx={{
              maxHeight: 380,
              pr: 1,
              pt: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.text.primary, 0.18),
                borderRadius: 999,
              },
            }}
          >
            {loading ? (
              <Stack spacing={2.5}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                    }}
                  >
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="70%" />
                  </Box>
                ))}
              </Stack>
            ) : reviews.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.85),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  No reviews yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be the first to share your experience with RoomCraft Studio.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {reviews.map((review) => (
                  <Box
                    key={review.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      boxShadow: '0px 10px 30px rgba(15,23,42,0.08)',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {review.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={review.rating} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {review.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha(theme.palette.text.primary, 0.9),
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {review.comment}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </MotionBox>
      </Box>

      {/* Right panel — form */}
      <Box
        sx={{
          flex: { xs: 1, lg: '0 0 480px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: theme.palette.glass.background,
            border: `1px solid ${theme.palette.glass.border}`,
            backdropFilter: `blur(${theme.palette.glass.blur}px)`,
            WebkitBackdropFilter: `blur(${theme.palette.glass.blur}px)`,
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            boxShadow: 'none',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Share your experience
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAuthenticated
                ? 'Tell others how RoomCraft Studio has helped you plan, visualise, or purchase with confidence.'
                : (
                  <>
                    Please{' '}
                    <MuiLink component={Link} to="/login" color="primary" fontWeight={600}>
                      sign in
                    </MuiLink>{' '}
                    to leave a review.
                  </>
                )}
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Submit a review"
          >
            <Stack spacing={2.5}>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                      Overall rating
                    </Typography>
                    <Rating
                      {...field}
                      value={field.value || 0}
                      onChange={(_, value) => field.onChange(value ?? 0)}
                      size="large"
                      precision={1}
                    />
                    {errors.rating && (
                      <Typography variant="caption" color="error.main">
                        {errors.rating.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your review"
                    multiline
                    minRows={4}
                    fullWidth
                    disabled={!isAuthenticated || submitting}
                    error={!!errors.comment}
                    helperText={errors.comment?.message ?? ''}
                    inputProps={{
                      maxLength: 1000,
                      'aria-label': 'Review text',
                      'aria-required': 'true',
                    }}
                  />
                )}
              />

              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleLoginRedirect}
                >
                  Sign in to write a review
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={!isAuthenticated || submitting}
                sx={{ py: 1.75, mt: 1 }}
                aria-label="Submit review"
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Reviews are moderated for quality and relevance.
            </Typography>
          </Divider>

          <Typography variant="caption" color="text.secondary">
            By submitting a review, you confirm that it reflects your genuine experience with RoomCraft
            Studio. Your name may be displayed alongside your review.
          </Typography>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default ReviewsPage;

