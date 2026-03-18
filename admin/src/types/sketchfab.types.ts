export interface SketchfabThumbnail {
  uid: string;
  url: string;
  width: number;
  height: number;
}

export interface SketchfabCreatorInfo {
  uid: string;
  username: string;
  displayName: string;
  profileUrl: string;
}

export interface SketchfabLicense {
  label: string;
  slug: string;
  url: string;
}

export interface SketchfabArchive {
  url: string;
  size: number;
}

export interface SketchfabArchives {
  glb?: SketchfabArchive;
  gltf?: SketchfabArchive;
  usdz?: SketchfabArchive;
}

export interface SketchfabModel {
  uid: string;
  name: string;
  description: string;
  viewerUrl: string;
  embedUrl: string;
  isDownloadable: boolean;
  likeCount: number;
  viewCount: number;
  faceCount: number;
  vertexCount: number;
  publishedAt: string;
  license: SketchfabLicense | null;
  user: SketchfabCreatorInfo;
  thumbnails: SketchfabThumbnail[];
  archives?: SketchfabArchives;
  tags?: string[];
  categories?: Array<{ name: string; slug: string }>;
}

export interface SketchfabSearchResult {
  results: SketchfabModel[];
  next: string | null;
  previous: string | null;
  cursors: {
    next: string | null;
    previous: string | null;
  };
}

export interface SketchfabSearchFilters {
  q?: string;
  category?: string;
  license?: string;
  sort_by?: string;
  downloadable?: boolean;
  cursor?: string;
}

export interface SketchfabImportInput {
  name: string;
  category: 'chair' | 'table' | 'sofa' | 'bed' | 'storage';
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  price?: number;
  stock?: number;
  defaultColor?: string;
  isColorizable?: boolean;
}
