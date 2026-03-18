import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type UploadKind = 'thumbnails' | 'models';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MODEL_EXTS = new Set(['.glb', '.gltf']);

export function getPublicBaseUrl(req: { protocol: string; get: (h: string) => string | undefined }): string {
  const host = req.get('host');
  return `${req.protocol}://${host}`;
}

/** Use PUBLIC_BASE_URL in production so stored URLs are correct for the deployed API (HTTPS). */
export function getUploadBaseUrl(req: { protocol: string; get: (h: string) => string | undefined }): string {
  const envBase = process.env.PUBLIC_BASE_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, '');
  return getPublicBaseUrl(req);
}

export function getExtension(originalname: string): string {
  const ext = path.extname(originalname || '').toLowerCase();
  return ext;
}

export function validateImageUpload(file: Express.Multer.File): void {
  if (!IMAGE_MIMES.has(file.mimetype)) {
    throw new Error('Invalid image type. Allowed: JPEG, PNG, WebP.');
  }
}

export function validateModelUpload(file: Express.Multer.File): void {
  const ext = getExtension(file.originalname);
  if (!MODEL_EXTS.has(ext)) {
    throw new Error('Invalid 3D model type. Allowed: .glb or .gltf.');
  }
}

export async function saveUploadToPublicFolder(options: {
  kind: UploadKind;
  buffer: Buffer;
  originalname: string;
}): Promise<{ relativeUrlPath: string; absolutePath: string; filename: string; ext: string }> {
  const ext = getExtension(options.originalname) || (options.kind === 'models' ? '.glb' : '.png');
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', options.kind);
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, filename);
  await fs.writeFile(absolutePath, options.buffer);
  const relativeUrlPath = `/uploads/${options.kind}/${filename}`;
  return { relativeUrlPath, absolutePath, filename, ext };
}

