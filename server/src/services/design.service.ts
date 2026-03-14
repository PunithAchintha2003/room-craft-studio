import mongoose from 'mongoose';
import { Design, IDesign } from '../models/design.model';
import { AppError } from '../utils/AppError';
import { IDesignInput } from '../types/design.types';

export const createDesign = async (
  userId: string,
  input: IDesignInput
): Promise<IDesign> => {
  const design = await Design.create({
    userId,
    ...input,
  });
  return design;
};

export const getUserDesigns = async (userId: string): Promise<IDesign[]> => {
  const designs = await Design.find({ userId }).sort({ updatedAt: -1 });
  return designs;
};

export const getAllDesignsForDesigner = async (): Promise<IDesign[]> => {
  const designs = await Design.find().sort({ updatedAt: -1 }).populate('userId', 'name email');
  return designs;
};

export const getDesignById = async (
  designId: string,
  userId: string,
  role: 'user' | 'designer' | 'admin'
): Promise<IDesign> => {
  const design = await Design.findById(designId);

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  if (role === 'user' && design.userId.toString() !== userId && !design.isPublic) {
    throw new AppError('You do not have permission to view this design', 403);
  }

  return design;
};

export const getPublicDesign = async (designId: string): Promise<IDesign> => {
  const design = await Design.findOne({ _id: designId, isPublic: true });

  if (!design) {
    throw new AppError('Public design not found', 404);
  }

  return design;
};

export const updateDesign = async (
  designId: string,
  userId: string,
  role: 'user' | 'designer' | 'admin',
  input: Partial<IDesignInput>
): Promise<IDesign> => {
  const design = await Design.findById(designId);

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  if (role === 'user' && design.userId.toString() !== userId) {
    throw new AppError('You do not have permission to edit this design', 403);
  }

  Object.assign(design, input);
  await design.save();

  return design;
};

export const deleteDesign = async (
  designId: string,
  userId: string,
  role: 'user' | 'designer' | 'admin'
): Promise<void> => {
  const design = await Design.findById(designId);

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  if (role === 'user' && design.userId.toString() !== userId) {
    throw new AppError('You do not have permission to delete this design', 403);
  }

  await Design.findByIdAndDelete(designId);
};

export const duplicateDesign = async (
  designId: string,
  userId: string
): Promise<IDesign> => {
  const originalDesign = await Design.findById(designId);

  if (!originalDesign) {
    throw new AppError('Design not found', 404);
  }

  if (originalDesign.userId.toString() !== userId && !originalDesign.isPublic) {
    throw new AppError('You do not have permission to duplicate this design', 403);
  }

  const duplicateData = {
    userId: new mongoose.Types.ObjectId(userId),
    name: `${originalDesign.name} (Copy)`,
    description: originalDesign.description,
    room: originalDesign.room,
    furniture: originalDesign.furniture,
    isPublic: false,
  };

  const newDesign = await Design.create(duplicateData);
  return newDesign;
};

export interface DesignSummaryPoint {
  date: string;
  count: number;
}

export interface DesignDashboardSummary {
  totalDesigns: number;
  designsPerDay: DesignSummaryPoint[];
}

export const getDesignDashboardSummary = async (): Promise<DesignDashboardSummary> => {
  const totalDesigns = await Design.countDocuments();

  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const raw = await Design.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const designsPerDay: DesignSummaryPoint[] = raw.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  return {
    totalDesigns,
    designsPerDay,
  };
};

