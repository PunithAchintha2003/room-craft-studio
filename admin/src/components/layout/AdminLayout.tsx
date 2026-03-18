import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Dashboard,
  People,
  DesignServices,
  Menu as MenuIcon,
  ChevronLeft,
  Logout,
  AdminPanelSettings,
  Chair as ChairIcon,
  RateReview,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { adminLogout } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/theme/ThemeModeProvider';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { label: 'All Designs', path: '/designs', icon: <DesignServices /> },
  { label: 'Furniture Management', path: '/furniture', icon: <ChairIcon /> },
  { label: 'User Management', path: '/users', icon: <People /> },
  { label: 'Designer Management', path: '/designers', icon: <DesignServices /> },
  { label: 'Review Management', path: '/reviews', icon: <RateReview /> },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/designs': 'All Designs',
  '/editor': 'Room Designer',
  '/furniture': 'Furniture Management',
  '/users': 'User Management',
  '/designers': 'Designer Management',
  '/reviews': 'Review Management',
};

export const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { resolvedMode, toggleMode } = useThemeMode();

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/login');
  };

  const drawerWidth = isMobile ? DRAWER_WIDTH : collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin';

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1 : 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          minHeight: 48,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              component="img"
              src="/rcs_logo_circular.svg"
              alt="RoomCraft Studio"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && !isMobile && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#0D1B2A',
              fontSize: '0.85rem',
            }}
          >
            RC
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setCollapsed((c) => !c)}
            sx={{ color: 'text.secondary', ml: collapsed ? 0 : 1 }}
          >
            <ChevronLeft
              sx={{
                transition: 'transform 0.2s',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

      {/* Nav items */}
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              title={collapsed && !isMobile ? item.label : ''}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: collapsed && !isMobile ? 1.5 : 1.5,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.18)
                      : alpha(theme.palette.action.hover, 0.08),
                    color: isActive ? 'primary.main' : 'text.primary',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && !isMobile ? 0 : 36,
                    color: 'inherit',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

      {/* User info at bottom */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.8rem',
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'A'}
        </Avatar>
        {(!collapsed || isMobile) && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name ?? 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              Administrator
            </Typography>
          </Box>
        )}
        {(!collapsed || isMobile) && (
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar — desktop */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: 'width 0.2s ease',
          }}
        >
          <Box
            sx={{
              width: drawerWidth,
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              transition: 'width 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {drawerContent}
          </Box>
        </Box>
      )}

      {/* Sidebar — mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin 0.2s ease',
        }}
      >
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: 64 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminPanelSettings sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700}>
                {pageTitle}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            {/* Theme toggle & desktop sign out */}
            <Tooltip title={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                size="small"
                onClick={toggleMode}
                sx={{ color: 'text.secondary', mr: !isMobile ? 1 : 0 }}
              >
                {resolvedMode === 'dark' ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderColor: alpha(theme.palette.divider, 0.8),
                  color: 'text.secondary',
                  minHeight: 36,
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                Sign Out
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
