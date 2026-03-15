import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Products: [
    { label: 'Furniture', href: '/furniture' },
    { label: 'Room Designer', href: '/designer' },
    { label: 'Collections', href: '/collections' },
    { label: 'New Arrivals', href: '/new-arrivals' },
  ],
  Support: [
    { label: 'Help Centre', href: '/help' },
    { label: 'Delivery Info', href: '/delivery' },
    { label: 'Returns', href: '/returns' },
    { label: 'Warranty', href: '/warranty' },
  ],
};

const SOCIAL_LINKS = [
  { icon: <Facebook />, href: '#', label: 'Facebook' },
  { icon: <Instagram />, href: '#', label: 'Instagram' },
  { icon: <Twitter />, href: '#', label: 'Twitter' },
  { icon: <LinkedIn />, href: '#', label: 'LinkedIn' },
];

export const Footer: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const mutedText = isDark
    ? alpha(theme.palette.text.primary, 0.7)
    : alpha(theme.palette.text.primary, 0.7);
  const subtleText = isDark
    ? alpha(theme.palette.text.primary, 0.5)
    : alpha(theme.palette.text.primary, 0.5);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                component="img"
                src="/rcs_logo_circular.svg"
                alt="RoomCraft Studio"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
                RoomCraft{' '}
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  Studio
                </Box>
              </Typography>
            </Box>
            <Typography
              variant="body2"
                sx={{ color: mutedText, lineHeight: 1.8, mb: 3, maxWidth: 320 }}
            >
              Transform your living spaces with our interactive 2D & 3D furniture visualisation
              tool. Design your perfect room before you buy.
            </Typography>
            <Stack direction="row" spacing={1}>
              {SOCIAL_LINKS.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: mutedText,
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.18)}`,
                    borderRadius: '8px',
                    '&:hover': {
                      color: 'secondary.main',
                      borderColor: 'secondary.main',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <Grid item xs={6} sm={4} md={2} key={category}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: 'secondary.main', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}
              >
                {category}
              </Typography>
              <Stack spacing={1.5}>
                {links.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={Link}
                    to={link.href}
                    sx={{
                      color: mutedText,
                      fontSize: '0.875rem',
                      transition: 'color 0.2s',
                    '&:hover': {
                      color: isDark
                        ? theme.palette.text.primary
                        : theme.palette.primary.main,
                      textDecoration: 'none',
                    },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: 'secondary.main', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}
            >
              Contact
            </Typography>
            <Stack spacing={2}>
              {[
                { icon: <LocationOn fontSize="small" />, text: '123 Design Street, Colombo, Sri Lanka' },
                { icon: <Phone fontSize="small" />, text: '+94 77 123 4567' },
                { icon: <Email fontSize="small" />, text: 'hello@roomcraft.studio' },
              ].map(({ icon, text }) => (
                <Box key={text} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ color: 'secondary.main', mt: 0.1, flexShrink: 0 }}>{icon}</Box>
                  <Typography variant="body2" sx={{ color: mutedText }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider
          sx={{
            borderColor: alpha(
              isDark ? theme.palette.text.primary : '#FFFFFF',
              0.12
            ),
            mt: 6,
            mb: 3,
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
            <Typography variant="body2" sx={{ color: subtleText }}>
            © {new Date().getFullYear()} RoomCraft Studio. All rights reserved.
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
          >
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <MuiLink
                key={item}
                href="#"
                sx={{
                  color: subtleText,
                  fontSize: '0.8rem',
                    '&:hover': {
                      color: isDark
                        ? theme.palette.text.primary
                        : theme.palette.primary.main,
                      textDecoration: 'none',
                    },
                }}
              >
                {item}
              </MuiLink>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
