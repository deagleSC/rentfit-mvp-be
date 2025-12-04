import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
// Try to load from project root (where .env should be)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate required environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate that all required credentials are present
if (!cloudName || !apiKey || !apiSecret) {
  const missingVars: string[] = [];
  if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');

  console.error('❌ Cloudinary configuration error:');
  console.error(`   Missing environment variables: ${missingVars.join(', ')}`);
  console.error('   Please ensure all Cloudinary credentials are set in your .env file.');

  // Don't throw here, but log the error - the actual error will be thrown when trying to use Cloudinary
}

// Configure Cloudinary (will fail at runtime if credentials are missing)
try {
  cloudinary.config({
    cloud_name: cloudName || '',
    api_key: apiKey || '',
    api_secret: apiSecret || '',
  });

  if (cloudName && apiKey && apiSecret) {
    console.log('✅ Cloudinary configured successfully');
  }
} catch (error) {
  console.error('❌ Failed to configure Cloudinary:', error);
}

export default cloudinary;
