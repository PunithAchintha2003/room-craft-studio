import React from 'react';
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
  alpha,
  useTheme,
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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

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
    color: '#3B82F6',
  },
  {
    icon: <ViewInAr sx={{ fontSize: 32 }} />,
    title: '3D Visualisation',
    description:
      'Instantly convert your 2D layout into a photorealistic 3D scene. Rotate, zoom, and explore your room from any angle.',
    color: '#8B5CF6',
  },
  {
    icon: <Palette sx={{ fontSize: 32 }} />,
    title: 'Colour & Style',
    description:
      'Experiment with wall colours, furniture finishes, and materials. See how different combinations look in real time.',
    color: '#EC4899',
  },
  {
    icon: <Speed sx={{ fontSize: 32 }} />,
    title: 'Instant Preview',
    description:
      'Changes render immediately with no waiting. Our optimised Three.js engine delivers smooth, real-time graphics.',
    color: '#F59E0B',
  },
  {
    icon: <Security sx={{ fontSize: 32 }} />,
    title: 'Save & Share',
    description:
      'Save unlimited designs to your account. Share with family, friends, or your interior designer with a single link.',
    color: '#10B981',
  },
  {
    icon: <Star sx={{ fontSize: 32 }} />,
    title: 'Expert Guidance',
    description:
      'Our professional designers are available in-store to help you create the perfect room using the visualisation tool.',
    color: '#EF4444',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Homeowner',
    avatar: 'SM',
    rating: 5,
    text: "I was hesitant about buying a large sofa without seeing it in my room first. RoomCraft Studio let me visualise it perfectly — I ordered with complete confidence and it looks exactly as I imagined.",
  },
  {
    name: 'James Thornton',
    role: 'Interior Designer',
    avatar: 'JT',
    rating: 5,
    text: "As a professional designer, this tool has transformed my client consultations. I can show clients exactly how their room will look in minutes. It's become indispensable to my workflow.",
  },
  {
    name: 'Emma Clarke',
    role: 'First-time Buyer',
    avatar: 'EC',
    rating: 5,
    text: "The 3D view is absolutely stunning. I spent hours rearranging furniture and changing colours. When my order arrived, the room looked exactly like my design. Incredible tool!",
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

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: '85vh', sm: '90vh', md: '92vh' },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1B2E42 40%, #243447 70%, #1a2535 100%)`,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements — scale down on small screens */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: { xs: '280px', sm: '400px', md: '600px' },
            height: { xs: '280px', sm: '400px', md: '600px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-5%',
            width: { xs: '200px', sm: '300px', md: '400px' },
            height: { xs: '200px', sm: '300px', md: '400px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#3B82F6', 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Chip
                  label="✨ New: 3D Room Visualisation"
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
                    color: 'white',
                    mb: 3,
                    lineHeight: 1.05,
                  }}
                >
                  Design Your{' '}
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Dream Room
                  </Box>{' '}
                  Before You Buy
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha('#FFFFFF', 0.75),
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: 520,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                  }}
                >
                  Visualise any furniture in your actual room using our interactive 2D & 3D
                  designer. Make confident purchasing decisions — no more guessing if it will fit.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ px: 4, py: 1.75, fontSize: '1rem' }}
                  >
                    Start Designing Free
                  </Button>
                  <Button
                    component={Link}
                    to="/designer"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      color: 'white',
                      borderColor: alpha('#FFFFFF', 0.4),
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#FFFFFF', 0.08),
                      },
                    }}
                  >
                    View Demo
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
                        <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
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
                    boxShadow: `0 40px 80px ${alpha('#000000', 0.5)}`,
                    border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
                    aspectRatio: '16/10',
                    background: `linear-gradient(135deg, ${alpha('#1B2E42', 0.8)} 0%, ${alpha('#243447', 0.9)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <ViewInAr sx={{ fontSize: 80, color: alpha(theme.palette.secondary.main, 0.6), mb: 2 }} />
                    <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.5), fontWeight: 400 }}>
                      3D Room Preview
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.3), mt: 1 }}>
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
                          backgroundColor: i === 1 ? 'secondary.main' : alpha('#FFFFFF', 0.1),
                          color: i === 1 ? 'primary.main' : alpha('#FFFFFF', 0.7),
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

      {/* Stats Bar */}
      <Box sx={{ backgroundColor: 'secondary.main', py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} justifyContent="center">
            {STATS.map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ color: 'primary.main', lineHeight: 1 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#0D1B2A', 0.7), mt: 0.5, fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
              {FEATURES.map((feature) => (
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
                          backgroundColor: alpha(feature.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: feature.color,
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
              ))}
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* How It Works */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
                        boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`,
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
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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

            <Grid container spacing={3}>
              {TESTIMONIALS.map((testimonial) => (
                <Grid item xs={12} md={4} key={testimonial.name}>
                  <MotionCard
                    variants={fadeInUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    sx={{ height: '100%' }}
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
                        sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}
                      >
                        "{testimonial.text}"
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
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                          <Box>
                            <Rating value={testimonial.rating} readOnly size="small" />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1B2E42 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(232,160,69,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', px: { xs: 2, sm: 3 } }}>
          <AnimatedSection>
            <MotionBox variants={fadeInUp}>
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2.5,
                }}
              >
                Ready to design your perfect room?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
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
              >
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="secondary"
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
                    color: 'white',
                    borderColor: alpha('#FFFFFF', 0.4),
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: alpha('#FFFFFF', 0.08),
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
    </Box>
  );
};

export default WelcomePage;
