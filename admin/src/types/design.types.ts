export type FurnitureCategory = 'chair' | 'table' | 'sofa' | 'bed' | 'storage';

export interface RoomConfig {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export interface FurnitureItem {
  id: string;
  furnitureId: string;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  scale: number;
  color?: string;
}

export interface Design {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  room: RoomConfig;
  furniture: FurnitureItem[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Furniture {
  _id: string;
  name: string;
  category: FurnitureCategory;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  thumbnail: string;
  thumbnailAlt?: string;
  model3D: {
    url: string;
    format: 'gltf' | 'glb';
  };
  defaultColor: string;
  isColorizable: boolean;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignInput {
  name: string;
  description?: string;
  room: RoomConfig;
  furniture?: FurnitureItem[];
  isPublic?: boolean;
}

export type UpdateDesignInput = Partial<CreateDesignInput>;
