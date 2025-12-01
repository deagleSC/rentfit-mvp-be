import { Request, Response } from 'express';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  UploadOptions,
} from '../utils/cloudinaryUpload';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';
import { getFileTypeCategory } from '../middleware/upload';

/**
 * @route   POST /api/upload
 * @desc    Upload a single file to Cloudinary
 * @access  Public (for now, can be changed to private with auth)
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponseHandler.badRequest(res, 'No file provided');
  }

  const folder = (req.body.folder as string) || 'rentfit';
  const tags = req.body.tags ? (req.body.tags as string).split(',') : undefined;

  const uploadOptions: UploadOptions = {
    folder,
    tags,
    resourceType: getFileTypeCategory(req.file.mimetype) === 'video' ? 'video' : 'image',
  };

  const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

  ApiResponseHandler.success(
    res,
    {
      file: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resourceType,
      },
    },
    'File uploaded successfully'
  );
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files to Cloudinary
 * @access  Public (for now, can be changed to private with auth)
 */
export const uploadMultipleFiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return ApiResponseHandler.badRequest(res, 'No files provided');
  }

  const files = Array.isArray(req.files) ? req.files : [req.files];
  const folder = (req.body.folder as string) || 'rentfit';
  const tags = req.body.tags ? (req.body.tags as string).split(',') : undefined;

  // Convert files to buffers - ensure all are Express.Multer.File
  const buffers: Buffer[] = files.map(file => {
    if (Array.isArray(file)) {
      throw new Error('Unexpected file array structure');
    }
    return file.buffer;
  });

  // Determine resource type from first file
  const firstFile = Array.isArray(files[0]) ? files[0][0] : files[0];
  const resourceType = getFileTypeCategory(firstFile.mimetype) === 'video' ? 'video' : 'image';

  const uploadOptions: UploadOptions = {
    folder,
    tags,
    resourceType,
  };

  const results = await uploadMultipleToCloudinary(buffers, uploadOptions);

  ApiResponseHandler.success(
    res,
    {
      files: results.map(result => ({
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resourceType,
      })),
    },
    `${results.length} file(s) uploaded successfully`
  );
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image to Cloudinary
 * @access  Public (for now, can be changed to private with auth)
 */
export const uploadImageFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponseHandler.badRequest(res, 'No image file provided');
  }

  const folder = (req.body.folder as string) || 'rentfit/images';
  const tags = req.body.tags ? (req.body.tags as string).split(',') : undefined;
  const transformation = req.body.transformation
    ? JSON.parse(req.body.transformation as string)
    : undefined;

  const uploadOptions: UploadOptions = {
    folder,
    tags,
    resourceType: 'image',
    transformation,
  };

  const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

  ApiResponseHandler.success(
    res,
    {
      image: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    },
    'Image uploaded successfully'
  );
});

/**
 * @route   POST /api/upload/video
 * @desc    Upload a single video to Cloudinary
 * @access  Public (for now, can be changed to private with auth)
 */
export const uploadVideoFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponseHandler.badRequest(res, 'No video file provided');
  }

  const folder = (req.body.folder as string) || 'rentfit/videos';
  const tags = req.body.tags ? (req.body.tags as string).split(',') : undefined;

  const uploadOptions: UploadOptions = {
    folder,
    tags,
    resourceType: 'video',
  };

  const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

  ApiResponseHandler.success(
    res,
    {
      video: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    },
    'Video uploaded successfully'
  );
});

/**
 * @route   POST /api/upload/document
 * @desc    Upload a single document to Cloudinary
 * @access  Public (for now, can be changed to private with auth)
 */
export const uploadDocumentFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponseHandler.badRequest(res, 'No document file provided');
  }

  const folder = (req.body.folder as string) || 'rentfit/documents';
  const tags = req.body.tags ? (req.body.tags as string).split(',') : undefined;

  const uploadOptions: UploadOptions = {
    folder,
    tags,
    resourceType: 'raw',
  };

  const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

  ApiResponseHandler.success(
    res,
    {
      document: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
      },
    },
    'Document uploaded successfully'
  );
});
