import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useScrollTrigger,
  Slide,
  alpha,
  useTheme,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { logoutUser } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Furniture', href: '/furniture' },
  { label: 'Room Designer', href: '/designer' },
  { label: 'About', href: '/about' },
];

interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll: React.FC<HideOnScrollProps> = ({ children }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Logo: React.FC = () => (
  <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #E8A045 0%, #F0B96A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.8125rem',
        color: '#0D1B2A',
        flexShrink: 0,
      }}
    >
      RC
    </Box>
    <Typography
      variant="subtitle1"
      component="span"
      sx={{
        fontWeight: 600,
        color: 'primary.main',
        letterSpacing: '-0.01em',
        display: { xs: 'none', sm: 'inline' },
      }}
    >
      RoomCraft
      <Box component="span" sx={{ color: 'secondary.main' }}>
        {' '}
        Studio
      </Box>
    </Typography>
  </Link>
);

export const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleUserMenuClose();
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: alpha('#FFFFFF', 0.98),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Toolbar
              disableGutters
              sx={{
                minHeight: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                py: 0,
              }}
            >
              <Logo />

              <Box sx={{ flexGrow: 1 }} />

              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 0.25,
                }}
              >
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.label}
                    component={Link}
                    to={link.href}
                    variant="text"
                    size="medium"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em',
                      minHeight: 44,
                      px: 2,
                      borderRadius: 2,
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  ml: 3,
                  pl: 3,
                  borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                {isAuthenticated && user ? (
                  <>
                    <IconButton
                      onClick={handleUserMenuOpen}
                      size="medium"
                      sx={{ minWidth: 44, minHeight: 44 }}
                      aria-haspopup="true"
                      aria-controls={anchorEl ? 'user-menu' : undefined}
                      aria-expanded={Boolean(anchorEl)}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                        }}
                        src={user.avatar}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                    <Menu
                      id="user-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleUserMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      slotProps={{
                        paper: {
                          elevation: 8,
                          sx: {
                            mt: 1.5,
                            minWidth: 220,
                            borderRadius: 2,
                            py: 0.5,
                          },
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Divider />
                      <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }} sx={{ py: 1.25 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                        <Typography variant="body2">Profile</Typography>
                      </MenuItem>
                      {user.role === 'admin' && (
                        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/dashboard'); }} sx={{ py: 1.25 }}>
                          <DashboardIcon fontSize="small" sx={{ mr: 1.5 }} />
                          <Typography variant="body2">Dashboard</Typography>
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.25 }}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                        <Typography variant="body2">Sign Out</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      variant="text"
                      color="primary"
                      size="medium"
                      sx={{ minHeight: 44, fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      Sign In
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      color="secondary"
                      size="medium"
                      sx={{ minHeight: 44, fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>

              <IconButton
                sx={{ display: { md: 'none' }, ml: 0.5, minWidth: 44, minHeight: 44 }}
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                size="medium"
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            maxWidth: '100vw',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
        }}
      >
        <Box
          sx={{
            minHeight: 56,
            px: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Logo />
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            size="medium"
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ py: 1, px: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                component={Link}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isAuthenticated ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
