/**
 * Category slug stored in the backend (kebab-case).
 * Examples: "chair", "table", "outdoor", "kids-room".
 */
export type FurnitureCategory = string;

export type WallSide = 'north' | 'south' | 'east' | 'west';

/**
 * Room floor plan layout.
 * - rectangle: simple rectangle
 * - l-shape: L-shaped with one corner cut out (cutout position + width/length)
 * - t-shape: T-shaped with stem on one side (cutout position = side of stem, width/length = stem)
 * - u-shape: three sides in a horseshoe/U (cutout position = open side, width/length = opening)
 * - angled-bay: one corner cut at an angle (cutout position = corner, width/length = bay dimensions)
 */
export type RoomLayout =
  | 'rectangle'
  | 'l-shape'
  | 't-shape'
  | 'u-shape'
  | 'angled-bay';

/** For L/L-mirror/Angled bay: which corner. For T/U: which side (stem or opening). */
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
   * Room floor plan layout (default: rectangle)
   */
  layout?: RoomLayout;
  /**
   * Cutout position for L/T/U/Angled Bay layouts.
   * L/Angled bay: corner (top-left, top-right, bottom-left, bottom-right).
   * T-shape: side where stem is (top, bottom, left, right).
   * U-shape: side that is open (top, bottom, left, right).
   */
  cutoutPosition?: CutoutPosition;
  /**
   * Cutout width in meters (for L/T/U/Angled bay).
   */
  cutoutWidth?: number;
  /**
   * Cutout length in meters (for L/T/U/Angled bay).
   */
  cutoutLength?: number;
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
