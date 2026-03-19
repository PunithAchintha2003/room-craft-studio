/**
 * Resolves room texture preset keys or custom URLs to a loadable texture URL.
 * Presets use tileable textures from three.js examples (jsDelivr CDN, CORS-friendly).
 */

const THREE_TEXTURES =
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures';

export const WALL_PRESETS = [
  'wall-concrete',
  'wall-brick',
  'wall-plaster',
  'wall-wallpaper',
] as const;

export const FLOOR_PRESETS = [
  'floor-wood-light',
  'floor-wood-dark',
  'floor-tile',
  'floor-carpet',
] as const;

const WALL_PRESET_URLS: Record<string, string> = {
  'wall-concrete': `${THREE_TEXTURES}/brick_diffuse.jpg`,
  'wall-brick': `${THREE_TEXTURES}/brick_diffuse.jpg`,
  'wall-plaster': `${THREE_TEXTURES}/brick_bump.jpg`,
  'wall-wallpaper': `${THREE_TEXTURES}/crate.gif`,
};

const FLOOR_PRESET_URLS: Record<string, string> = {
  'floor-wood-light': `${THREE_TEXTURES}/hardwood2_diffuse.jpg`,
  'floor-wood-dark': `${THREE_TEXTURES}/brick_diffuse.jpg`,
  'floor-tile': `${THREE_TEXTURES}/brick_diffuse.jpg`,
  'floor-carpet': `${THREE_TEXTURES}/crate.gif`,
};

function isAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

export function getRoomTextureUrl(
  value: string | undefined,
  kind: 'wall' | 'floor'
): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isAbsoluteUrl(trimmed)) return trimmed;
  const map = kind === 'wall' ? WALL_PRESET_URLS : FLOOR_PRESET_URLS;
  return map[trimmed] ?? null;
}

