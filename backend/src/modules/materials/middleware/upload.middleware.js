import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Upload directory
// ---------------------------------------------------------------------------
const UPLOAD_DIR = 'uploads/materials';

// Ensure upload directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Allowed MIME types per material API type
// ---------------------------------------------------------------------------
const ALLOWED_EXTENSIONS = {
  PDF:      ['.pdf'],
  DOCUMENT: ['.doc', '.docx'],
  IMAGE:    ['.jpg', '.jpeg', '.png', '.webp'],
  ZIP:      ['.zip']
};

// Flat set of all allowed extensions for quick lookup
const ALL_ALLOWED_EXTENSIONS = new Set(
  Object.values(ALLOWED_EXTENSIONS).flat()
);

// Corresponding MIME types
const MIME_TYPES = {
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.zip':  'application/zip'
};

// ---------------------------------------------------------------------------
// Multer storage configuration
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  }
});

// ---------------------------------------------------------------------------
// File filter: validates extension and MIME type
// ---------------------------------------------------------------------------
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALL_ALLOWED_EXTENSIONS.has(ext)) {
    const allowed = [...ALL_ALLOWED_EXTENSIONS].join(', ');
    return cb(
      new Error(`Invalid file type. Allowed extensions: ${allowed}`),
      false
    );
  }

  const expectedMime = MIME_TYPES[ext];
  if (expectedMime && file.mimetype !== expectedMime) {
    // Some clients send generic MIME; allow octet-stream as fallback
    if (file.mimetype !== 'application/octet-stream') {
      return cb(
        new Error(`MIME type mismatch for extension ${ext}.`),
        false
      );
    }
  }

  cb(null, true);
};

// ---------------------------------------------------------------------------
// Multer instance – 20 MB size limit
// ---------------------------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  }
});

// ---------------------------------------------------------------------------
// Express error-handling wrapper for Multer errors
// ---------------------------------------------------------------------------

/**
 * Middleware that handles a single optional file field named "file".
 * Converts Multer-specific errors into structured 400 responses so that
 * the global error handler doesn't need to know about Multer internals.
 */
export const handleFileUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) {
      if (req.file && req.body?.type) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowed = ALLOWED_EXTENSIONS[req.body.type];

        // Reject files for non-file-based types (e.g., VIDEO/YOUTUBE) or mismatched extensions
        if (!allowed || !allowed.includes(ext)) {
          try { fs.unlinkSync(req.file.path); } catch (_) {}
          return res.status(400).json({
            errors: [{ msg: 'Uploaded file does not match the provided material "type".' }]
          });
        }
      }

      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          errors: [{ msg: 'File size exceeds the 20 MB limit.' }]
        });
      }
      return res.status(400).json({
        errors: [{ msg: `File upload error: ${err.message}` }]
      });
    }

    // Custom fileFilter errors
    return res.status(400).json({
      errors: [{ msg: err.message }]
    });
  });
};

export { ALLOWED_EXTENSIONS, UPLOAD_DIR };
