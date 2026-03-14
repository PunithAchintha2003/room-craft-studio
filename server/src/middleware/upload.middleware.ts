import multer from 'multer';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
