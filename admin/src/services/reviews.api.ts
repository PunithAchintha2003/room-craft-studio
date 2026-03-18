import api from './api';

export interface ReviewUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

export const fetchReviews = async (params: ReviewListParams): Promise<ReviewListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params.page) searchParams.page = String(params.page);
  if (params.limit) searchParams.limit = String(params.limit);
  if (params.search) searchParams.search = params.search;
  if (params.status && params.status !== 'all') searchParams.status = params.status;

  const { data } = await api.get<{ data: ReviewListResponse }>('/reviews', { params: searchParams });
  return data.data;
};

export const updateReviewStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Review> => {
  const { data } = await api.patch<{ data: { review: Review } }>(`/reviews/${id}/status`, { status });
  return data.data.review;
};

