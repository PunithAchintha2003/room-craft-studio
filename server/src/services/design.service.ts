import mongoose from 'mongoose';
import { Design, IDesign } from '../models/design.model';
import { Furniture } from '../models/furniture.model';
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

export const getAllDesignsForAdmin = async (): Promise<IDesign[]> => {
  const designs = await Design.find().sort({ updatedAt: -1 });
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

export const getPreviewDesign = async (furnitureId: string): Promise<IDesign> => {
  if (!mongoose.Types.ObjectId.isValid(furnitureId)) {
    throw new AppError('Invalid furniture ID for preview', 400);
  }

  const furniture = await Furniture.findById(furnitureId);

  if (!furniture) {
    throw new AppError('Furniture not found for preview', 404);
  }

  const previewDesign = new Design({
    userId: new mongoose.Types.ObjectId(),
    name: `${furniture.name} Preview`,
    description:
      'Temporary preview layout for viewing this furniture item in a sample room. This design is not saved.',
    room: {
      width: 5,
      length: 4,
      height: 3,
      wallColor: '#F5F5F5',
      floorColor: '#D2B48C',
    },
    furniture: [
      {
        furnitureId: furniture._id,
        position: { x: 2, y: 2 },
        rotation: 0,
        scale: 1,
        color: furniture.defaultColor,
      },
    ],
    isPublic: true,
  });

  return previewDesign;
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

