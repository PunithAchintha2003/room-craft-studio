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
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { logoutUser } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/theme/ThemeModeProvider';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Furniture', href: '/furniture' },
  { label: 'My Designs', href: '/my-designs', protected: true },
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
      component="img"
      src="/rcs_logo_circular.svg"
      alt="RoomCraft Studio"
      sx={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
    <Typography
      variant="subtitle1"
      component="span"
      sx={{
        fontWeight: 600,
        color: 'text.primary',
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
  const { resolvedMode, toggleMode } = useThemeMode();
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
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              px: { xs: 2, sm: 3 },
              mt: 1.5,
              mb: 1.5,
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                py: 0,
                px: 1.5,
                borderRadius: 999,
                backgroundColor: theme.palette.glass.background,
                backdropFilter: `blur(${theme.palette.glass.blur}px)`,
                WebkitBackdropFilter: `blur(${theme.palette.glass.blur}px)`,
                border: `1px solid ${theme.palette.glass.border}`,
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
                {NAV_LINKS.filter(link => !link.protected || isAuthenticated).map((link) => (
                  <Button
                    key={link.label}
                    component={Link}
                    to={link.href}
                    variant="text"
                    size="medium"
                    sx={{
                      color: theme.palette.on.glass,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em',
                      minHeight: 44,
                      px: 2,
                      borderRadius: 2,
                      '&:hover': {
                        color: resolvedMode === 'dark'
                          ? theme.palette.on.primary
                          : theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          resolvedMode === 'dark' ? 0.28 : 0.10
                        ),
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
                <IconButton
                  size="medium"
                  onClick={toggleMode}
                  aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    color:
                      resolvedMode === 'dark'
                        ? theme.palette.on.glass
                        : theme.palette.text.secondary,
                  }}
                >
                  {resolvedMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>

                {isAuthenticated && user ? (
                  <>
                    <NotificationBell />
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
                      size="medium"
                      sx={{
                        minHeight: 44,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      color="secondary"
                      size="medium"
                      sx={{ minHeight: 44, fontWeight: 600, fontSize: '0.875rem', borderRadius: 999 }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>

              <IconButton
                sx={{
                  display: { md: 'none' },
                  ml: 0.5,
                  minWidth: 44,
                  minHeight: 44,
                  color: 'text.primary',
                }}
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
            backgroundColor: theme.palette.glass.background,
            backdropFilter: `blur(${theme.palette.glass.blur}px)`,
            WebkitBackdropFilter: `blur(${theme.palette.glass.blur}px)`,
            borderLeft: `1px solid ${theme.palette.glass.border}`,
            boxShadow: 'none',
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
          {NAV_LINKS.filter(link => !link.protected || isAuthenticated).map((link) => (
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={toggleMode}
              startIcon={resolvedMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            >
              {resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </Box>
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
