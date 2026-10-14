const cloudinary = require('cloudinary').v2;

// Cloudinary config (.env file  credentials )
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * PDF Buffer memory Cloudinary stream function
 */
const uploadPdfBuffer = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'knowb4/certificates',
        public_id: fileName,
        resource_type: 'raw', // PDFs must be 'raw' type
        format: 'pdf'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { cloudinary, uploadPdfBuffer };
