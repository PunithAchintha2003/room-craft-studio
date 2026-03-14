import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Logout,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DesignServices,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/app/store';
import { designerLogout } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/theme/ThemeModeProvider';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Designer Dashboard',
};

interface DesignerLayoutProps {
  children: React.ReactNode;
}

export const DesignerLayout: React.FC<DesignerLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { resolvedMode, toggleMode } = useThemeMode();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Designer Portal';

  const handleLogout = async () => {
    await dispatch(designerLogout());
    navigate('/login');
  };

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
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
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
              color: '#FFFFFF',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            RC
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              RoomCraft Studio
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Designer Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

      {/* Nav items */}
      <List sx={{ px: 1, py: 1.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
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
                  minWidth: 36,
                  color: 'inherit',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

      {/* User info at bottom */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'D'}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.name ?? 'Designer'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            Designer
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
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
            width: DRAWER_WIDTH,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: DRAWER_WIDTH,
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 0.5,
                }}
              >
                <DesignServices sx={{ color: 'primary.main', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {pageTitle}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip
              title={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <IconButton
                size="small"
                onClick={toggleMode}
                sx={{ color: 'text.secondary', mr: 1 }}
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
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DesignerLayout;

