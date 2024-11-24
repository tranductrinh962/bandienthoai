const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage(); // Store files in memory for processing with Sharp

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

const processImage = async (buffer, filename) => {
  const outputPath = path.join(__dirname, '../public/data/product-images', filename);
  await sharp(buffer)
    .resize(800, 800, { fit: sharp.fit.inside, withoutEnlargement: true }) // Resize image
    .toFile(outputPath);
  return outputPath;
};

const multerErrorHandlingMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size should not exceed 5MB.' });
    }
  } else if (err) {
    // Handle other errors, including file type errors
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { upload, processImage, multerErrorHandlingMiddleware };
