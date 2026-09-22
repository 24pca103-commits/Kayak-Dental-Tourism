import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'jm9w4a8y',
  api_key: process.env.CLOUDINARY_API_KEY || '474267154217686',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'c9Zw0R5Cybd3xeKTzy259pTBUdY',
  secure: true,
});

export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export const uploadToCloudinary = async (
  filePath: string,
  folder = 'kayal_dental'
): Promise<{ url: string; public_id: string; format?: string; resource_type?: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: 'auto',
        eager_async: true,
        chunk_size: 6000000,
        timeout: 30000,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
        });
      }
    );
  });
};

export default cloudinary;
