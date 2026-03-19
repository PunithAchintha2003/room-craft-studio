import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Architecture,
  Verified,
  AutoAwesome,
  Shield,
  Public,
  ArrowForward,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BACKGROUND, GLASS } from '@/theme/tokens';

const VALUE_CARDS = [
  {
    icon: <Architecture sx={{ fontSize: 26 }} />,
    title: 'Design-first',
    description:
      'We build tools that help you confidently plan spaces with accurate 2D layouts and immersive 3D previews.',
  },
  {
    icon: <Verified sx={{ fontSize: 26 }} />,
    title: 'Trusted shopping',
    description:
      'See how furniture fits before you buy, so you can shop with clarity and fewer surprises.',
  },
  {
    icon: <Shield sx={{ fontSize: 26 }} />,
    title: 'Privacy & security',
    description:
      'We protect your account and design data with modern security practices and principled access controls.',
  },
];

const HIGHLIGHTS = [
  {
    icon: <AutoAwesome sx={{ fontSize: 22 }} />,
    label: '2D → 3D in seconds',
    text: 'Switch from a floor plan to a walkthrough-style 3D view instantly.',
  },
  {
    icon: <Public sx={{ fontSize: 22 }} />,
    label: 'Built for real homes',
    text: 'Designed for everyday room sizes, common furniture categories, and practical constraints.',
  },
];

export const AboutPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const glass = mode === 'dark' ? GLASS.dark : GLASS.light;
  const background = mode === 'dark' ? BACKGROUND.dark : BACKGROUND.light;

  return (
    <>
      <Helmet>
        <title>About | RoomCraft Studio</title>
        <meta
          name="description"
          content="Learn about RoomCraft Studio—our mission, product, and principles for helping you design and shop furniture with confidence."
        />
      </Helmet>

      <Box
        sx={{
          mt: { xs: -4, sm: -7 },
          background: mode === 'dark'
            ? `radial-gradient(1200px 700px at 15% 10%, ${alpha(
                theme.palette.secondary.main,
                0.18
              )} 0%, transparent 55%),
               radial-gradient(900px 600px at 85% 20%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 60%),
               linear-gradient(135deg, ${background.primary} 0%, ${background.secondary} 55%, #020617 100%)`
            : `radial-gradient(1200px 700px at 15% 10%, ${alpha(
                theme.palette.secondary.main,
                0.16
              )} 0%, transparent 55%),
               radial-gradient(900px 600px at 85% 20%, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 60%),
               linear-gradient(135deg, ${background.primary} 0%, ${background.secondary} 55%, #E5E7EB 100%)`,
          minHeight: '100vh',
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 } }}>
          <Stack spacing={3} sx={{ mb: { xs: 6, md: 8 } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="About RoomCraft Studio"
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.16),
                  color: mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.28)}`,
                  fontWeight: 650,
                }}
              />
              <Chip
                label="Furniture • Room design • Visualisation"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, mode === 'dark' ? 0.18 : 0.10),
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                  fontWeight: 600,
                }}
              />
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
              }}
            >
              Design your room with confidence.
              <Box
                component="span"
                sx={{
                  display: 'block',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Shop furniture without guessing.
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                maxWidth: 760,
                color: alpha(theme.palette.text.primary, 0.8),
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              RoomCraft Studio is a furniture shopping and room visualisation experience that helps you plan
              layouts in 2D, preview in 3D, and purchase with clarity. We focus on great UX, accurate sizing,
              and fast, real-time feedback.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                component={Link}
                to="/furniture"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ px: 4, py: 1.5, fontWeight: 800, borderRadius: 999 }}
              >
                Browse furniture
              </Button>
              <Button
                component={Link}
                to="/reviews"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 999,
                  color: theme.palette.text.primary,
                  borderColor: alpha(theme.palette.text.primary, 0.25),
                  '&:hover': {
                    borderColor: alpha(theme.palette.text.primary, 0.45),
                    backgroundColor: alpha(theme.palette.primary.main, mode === 'dark' ? 0.22 : 0.06),
                  },
                }}
              >
                See customer reviews
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3} sx={{ mb: { xs: 6, md: 8 } }}>
            {VALUE_CARDS.map((card) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Card
                  className="glass-surface"
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    backdropFilter: `blur(${glass.blur}px)`,
                    WebkitBackdropFilter: `blur(${glass.blur}px)`,
                    backgroundColor: glass.background,
                    border: `1px solid ${glass.border}`,
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        backgroundColor: alpha(theme.palette.secondary.main, mode === 'dark' ? 0.22 : 0.12),
                        color: theme.palette.secondary.main,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.75), lineHeight: 1.8 }}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card
                className="glass-surface"
                sx={{
                  borderRadius: 4,
                  backdropFilter: `blur(${glass.blur}px)`,
                  WebkitBackdropFilter: `blur(${glass.blur}px)`,
                  backgroundColor: glass.background,
                  border: `1px solid ${glass.border}`,
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                    What we do
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.8), lineHeight: 1.9 }}>
                    We combine an interactive room designer with an e-commerce catalog so you can explore furniture
                    options, check proportions, and make decisions faster. Our focus is on:
                  </Typography>

                  <Stack spacing={2.25} sx={{ mt: 3 }}>
                    {HIGHLIGHTS.map((h) => (
                      <Box key={h.label} sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            backgroundColor: alpha(theme.palette.primary.main, mode === 'dark' ? 0.18 : 0.10),
                            color: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            mt: 0.2,
                          }}
                        >
                          {h.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 0.25 }}>
                            {h.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.75), lineHeight: 1.8 }}>
                            {h.text}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.6) }} />

                  <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6) }}>
                    Note: This page uses placeholder company details where needed (e.g., legal links). You can swap
                    those for your final policy pages when ready.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card
                className="glass-surface"
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  backdropFilter: `blur(${glass.blur}px)`,
                  WebkitBackdropFilter: `blur(${glass.blur}px)`,
                  backgroundColor: glass.background,
                  border: `1px solid ${glass.border}`,
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                    Quick facts
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {[
                      { k: 'Product', v: 'Room design + furniture shopping' },
                      { k: 'Core tools', v: '2D layout editor, 3D visualisation, saved designs' },
                      { k: 'Support', v: 'Help Centre, delivery/returns info, moderated reviews' },
                      { k: 'Contact', v: 'hello@roomcraft.studio' },
                    ].map((row) => (
                      <Box key={row.k} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.65) }}>
                          {row.k}
                        </Typography>
                        <Typography variant="body2" fontWeight={650} sx={{ textAlign: 'right' }}>
                          {row.v}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ flex: 1 }} />

                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    Create your account
                  </Button>

                  <Button
                    component={Link}
                    to="/"
                    variant="text"
                    sx={{ mt: 1, fontWeight: 700, color: alpha(theme.palette.text.primary, 0.8) }}
                  >
                    Back to home
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;

