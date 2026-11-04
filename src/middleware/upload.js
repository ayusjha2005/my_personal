/**
 * Upload Middleware — Cloudinary (production) or disk (development)
 *
 * In production (NODE_ENV=production or when CLOUDINARY_CLOUD_NAME is set),
 * files go directly to Cloudinary. No local disk I/O on serverless functions.
 *
 * In development (no Cloudinary vars), files are saved to public/uploads/.
 */

const multer = require('multer');
const path = require('path');

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Allowed MIME types — SVG excluded (XSS risk in browsers)
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed (max 5 MB, no SVG).'), false);
  }
};

// ---- Cloudinary path ----
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (useCloudinary) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const folder = req.baseUrl.includes('project') ? 'blog/projects' : 'blog/covers';
      return {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
      };
    },
  });

  upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

  // Expose cloudinary instance for cleanup in controllers
  upload._cloudinary = cloudinary;
} else {
  // ---- Local disk path (dev only) ----
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
      cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  });

  upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
}

module.exports = upload;
