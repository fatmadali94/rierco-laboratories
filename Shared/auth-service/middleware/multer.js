import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only images (JPG, JPEG, PNG, GIF, WebP) and PDF files are allowed'), false);
  }
  
  cb(null, true);
};

export default multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});