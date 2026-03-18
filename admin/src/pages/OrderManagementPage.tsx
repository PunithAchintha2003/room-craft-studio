import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  TextField,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  type OrderStatus,
} from '@/features/orders/adminOrderSlice';
import { formatCurrencyLKR } from '@/utils/currency';

const statusColor: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  processing: 'primary',
  confirmed: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  failed: 'error',
  refunded: 'default',
};

export const OrderManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((s: RootState) => s.adminOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchAdminOrders(statusFilter === 'all' ? undefined : { status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleAccept = (id: string) => {
    dispatch(updateAdminOrderStatus({ orderId: id, status: 'confirmed' }));
  };

  const handleDelivered = (id: string) => {
    dispatch(updateAdminOrderStatus({ orderId: id, status: 'delivered' }));
  };

  const handleRefresh = () => {
    dispatch(fetchAdminOrders(statusFilter === 'all' ? undefined : { status: statusFilter }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Order Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Review new orders, accept them, and mark deliveries.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} sx={{ color: 'text.secondary' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <TextField
          select
          size="small"
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Accepted</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        {loading && !orders.length ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <Typography variant="h6" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New customer orders will appear here as they are created.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell align="right">{order.items.length}</TableCell>
                  <TableCell align="right">{formatCurrencyLKR(order.total)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.toUpperCase()}
                      size="small"
                      color={statusColor[order.status]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                      sx={{ minWidth: 180 }}
                    >
                      {order.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAccept(order._id)}
                        >
                          Accept
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDelivered(order._id)}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
};

export default OrderManagementPage;

