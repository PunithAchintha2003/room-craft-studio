import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';

export const uploadHeroModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const originalName = file.originalname.toLowerCase();
    const isGlb = originalName.endsWith('.glb');
    const isGltf = originalName.endsWith('.gltf');

    if (!isGlb && !isGltf) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload a .glb or .gltf model.',
      });
    }

    const publicDir = path.join(process.cwd(), 'public', 'uploads', 'hero-models');
    await fs.mkdir(publicDir, { recursive: true });

    const filename = isGlb ? 'hero-model.glb' : 'hero-model.gltf';
    const filePath = path.join(publicDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const urlPath = `/uploads/hero-models/${filename}`;

    return res.status(201).json({
      success: true,
      message: 'Hero model uploaded successfully.',
      data: { url: urlPath },
    });
  } catch (error) {
    next(error);
  }
};

