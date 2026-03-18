/**
 * Furniture categories are stored in the database and referenced by slug.
 * Examples: "chair", "table", "outdoor", "decor".
 */
export type FurnitureCategory = string;

export type WallSide = 'north' | 'south' | 'east' | 'west';

export type RoomLayout =
  | 'rectangle'
  | 'l-shape'
  | 'l-mirror'
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

export interface IRoomOpening {
  type: 'door' | 'window';
  wall: WallSide;
  width: number;
  height: number;
  bottom: number;
  offset: number;
}

export interface IRoomConfig {
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
  openings?: IRoomOpening[];
}

export interface IFurnitureItem {
  furnitureId: string;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  scale: number;
  color?: string;
}

export interface IDesignInput {
  name: string;
  description?: string;
  room: IRoomConfig;
  furniture: IFurnitureItem[];
  isPublic?: boolean;
}

export interface IFurnitureInput {
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
}
