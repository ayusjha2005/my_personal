/**
 * Upload Middleware — Cloudinary (production) or Disk (development)
 *
 * In production (NODE_ENV=production or when CLOUDINARY_CLOUD_NAME is set),
 * uploads stream directly to Cloudinary using a custom Multer storage engine.
 * No local disk I/O on serverless functions.
 *
 * In development (no Cloudinary credentials), files are saved to public/uploads/.
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

/**
 * Custom Multer storage engine using Cloudinary upload_stream
 * Eliminates need for outdated/conflicting multer-storage-cloudinary package
 */
function CloudinaryStorageEngine(opts) {
  this.cloudinary = opts.cloudinary;
}

CloudinaryStorageEngine.prototype._handleFile = function (req, file, cb) {
  const isProject =
    (req.baseUrl && req.baseUrl.includes('project')) ||
    (req.originalUrl && req.originalUrl.includes('project'));
  const folder = isProject ? 'blog/projects' : 'blog/covers';

  const uploadStream = this.cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
    },
    (err, result) => {
      if (err) return cb(err);
      cb(null, {
        path: result.secure_url,
        url: result.secure_url,
        secure_url: result.secure_url,
        filename: result.public_id,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        size: result.bytes,
      });
    }
  );

  file.stream.pipe(uploadStream);
};

CloudinaryStorageEngine.prototype._removeFile = function (req, file, cb) {
  if (file && file.public_id) {
    this.cloudinary.uploader.destroy(file.public_id, (err, result) => {
      cb(err, result);
    });
  } else {
    cb(null);
  }
};

// Check if Cloudinary credentials are fully configured
const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload;

if (useCloudinary) {
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const storage = new CloudinaryStorageEngine({ cloudinary });

  upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
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
  upload._cloudinary = null;
}

module.exports = upload;
