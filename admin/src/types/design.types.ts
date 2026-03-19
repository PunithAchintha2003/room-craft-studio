/**
 * Category slug stored in the backend (kebab-case).
 * Examples: "chair", "table", "outdoor", "kids-room".
 */
export type FurnitureCategory = string;

export type WallSide = 'north' | 'south' | 'east' | 'west';

export type RoomLayout =
  | 'rectangle'
  | 'l-shape'
  | 't-shape'
  | 'u-shape'
  | 'angled-bay';

export type CutoutPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface RoomOpening {
  id: string;
  type: 'door' | 'window';
  wall: WallSide;
  /** Width of the opening in meters (span along the wall) */
  width: number;
  /** Height of the opening in meters */
  height: number;
  /** Distance from floor to bottom of opening in meters */
  bottom: number;
  /** Offset from the left corner to the START of the opening (meters) */
  offset: number;
}

export interface RoomConfig {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
  layout?: RoomLayout;
  cutoutPosition?: CutoutPosition;
  cutoutWidth?: number;
  cutoutLength?: number;
  wallTexture?: string;
  floorTexture?: string;
  wallTextureScale?: number;
  floorTextureScale?: number;
  openings?: RoomOpening[];
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
