import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Rating,
  useTheme,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  ViewInAr,
  GridView,
  Palette,
  Speed,
  Security,
  Star,
  ArrowForward,
  CheckCircle,
  FormatQuote,
  LocalShipping,
  AssignmentReturn,
  Lock,
  ShoppingCart,
  Chair as ChairIcon,
  Weekend as SofaIcon,
  Bed as BedIcon,
  TableBar as TableIcon,
  Inventory2 as StorageIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { BACKGROUND, GLASS, FEATURE_ICON_COLORS } from '@/theme/tokens';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchFeaturedFurniture } from '@/features/furniture/furnitureSlice';
import { ProductCard } from '@/components/product/ProductCard';
import type { FurnitureCategory } from '@/types/design.types';
import { fetchPublicReviews, type Review } from '@/services/reviews.api';
import { formatCurrencyLKR } from '@/utils/currency';

const SHOP_CATEGORIES: { value: FurnitureCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'chair', label: 'Chairs', icon: <ChairIcon /> },
  { value: 'sofa', label: 'Sofas', icon: <SofaIcon /> },
  { value: 'bed', label: 'Beds', icon: <BedIcon /> },
  { value: 'table', label: 'Tables', icon: <TableIcon /> },
  { value: 'storage', label: 'Storage', icon: <StorageIcon /> },
];

const TRUST_ITEMS = [
  { icon: LocalShipping, text: `Free delivery on orders over ${formatCurrencyLKR(50)}` },
  { icon: AssignmentReturn, text: '30-day return policy' },
  { icon: Lock, text: 'Secure checkout' },
];

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

interface AnimatedSectionProps {
  children: React.ReactNode;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer}>
      {children}
    </motion.div>
  );
};

const FEATURES = [
  {
    icon: <GridView sx={{ fontSize: 32 }} />,
    title: '2D Layout Editor',
    description:
      'Drag and drop furniture pieces onto a top-down floor plan. Precisely position every item to match your room dimensions.',
  },
  {
    icon: <ViewInAr sx={{ fontSize: 32 }} />,
    title: '3D Visualisation',
    description:
      'Instantly convert your 2D layout into a photorealistic 3D scene. Rotate, zoom, and explore your room from any angle.',
  },
  {
    icon: <Palette sx={{ fontSize: 32 }} />,
    title: 'Colour & Style',
    description:
      'Experiment with wall colours, furniture finishes, and materials. See how different combinations look in real time.',
  },
  {
    icon: <Speed sx={{ fontSize: 32 }} />,
    title: 'Instant Preview',
    description:
      'Changes render immediately with no waiting. Our optimised Three.js engine delivers smooth, real-time graphics.',
  },
  {
    icon: <Security sx={{ fontSize: 32 }} />,
    title: 'Save & Share',
    description:
      'Save unlimited designs to your account. Share with family, friends, or your interior designer with a single link.',
  },
  {
    icon: <Star sx={{ fontSize: 32 }} />,
    title: 'Expert Guidance',
    description:
      'Our professional designers are available in-store to help you create the perfect room using the visualisation tool.',
  },
];

const STATS = [
  { value: '50,000+', label: 'Designs Created' },
  { value: '12,000+', label: 'Happy Customers' },
  { value: '500+', label: 'Furniture Items' },
  { value: '4.9/5', label: 'Average Rating' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter Your Room',
    description: 'Input your room dimensions and shape. Upload a photo or start with a blank canvas.',
  },
  {
    step: '02',
    title: 'Add Furniture',
    description: 'Browse our catalogue and drag furniture into your 2D floor plan. Scale items to fit perfectly.',
  },
  {
    step: '03',
    title: 'Visualise in 3D',
    description: 'Switch to 3D view instantly. Adjust colours, lighting, and materials to match your vision.',
  },
  {
    step: '04',
    title: 'Shop with Confidence',
    description: 'Save your design and purchase directly. Every item in the visualiser is available to buy.',
  },
];

