import { Router, Request, Response, NextFunction } from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  uploadImageFile,
  uploadVideoFile,
  uploadDocumentFile,
} from '../controllers/uploadController';
import { upload, uploadImage, uploadVideo, uploadDocument } from '../middleware/upload';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';
import multer from 'multer';

const router = Router();

// Multer error handler middleware
const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      ApiResponseHandler.badRequest(res, 'File size too large. Maximum size is 10MB');
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      ApiResponseHandler.badRequest(res, 'Too many files. Maximum is 10 files');
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      ApiResponseHandler.badRequest(res, 'Unexpected file field');
      return;
    }
    ApiResponseHandler.badRequest(res, `Upload error: ${err.message}`);
    return;
  }
  if (err) {
    ApiResponseHandler.badRequest(res, err.message || 'File upload error');
    return;
  }
  next();
};

/**
 * @route   POST /api/upload
 * @desc    Upload a single file (image, video, or document)
 * @access  Public
 */
router.post('/', upload.single('file'), handleMulterError, asyncHandler(uploadFile));

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Public
 */
router.post(
  '/multiple',
  upload.array('files', 10),
  handleMulterError,
  asyncHandler(uploadMultipleFiles)
);

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image
 * @access  Public
 */
router.post(
  '/image',
  uploadImage.single('image'),
  handleMulterError,
  asyncHandler(uploadImageFile)
);

/**
 * @route   POST /api/upload/video
 * @desc    Upload a single video
 * @access  Public
 */
router.post(
  '/video',
  uploadVideo.single('video'),
  handleMulterError,
  asyncHandler(uploadVideoFile)
);

/**
 * @route   POST /api/upload/document
 * @desc    Upload a single document
 * @access  Public
 */
router.post(
  '/document',
  uploadDocument.single('document'),
  handleMulterError,
  asyncHandler(uploadDocumentFile)
);

export default router;
