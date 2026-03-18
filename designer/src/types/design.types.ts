/**
 * Category slug stored in the backend (kebab-case).
 * Examples: "chair", "table", "outdoor", "kids-room".
 */
export type FurnitureCategory = string;

export type WallSide = 'north' | 'south' | 'east' | 'west';

export interface RoomOpening {
  id: string;
  type: 'door' | 'window';
  wall: WallSide;
  /**
   * Width of the opening in meters (horizontal span along the wall)
   */
  width: number;
  /**
   * Height of the opening in meters
   * For doors this is typically 2.0–2.2m, for windows smaller
   */
  height: number;
  /**
   * Distance from the floor to the bottom of the opening in meters
   * For doors this is usually 0, for windows > 0
   */
  bottom: number;
  /**
   * Offset along the wall measured in meters from the left corner
   * (0 = left corner, wallLength = right corner)
   */
  offset: number;
}

export interface RoomConfig {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
  /**
   * Optional wall texture URL or identifier
   */
  wallTexture?: string;
  /**
   * Optional floor texture URL or identifier
   */
  floorTexture?: string;
  /**
   * Tiling factor for wall textures (1 = default scale)
   */
  wallTextureScale?: number;
  /**
   * Tiling factor for floor textures (1 = default scale)
   */
  floorTextureScale?: number;
  /**
   * Optional collection of doors and windows
   */
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