export const WelcomePage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const glass = mode === 'dark' ? GLASS.dark : GLASS.light;
  const featureIconColors =
    mode === 'dark' ? FEATURE_ICON_COLORS.dark : FEATURE_ICON_COLORS.light;
  const background = mode === 'dark' ? BACKGROUND.dark : BACKGROUND.light;
  const dispatch = useAppDispatch();
  const { featuredFurniture, loading: featuredLoading } = useAppSelector((state) => state.furniture);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFeaturedFurniture(8));
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const reviews = await fetchPublicReviews();
        if (!isMounted) return;
        setPublicReviews(reviews);
      } catch (error) {
        if (!isMounted) return;
        setReviewsError('Failed to load reviews');
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestThreeReviews = publicReviews.slice(0, 3);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
    return (parts[0]![0] ?? '').toUpperCase() + (parts[1]![0] ?? '').toUpperCase();
  };

  const heroAndTopContent = (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 10 },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 0 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Chip
                  label="Furniture & room design"
                  sx={{
                    mb: 3,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    color: 'secondary.main',
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                    color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                    mb: 3,
                    lineHeight: 1.05,
                  }}
                >
                  Shop{' '}
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Furniture
                  </Box>{' '}
                  — Design Your Room in 3D
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      mode === 'dark'
                        ? alpha(theme.palette.text.primary, 0.8)
                        : theme.palette.text.secondary,
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: 520,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                  }}
                >
                  Browse our collection and visualise any piece in your room with our 2D & 3D
                  designer. Buy with confidence — no more guessing if it will fit.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                  <Button
                    component={Link}
                    to="/furniture"
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<ShoppingCart />}
                    sx={{ px: 4, py: 1.75, fontSize: '1rem' }}
                  >
                    Shop Furniture
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      color: theme.palette.text.primary,
                      borderColor: alpha(theme.palette.text.primary, 0.25),
                      '&:hover': {
                        borderColor: alpha(theme.palette.text.primary, 0.4),
                        backgroundColor:
                          mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.22)
                            : alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    Design in 3D
                  </Button>
                </Stack>
                <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" useFlexGap>
                  {['No credit card required', 'Free forever plan', '500+ furniture items'].map(
                    (item) => (
                      <Box
                        key={item}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                      >
                        <CheckCircle sx={{ color: 'secondary.main', fontSize: 18 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              mode === 'dark'
                                ? alpha(theme.palette.text.primary, 0.75)
                                : alpha(theme.palette.text.primary, 0.7),
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    )
                  )}
                </Stack>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: `1px solid ${alpha(
                      mode === 'dark' ? theme.palette.on.glass : theme.palette.text.primary,
                      0.16
                    )}`,
                    aspectRatio: '16/10',
                    backgroundColor:
                      mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.96)
                        : alpha(theme.palette.background.paper, 0.98),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <ViewInAr
                      sx={{
                        fontSize: 80,
                        color: alpha(theme.palette.secondary.main, 0.7),
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color:
                          mode === 'dark'
                            ? alpha(theme.palette.text.primary, 0.7)
                            : alpha(theme.palette.text.primary, 0.7),
                        fontWeight: 500,
                      }}
                    >
                      3D Room Preview
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          mode === 'dark'
                            ? alpha(theme.palette.text.secondary, 0.7)
                            : alpha(theme.palette.text.secondary, 0.8),
                        mt: 1,
                      }}
                    >
                      Interactive visualisation loads here
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    {['2D Layout', '3D View', 'Colours'].map((tab, i) => (
                      <Chip
                        key={tab}
                        label={tab}
                        size="small"
                        sx={{
                              backgroundColor:
                                i === 1
                                  ? 'secondary.main'
                                  : alpha(theme.palette.text.primary, 0.08),
                          color:
                            i === 1
                              ? 'primary.main'
                              : alpha(theme.palette.text.primary, 0.8),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust / services bar */}
      <Box sx={{ pb: { xs: 4, md: 5 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{
              flexWrap: 'wrap',
              gap: 2,
              py: 2,
              px: 2,
            }}
          >
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <Stack key={text} direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'secondary.main',
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Shop by category */}
      <Box sx={{ pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, textAlign: 'center' }}>
            Shop by category
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ gap: 1 }}
          >
            {SHOP_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                component={Link}
                to={`/furniture?category=${cat.value}`}
                variant="outlined"
                size="medium"
                startIcon={cat.icon}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                  },
                }}
              >
                {cat.label}
              </Button>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Featured products */}
      <Box sx={{ pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Featured furniture
            </Typography>
            <Button
              component={Link}
              to="/furniture"
              endIcon={<ArrowForward />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              View all
            </Button>
          </Box>
          {featuredLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : featuredFurniture.length > 0 ? (
            <Grid container spacing={3}>
              {featuredFurniture.slice(0, 8).map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <ProductCard
                    furniture={{
                      _id: item._id,
                      name: item.name,
                      category: item.category,
                      price: item.price ?? 0,
                      thumbnail: item.thumbnail,
                      stock: item.stock,
                      featured: (item as { featured?: boolean }).featured,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                py: 6,
                textAlign: 'center',
                color: 'text.secondary',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">No featured items right now. Browse our full catalog.</Typography>
              <Button component={Link} to="/furniture" variant="contained" color="secondary" sx={{ mt: 2 }}>
                Shop furniture
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{
          pb: { xs: 6, md: 8 },
          backgroundColor: 'transparent',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <Box
            className="glass-surface"
            sx={{
              borderRadius: 999,
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 2.5, md: 3 },
              backdropFilter: `blur(${glass.blur}px)`,
              WebkitBackdropFilter: `blur(${glass.blur}px)`,
              backgroundColor: glass.background,
              border: `1px solid ${glass.border}`,
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {STATS.map((stat) => (
                <Grid item xs={6} sm={3} key={stat.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        color: theme.palette.on.glass,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha(theme.palette.on.glass, 0.8),
                        mt: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );

  const lowerContent = (
    <>
      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <AnimatedSection>
            <MotionBox variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Features"
                sx={{
                  mb: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                Everything you need to design with confidence
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', fontSize: '1.125rem' }}
              >
                Our comprehensive suite of tools makes furniture visualisation intuitive,
                accurate, and enjoyable.
              </Typography>
            </MotionBox>

            <Grid container spacing={3}>
              {FEATURES.map((feature, index) => {
                const color = featureIconColors[index];
                return (
                  <Grid item xs={12} sm={6} lg={4} key={feature.title}>
                  <MotionCard
                    variants={fadeInUp}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    sx={{ height: '100%', cursor: 'default' }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          backgroundColor: alpha(color, mode === 'dark' ? 0.2 : 0.12),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color,
                          mb: 2.5,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </MotionCard>
                  </Grid>
                );
              })}
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* How It Works */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <AnimatedSection>
            <MotionBox variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="How It Works"
                sx={{
                  mb: 2,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                  color: 'secondary.dark',
                  fontWeight: 600,
                }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                From idea to reality in four steps
              </Typography>
            </MotionBox>

            <Grid container spacing={4}>
              {HOW_IT_WORKS.map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={step.step}>
                  <MotionBox variants={fadeInUp} sx={{ textAlign: 'center', position: 'relative' }}>
                    {index < HOW_IT_WORKS.length - 1 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          position: 'absolute',
                          top: 28,
                          right: '-20%',
                          width: '40%',
                          height: 2,
                          background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                          zIndex: 0,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: 'none',
                      }}
                    >
                      <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                        {step.step}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                      {step.description}
                    </Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <AnimatedSection>
            <MotionBox variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Testimonials"
                sx={{
                  mb: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                Loved by homeowners and designers
              </Typography>
            </MotionBox>

            {reviewsLoading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <MotionCard
                      variants={fadeInUp}
                      className="glass-surface"
                      sx={{
                        height: '100%',
                        backdropFilter: `blur(${glass.blur}px)`,
                        WebkitBackdropFilter: `blur(${glass.blur}px)`,
                        backgroundColor: glass.background,
                        border: `1px solid ${glass.border}`,
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="90%" sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={44} height={44} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                          </Box>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            ) : latestThreeReviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No reviews yet.
                </Typography>
                <Typography variant="body2">
                  Be the first to share your experience after shopping with RoomCraft Studio.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {latestThreeReviews.map((review) => (
                  <Grid item xs={12} md={4} key={review.id}>
                    <MotionCard
                      variants={fadeInUp}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="glass-surface"
                      sx={{
                        height: '100%',
                        backdropFilter: `blur(${glass.blur}px)`,
                        WebkitBackdropFilter: `blur(${glass.blur}px)`,
                        backgroundColor: glass.background,
                        border: `1px solid ${glass.border}`,
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <FormatQuote
                          sx={{
                            fontSize: 40,
                            color: 'secondary.main',
                            opacity: 0.6,
                            mb: 1,
                            transform: 'scaleX(-1)',
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.8,
                            mb: 3,
                            fontStyle: 'italic',
                          }}
                        >
                          "{review.comment}"
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              fontWeight: 700,
                              width: 44,
                              height: 44,
                            }}
                          >
                            {getInitials(review.user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {review.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Verified customer
                            </Typography>
                            <Box>
                              <Rating value={review.rating} readOnly size="small" precision={0.5} />
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </AnimatedSection>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          px: { xs: 2, sm: 3 },
          bgcolor: background.primary,
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', px: { xs: 0 } }}>
          <AnimatedSection>
            <MotionBox variants={fadeInUp}>
              <Typography
                variant="h2"
                sx={{
                  color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2.5,
                }}
              >
                Ready to shop or design your room?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color:
                    mode === 'dark'
                      ? alpha(theme.palette.text.primary, 0.8)
                      : alpha(theme.palette.text.secondary, 0.9),
                  mb: 5,
                  fontWeight: 400,
                  lineHeight: 1.7,
                }}
              >
                Join over 12,000 customers who have already transformed their homes with
                RoomCraft Studio. Start for free — no credit card needed.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  component={Link}
                  to="/furniture"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<ShoppingCart />}
                  sx={{ px: 5, py: 1.75, fontSize: '1rem' }}
                >
                  Shop Furniture
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ px: 5, py: 1.75, fontSize: '1rem' }}
                >
                  Create Free Account
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 5,
                    py: 1.75,
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderColor: alpha(theme.palette.text.primary, 0.25),
                    '&:hover': {
                      borderColor: alpha(theme.palette.text.primary, 0.4),
                      backgroundColor:
                        mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.22)
                          : alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </MotionBox>
          </AnimatedSection>
        </Container>
      </Box>
    </>
  );

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ maxWidth: '100%', mx: 'auto', bgcolor: background.primary }}>
          {heroAndTopContent}
        </Box>
      }
      bottom={
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
          {lowerContent}
        </Box>
      }
      variant="default"
    />
  );
};

export default WelcomePage;
