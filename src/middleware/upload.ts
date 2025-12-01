import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// File type configuration
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Configure multer storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Check if file type is allowed
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
      )
    );
  }
};

// Create multer instance with limits
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Specialized upload instances for different file types
export const uploadImage = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Only image files are allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`)
      );
    }
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Only video files are allowed. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`)
      );
    }
  },
  limits: {
    fileSize: MAX_VIDEO_SIZE,
  },
});

export const uploadDocument = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only document files are allowed. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`
        )
      );
    }
  },
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
});

// Helper function to get file type category
export const getFileTypeCategory = (
  mimetype: string
): 'image' | 'video' | 'document' | 'unknown' => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) return 'document';
  return 'unknown';
};
