import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ShoppingBag,
  CheckCircle,
  LocalShipping,
  Cancel as CancelIcon,
  Visibility,
} from '@mui/icons-material';
import { TwoTonePageLayout } from '@/components/layout/TwoTonePageLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchOrders, cancelOrder } from '@/features/order/orderSlice';
import type { Order, OrderItem } from '@/features/order/orderSlice';
import { formatCurrencyLKR } from '@/utils/currency';
import { getAssetUrl } from '@/utils/assetUrl';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'delivered':
      return <CheckCircle />;
    case 'shipped':
      return <LocalShipping />;
    case 'cancelled':
      return <CancelIcon />;
    default:
      return <ShoppingBag />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'processing':
    case 'confirmed':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (orderToCancel) {
      await dispatch(cancelOrder(orderToCancel));
      setOrderToCancel(null);
      setCancelDialogOpen(false);
      setSelectedOrder(null);
      dispatch(fetchOrders({}));
    }
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  return (
    <TwoTonePageLayout
      top={
        <Box sx={{ py: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Order History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your orders
          </Typography>
        </Box>
      }
      bottom={
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        {/* Filter Controls */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="outlined" onClick={() => navigate('/furniture')}>
            Continue Shopping
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !orders.length ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <ShoppingBag sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {statusFilter === 'all'
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${statusFilter} orders.`}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/furniture')}
              sx={{ mt: 2 }}
            >
              Browse Furniture
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {filteredOrders.map((order) => (
              <GlassCard key={order._id} sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Order #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatCurrencyLKR(order.total)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleCancelClick(order._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </GlassCard>
            ))}
          </Stack>
        )}

        {/* Order Details Modal */}
        <Dialog
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">
                    Order #{selectedOrder.orderNumber}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedOrder.status)}
                    label={selectedOrder.status.toUpperCase()}
                    color={getStatusColor(selectedOrder.status) as any}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3}>
                  {/* Order Items */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Items
                    </Typography>
                    <Stack spacing={2}>
                      {selectedOrder.items.map((item: OrderItem, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Box
                            component="img"
                            src={getAssetUrl(item.thumbnail)}
                            alt={item.name}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              {formatCurrencyLKR(item.price)} each
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {formatCurrencyLKR(item.price * item.quantity)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Shipping Address */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Shipping Address
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2">{selectedOrder.shippingAddress.fullName}</Typography>
                      <Typography variant="body2">{selectedOrder.shippingAddress.addressLine1}</Typography>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <Typography variant="body2">{selectedOrder.shippingAddress.addressLine2}</Typography>
                      )}
                      <Typography variant="body2">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                        {selectedOrder.shippingAddress.zipCode}
                      </Typography>
                      <Typography variant="body2">{selectedOrder.shippingAddress.country}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedOrder.shippingAddress.email}
                      </Typography>
                      <Typography variant="body2">{selectedOrder.shippingAddress.phone}</Typography>
                    </Box>
                  </Box>

                  {/* Order Summary */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Order Summary
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Subtotal:</TableCell>
                          <TableCell align="right">
                            {formatCurrencyLKR(selectedOrder.subtotal)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tax:</TableCell>
                          <TableCell align="right">
                            {formatCurrencyLKR(selectedOrder.tax)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Shipping:</TableCell>
                          <TableCell align="right">
                            {formatCurrencyLKR(selectedOrder.shippingCost)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total:</TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}
                          >
                            {formatCurrencyLKR(selectedOrder.total)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Payment Info */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2">
                        Payment Method: {selectedOrder.paymentDetails.method}
                      </Typography>
                      <Typography variant="body2">
                        Status: {selectedOrder.paymentDetails.status}
                      </Typography>
                      {selectedOrder.paymentDetails.transactionId && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Transaction ID: {selectedOrder.paymentDetails.transactionId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions>
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                  <Button
                    color="error"
                    onClick={() => handleCancelClick(selectedOrder._id)}
                  >
                    Cancel Order
                  </Button>
                )}
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
        >
          <DialogTitle>Cancel Order?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this order? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Order</Button>
            <Button onClick={handleCancelConfirm} color="error">
              Yes, Cancel Order
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      }
    />
  );
}
