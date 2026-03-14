import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const FOLDER = 'roomcraft/thumbnails';
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload an image buffer to Cloudinary (e.g. from multer).
 * Uses modern formats and folder; returns secure URL for storage in DB.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    mimetype?: string;
  } = {}
): Promise<UploadResult> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  }

  const { folder = FOLDER, publicId, mimetype } = options;
  if (mimetype && !ALLOWED_MIMES.includes(mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...(publicId && { public_id: publicId }),
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result || result.secure_url === undefined) {
          reject(new Error('Cloudinary upload returned no URL'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id ?? '',
          width: result.width ?? 0,
          height: result.height ?? 0,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export function validateImageFile(mimetype: string, size: number): void {
  if (!ALLOWED_MIMES.includes(mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`);
  }
  if (size > MAX_SIZE_BYTES) {
    throw new Error(`File too large. Maximum size: ${MAX_SIZE_BYTES / 1024 / 1024}MB`);
  }
}
