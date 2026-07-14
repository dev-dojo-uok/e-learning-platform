import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const useS3 = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME
);

let s3Client = null;
if (useS3) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('[StorageService] AWS S3 storage initialized successfully.');
} else {
  console.log('[StorageService] AWS credentials not configured. Gracefully falling back to local disk storage.');
}

// Local upload directories setup
const UPLOAD_BASE_DIR = 'uploads';
const CATEGORY_DIRS = {
  materials: path.join(UPLOAD_BASE_DIR, 'materials'),
  thumbnails: path.join(UPLOAD_BASE_DIR, 'thumbnails')
};

// Ensure directories exist locally if we are fallback or for local caching
Object.values(CATEGORY_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export class StorageService {
  /**
   * Upload a file buffer to S3 or local disk.
   * @param {Buffer} buffer - The file buffer.
   * @param {string} originalName - The original filename.
   * @param {string} mimeType - The MIME type.
   * @param {string} category - 'materials' | 'thumbnails'.
   * @returns {Promise<string>} The uploaded file URL or local path.
   */
  static async uploadFile(buffer, originalName, mimeType, category = 'materials') {
    const ext = path.extname(originalName).toLowerCase();
    const filename = `${randomUUID()}${ext}`;

    if (useS3) {
      const key = `${category}/${filename}`;
      const bucket = process.env.AWS_BUCKET_NAME;
      const region = process.env.AWS_REGION || 'us-east-1';

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      );

      // Return public S3 URL
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } else {
      const destDir = CATEGORY_DIRS[category] || CATEGORY_DIRS.materials;
      const destPath = path.join(destDir, filename);
      
      fs.writeFileSync(destPath, buffer);
      
      // Return local serve path (e.g. uploads/materials/filename)
      return `${UPLOAD_BASE_DIR}/${category}/${filename}`;
    }
  }

  /**
   * Delete a file from S3 or local disk.
   * @param {string} fileUrl - The file URL or path to delete.
   */
  static async deleteFile(fileUrl) {
    if (!fileUrl) return;

    if (useS3 && fileUrl.includes('.amazonaws.com/')) {
      try {
        const bucket = process.env.AWS_BUCKET_NAME;
        // Extract key from S3 URL: https://bucket.s3.region.amazonaws.com/category/filename
        const urlParts = fileUrl.split('.amazonaws.com/');
        if (urlParts.length > 1) {
          const key = urlParts[1];
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: bucket,
              Key: key,
            })
          );
        }
      } catch (err) {
        console.warn(`[StorageService] Could not delete S3 file at "${fileUrl}":`, err.message);
      }
    } else {
      // Local file path (e.g. uploads/materials/filename)
      try {
        const resolvedPath = path.isAbsolute(fileUrl) ? fileUrl : path.resolve(process.cwd(), fileUrl);
        if (fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
      } catch (err) {
        console.warn(`[StorageService] Could not delete local file at "${fileUrl}":`, err.message);
      }
    }
  }

  /**
   * Helper to check if a URL represents an uploaded custom resource.
   */
  static isCustomUploadedUrl(url) {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('uploads/');
  }
}
