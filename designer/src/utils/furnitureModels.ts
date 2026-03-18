import { FurnitureCategory } from '@/types/design.types';

/**
 * Maps furniture categories and specific names to free, stable GLB model URLs.
 *
 * Sources:
 * - KhronosGroup glTF-Sample-Models (MIT / Apache 2.0)
 * - market.pmnd.rs (CC0)
 * - poly.pizza (CC0)
 */

const GLTF_SAMPLES =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

export const CATEGORY_MODEL_MAP: Record<FurnitureCategory, string> = {
  chair: `${GLTF_SAMPLES}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`,
  table: `${GLTF_SAMPLES}/Lantern/glTF-Binary/Lantern.glb`,
  sofa: `${GLTF_SAMPLES}/SheenChair/glTF-Binary/SheenChair.glb`,
  bed: `${GLTF_SAMPLES}/ToyCar/glTF-Binary/ToyCar.glb`,
  storage: `${GLTF_SAMPLES}/StorageTank/glTF-Binary/StorageTank.glb`,
};

/**
 * Fallback model used when a URL cannot be resolved or fails to load.
 * Uses the well-known Duck model from the Khronos sample set.
 */
export const FALLBACK_MODEL_URL = `${GLTF_SAMPLES}/Duck/glTF-Binary/Duck.glb`;

/**
 * Known broken URL prefixes that should be replaced with category-based models.
 */
const LEGACY_PREFIXES = [
  'https://vazxmixjsiawhamofees.supabase.co',
  'https://market.pmnd.rs',
];

/**
 * Resolves a furniture model URL.
 *
 * Priority:
 * 1. If the URL is a valid absolute URL not in the legacy/broken list → use as-is
 * 2. If it matches a legacy prefix → map to category fallback
 * 3. Otherwise → return the URL unchanged (may be a local asset)
 */
export const resolveFurnitureModelUrl = (
  url: string,
  category: FurnitureCategory
): string => {
  if (!url) return CATEGORY_MODEL_MAP[category] ?? FALLBACK_MODEL_URL;

  const isLegacy = LEGACY_PREFIXES.some(prefix => url.startsWith(prefix));
  if (isLegacy) {
    return CATEGORY_MODEL_MAP[category] ?? FALLBACK_MODEL_URL;
  }

  return url;
};

/**
 * Returns the model URL for a given category as a reliable fallback.
 */
export const getCategoryModelUrl = (category: FurnitureCategory): string =>
  CATEGORY_MODEL_MAP[category] ?? FALLBACK_MODEL_URL;

/**
 * Preloads all category models so they are cached before first use.
 * Call this at app startup (e.g., in a useEffect in App.tsx or DesignEditorPage).
 */
export const preloadAllCategoryModels = (preloadFn: (url: string) => void): void => {
  Object.values(CATEGORY_MODEL_MAP).forEach(url => preloadFn(url));
};

/**
 * Preloads a single furniture model URL.
 * Import useGLTF.preload at the call site to avoid component/non-component mixing.
 */
export const getModelUrlToPreload = (url: string, category: FurnitureCategory): string =>
  resolveFurnitureModelUrl(url, category);
