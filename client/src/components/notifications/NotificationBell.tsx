import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Notifications as BellIcon,
  NotificationsNone as BellEmptyIcon,
  CheckCircleOutline as CheckAllIcon,
  DeleteOutline as DeleteIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as SuccessIcon,
  WarningAmberOutlined as WarningIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { RootState, AppDispatch } from '@/app/store';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from '@/features/notifications/notificationSlice';
import { NotificationItem } from '@/services/notifications.api';

const typeIconMap = {
  info: <InfoIcon fontSize="small" sx={{ color: '#3B82F6' }} />,
  success: <SuccessIcon fontSize="small" sx={{ color: '#22C55E' }} />,
  warning: <WarningIcon fontSize="small" sx={{ color: '#F59E0B' }} />,
  error: <ErrorIcon fontSize="small" sx={{ color: '#EF4444' }} />,
};

const typeBgMap: Record<NotificationItem['type'], string> = {
  info: 'rgba(59,130,246,0.08)',
  success: 'rgba(34,197,94,0.08)',
  warning: 'rgba(245,158,11,0.08)',
  error: 'rgba(239,68,68,0.08)',
};

const NotificationBell: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { items, unreadCount, loading } = useSelector(
    (state: RootState) => state.notifications
  );
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      dispatch(fetchNotifications({ limit: 20 }));
    }
  };

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      dispatch(markNotificationRead(item._id));
    }
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title="Notifications">
        <IconButton
          ref={anchorRef}
          onClick={handleToggle}
          size="small"
          aria-label="notifications"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.text.primary },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                minWidth: 16,
                height: 16,
                padding: '0 4px',
              },
            }}
          >
            {unreadCount > 0 ? (
              <BellIcon fontSize="small" />
            ) : (
              <BellEmptyIcon fontSize="small" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {open && (
        <Paper
          ref={panelRef}
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxHeight: 520,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: theme.zIndex.modal,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
              {unreadCount > 0 && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    ml: 1,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 10,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </Typography>
              )}
            </Typography>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={handleMarkAll} color="primary">
                  <CheckAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Body */}
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {loading && items.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : items.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 5,
                  gap: 1,
                  color: 'text.secondary',
                }}
              >
                <BellEmptyIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                <Typography variant="body2">No notifications yet</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {items.map((item, idx) => (
                  <React.Fragment key={item._id}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => handleItemClick(item)}
                      sx={{
                        px: 2,
                        py: 1.25,
                        cursor: item.link ? 'pointer' : 'default',
                        bgcolor: item.read
                          ? 'transparent'
                          : typeBgMap[item.type],
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.06),
                        },
                        gap: 1,
                      }}
                    >
                      <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                        {typeIconMap[item.type]}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={item.read ? 400 : 600}
                            sx={{ lineHeight: 1.4 }}
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            {item.body && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mt: 0.25, lineHeight: 1.4 }}
                              >
                                {item.body}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              display="block"
                              sx={{ mt: 0.5 }}
                            >
                              {formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                              })}
                            </Typography>
                          </>
                        }
                        disableTypography
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          ml: 'auto',
                          flexShrink: 0,
                        }}
                      >
                        {!item.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMarkRead(e, item._id)}
                              sx={{ p: 0.5 }}
                            >
                              <CheckAllIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(e, item._id)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationBell;
