import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  alpha,
  useTheme,
  Stack,
  Button,
} from '@mui/material';
import {
  Search,
  Refresh,
  ThumbUpAlt,
  ThumbDownAlt,
  RateReview,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { fetchReviews, Review, updateReviewStatus } from '@/services/reviews.api';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export const ReviewManagementPage: React.FC = () => {
  const theme = useTheme();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchReviews({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter,
        search: search || undefined,
      });
      setReviews(result.reviews);
      setTotal(result.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reviews';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, search]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleUpdateStatus = async (review: Review, status: 'approved' | 'rejected') => {
    try {
      const updated = await updateReviewStatus(review.id, status);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(`Review ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status';
      toast.error(msg);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusChipColor = (status: Review['status']) => {
    if (status === 'approved') {
      return {
        bg: alpha('#10B981', 0.12),
        color: '#10B981',
      };
    }
    if (status === 'rejected') {
      return {
        bg: alpha('#EF4444', 0.12),
        color: '#EF4444',
      };
    }
    return {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.main,
    };
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Review Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Review, approve, or reject user feedback before it appears on the public Reviews page.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadReviews} sx={{ color: 'text.secondary' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main,
            }}
          >
            <RateReview />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1 }}>
              {loading ? '…' : total}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Total reviews
            </Typography>
          </Box>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by reviewer or comment…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
            {loading ? '…' : `${total} review${total !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Reviewer
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Rating
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Comment
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Submitted
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  align="right"
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton variant="text" width={160} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={70} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={260} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="rounded" width={80} height={24} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="rounded" width={120} height={32} />
                      </TableCell>
                    </TableRow>
                  ))
                : reviews.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <RateReview
                          sx={{
                            fontSize: 40,
                            color: alpha(theme.palette.primary.main, 0.3),
                            mb: 1,
                            display: 'block',
                            mx: 'auto',
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No reviews found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                : reviews.map((review) => {
                    const { bg, color } = statusChipColor(review.status);
                    const shortComment =
                      review.comment.length > 140
                        ? `${review.comment.slice(0, 140)}…`
                        : review.comment;

                    return (
                      <TableRow key={review.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={600}>
                              {review.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              ID: {review.user.id}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {review.rating.toFixed(1)} / 5
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={review.comment} placement="top-start">
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 320,
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {shortComment}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatDate(review.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={
                              review.status.charAt(0).toUpperCase() + review.status.slice(1)
                            }
                            size="small"
                            sx={{
                              backgroundColor: bg,
                              color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Approve">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateStatus(review, 'approved')}
                                  disabled={review.status === 'approved'}
                                  sx={{ color: review.status === 'approved' ? 'success.main' : 'text.secondary' }}
                                >
                                  <ThumbUpAlt fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateStatus(review, 'rejected')}
                                  disabled={review.status === 'rejected'}
                                  sx={{ color: review.status === 'rejected' ? 'error.main' : 'text.secondary' }}
                                >
                                  <ThumbDownAlt fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
        />
      </Card>
    </Box>
  );
};

export default ReviewManagementPage;

