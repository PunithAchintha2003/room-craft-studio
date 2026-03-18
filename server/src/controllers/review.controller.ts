import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Review } from '../models/review.model';
import { sendSuccess } from '../utils/response.util';
import { sendError } from '../utils/response.util';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(20).max(1000),
});

const listReviewsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const parsed = createReviewSchema.parse(req.body);

    const review = await Review.create({
      user: req.user.id,
      rating: parsed.rating,
      comment: parsed.comment,
      status: 'pending',
    });

    const populated = await review.populate('user', 'name avatar');

    sendSuccess(
      res,
      {
        review: {
          id: populated.id,
          rating: populated.rating,
          comment: populated.comment,
          status: populated.status,
          createdAt: populated.createdAt,
          user: {
            id: populated.user instanceof Object ? (populated.user as any).id : undefined,
            name: (populated as any).user.name,
            avatar: (populated as any).user.avatar ?? null,
          },
        },
      },
      'Review submitted successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name avatar')
      .lean();

    const data = reviews.map((r) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      user: {
        id: (r.user as any)._id,
        name: (r.user as any).name,
        avatar: (r.user as any).avatar ?? null,
      },
    }));

    sendSuccess(res, { reviews: data }, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const listReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = listReviewsQuerySchema.parse(req.query);
    const page = parsed.page ? Number(parsed.page) : 1;
    const limit = parsed.limit ? Number(parsed.limit) : 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (parsed.status) {
      filter.status = parsed.status;
    }

    const search = parsed.search?.trim();
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: filter },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { comment: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const [items, countResult] = await Promise.all([
      Review.aggregate(pipeline),
      Review.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;

    const reviews = items.map((r) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      user: {
        id: r.user._id,
        name: r.user.name,
        avatar: r.user.avatar ?? null,
      },
    }));

    sendSuccess(res, { reviews, total, page, limit }, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviewId = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const parsed = updateStatusSchema.parse(req.body);

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: parsed.status },
      { new: true }
    ).populate('user', 'name avatar');

    if (!review) {
      sendError(res, 'Review not found', 404);
      return;
    }

    sendSuccess(
      res,
      {
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          status: review.status,
          createdAt: review.createdAt,
          user: {
            id: (review.user as any)._id,
            name: (review.user as any).name,
            avatar: (review.user as any).avatar ?? null,
          },
        },
      },
      'Review status updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

