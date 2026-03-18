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

export const fetchPublicReviews = async (): Promise<Review[]> => {
  const { data } = await api.get<{ data: { reviews: Review[] } }>('/reviews/public');
  return data.data.reviews;
};

export const createReview = async (payload: {
  rating: number;
  comment: string;
}): Promise<Review> => {
  const { data } = await api.post<{ data: { review: Review } }>('/reviews', payload);
  return data.data.review;
};

