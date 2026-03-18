import multer from 'multer';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_MODEL_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_HERO_MODEL_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`));
    return;
  }
  cb(null, true);
};

export const uploadThumbnail = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single('image');

const assetsFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      cb(new Error(`Invalid thumbnail type. Allowed: ${ALLOWED_MIMES.join(', ')}`));
      return;
    }
    cb(null, true);
    return;
  }
  if (file.fieldname === 'model') {
    // Many browsers report .glb as application/octet-stream; validate by extension in controller.
    cb(null, true);
    return;
  }
  cb(new Error('Unexpected upload field.'));
};

export const uploadFurnitureAssets = multer({
  storage,
  fileFilter: assetsFileFilter,
  limits: { fileSize: MAX_MODEL_SIZE_BYTES },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'model', maxCount: 1 },
]);

const heroModelFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedHeroMimes = [
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream',
  ];
  if (!allowedHeroMimes.includes(file.mimetype)) {
    cb(new Error('Invalid model type. Please upload a .glb or .gltf file.'));
    return;
  }
  cb(null, true);
};

export const uploadHeroModel = multer({
  storage,
  fileFilter: heroModelFileFilter,
  limits: { fileSize: MAX_HERO_MODEL_SIZE_BYTES },
}).single('file');

