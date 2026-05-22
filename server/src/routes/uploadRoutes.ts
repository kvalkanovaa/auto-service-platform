import { Router, Response } from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary';
import { protect, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Само изображения са позволени'));
      return;
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'auto-service/vehicles', resource_type: 'image' },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });

router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      const err: AppError = new Error('Няма качен файл');
      err.statusCode = 400;
      throw err;
    }
    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ url });
  })
);

export default router;
