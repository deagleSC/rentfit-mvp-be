import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  publicId?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  tags?: string[];
}

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

/**
 * Upload a file buffer to Cloudinary
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  // Validate Cloudinary configuration before attempting upload
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missingVars: string[] = [];
    if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');

    throw new Error(
      `Cloudinary configuration error: Missing environment variables (${missingVars.join(', ')}). ` +
        'Please ensure all Cloudinary credentials are set in your .env file and restart the server.'
    );
  }

  const uploadOptions: any = {
    overwrite: false,
    invalidate: true,
    ...options,
  };

  // For raw files (like PDFs), use data URI format with upload method
  // For images/videos, use upload_stream
  if (options.resourceType === 'raw') {
    try {
      // Convert buffer to data URI
      const dataUri = `data:application/pdf;base64,${buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        ...uploadOptions,
        resource_type: 'raw',
      });

      // Generate URL that displays PDF inline in browser
      // Cloudinary serves PDFs inline by default with proper Content-Type headers
      // Use the secure_url as-is, which should work for inline viewing
      // The URL format: https://res.cloudinary.com/{cloud}/raw/upload/{public_id}
      // Browsers will display it inline based on Content-Type: application/pdf header

      return {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url, // Cloudinary serves PDFs inline by default
        format: result.format || 'pdf',
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
      };
    } catch (error: any) {
      if (error.message?.includes('api_key')) {
        throw new Error(
          'Cloudinary API key error. Please check your CLOUDINARY_API_KEY in the .env file and ensure the server was restarted after adding it.'
        );
      }
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // For images/videos/auto, use upload_stream
  return new Promise((resolve, reject) => {
    const streamOptions: any = {
      resourceType: options.resourceType || 'auto',
      overwrite: false,
      invalidate: true,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      streamOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          // Provide more helpful error messages
          if (error.message.includes('api_key')) {
            reject(
              new Error(
                'Cloudinary API key error. Please check your CLOUDINARY_API_KEY in the .env file and ensure the server was restarted after adding it.'
              )
            );
            return;
          }
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload failed: No result returned'));
          return;
        }

        resolve({
          url: result.url,
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload a file from a file path (for server-side uploads)
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const uploadOptions: UploadOptions = {
    resourceType: 'auto',
    overwrite: false,
    invalidate: true,
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'jpg' | 'png' | 'webp' | 'auto';
    crop?: string;
  } = {}
): string => {
  const { width, height, quality = 'auto', format = 'auto', crop = 'limit' } = options;

  const transformations: string[] = [];

  if (width || height) {
    transformations.push(`w_${width || 'auto'}`);
    transformations.push(`h_${height || 'auto'}`);
    transformations.push(`c_${crop}`);
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  if (format !== 'auto') {
    transformations.push(`f_${format}`);
  }

  const transformationString = transformations.length > 0 ? transformations.join(',') : '';

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformationString
      ? [{ raw_transformation: transformationString }]
      : undefined,
  });
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  buffers: Buffer[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const uploadPromises = buffers.map(buffer => uploadToCloudinary(buffer, options));
  return Promise.all(uploadPromises);
};
