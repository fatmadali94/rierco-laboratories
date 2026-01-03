// =============================================================================
// MULTER & CLOUDINARY CONFIGURATION FOR MATERIALS LAB
// =============================================================================

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.dev" });

// =============================================================================
// CLOUDINARY CONFIGURATION
// =============================================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =============================================================================
// STORAGE CONFIGURATIONS
// =============================================================================

// 1. Sample Images Storage
const sampleImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'materials-lab/samples',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `sample-${uniqueSuffix}`;
    }
  },
});

// 2. Test Result Files Storage (PDFs and images)
const testResultsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'materials-lab/test-results',
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
      resource_type: isPdf ? 'raw' : 'image',
      public_id: `test-result-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  },
});

// 3. Invoice PDFs Storage
const invoicePdfsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'materials-lab/invoices',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    public_id: (req, file) => `invoice-${Date.now()}`
  },
});

// =============================================================================
// MULTER FILE FILTERS
// =============================================================================

// Image files only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// PDF and Image files
const pdfAndImageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

// PDF files only
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// =============================================================================
// MULTER UPLOAD INSTANCES
// =============================================================================

// 1. Sample Images Upload (multiple files, max 10)
export const uploadSampleImages = multer({
  storage: sampleImagesStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // max 10 files
  }
});

// 2. Test Result Files Upload (multiple files, max 5)
export const uploadTestResultFiles = multer({
  storage: testResultsStorage,
  fileFilter: pdfAndImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5
  }
});

// 3. Invoice PDF Upload (single file)
export const uploadInvoicePdf = multer({
  storage: invoicePdfsStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// =============================================================================
// MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Middleware to handle multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name in file upload.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Delete file from cloudinary
 */
export async function deleteCloudinaryFile(publicId, resourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  } catch (error) {
    console.error('Error deleting cloudinary file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete multiple files from cloudinary
 */
export async function deleteMultipleCloudinaryFiles(publicIds, resourceType = 'image') {
  try {
    const results = await Promise.all(
      publicIds.map(id => cloudinary.uploader.destroy(id, { resource_type: resourceType }))
    );
    return { success: true, results };
  } catch (error) {
    console.error('Error deleting cloudinary files:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract public ID from cloudinary URL
 */
export function extractPublicIdFromUrl(url) {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after upload, excluding version
    const pathParts = parts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    if (pathParts[0] && /^v\d+$/.test(pathParts[0])) {
      pathParts.shift();
    }
    
    // Join remaining parts and remove file extension
    const publicIdWithExt = pathParts.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

// =============================================================================
// USAGE IN ROUTES
// =============================================================================

/*
Example route configurations:

// 1. Create record with sample images
router.post('/records',
  authenticate,
  uploadSampleImages.array('sample_images', 10),
  handleMulterError,
  recordsController.createRecord
);

// 2. Add images to existing sample
router.post('/samples/:id/images',
  authenticate,
  uploadSampleImages.array('images', 10),
  handleMulterError,
  samplesController.addSampleImages
);

// 3. Upload test result files
router.post('/test-results/:id/files',
  authenticate,
  uploadTestResultFiles.array('result_files', 5),
  handleMulterError,
  testResultsController.uploadFiles
);

// 4. Upload invoice PDF
router.post('/invoices/:id/pdf',
  authenticate,
  uploadInvoicePdf.single('invoice_pdf'),
  handleMulterError,
  invoicesController.uploadPdf
);

*/

// =============================================================================
// ENVIRONMENT VARIABLES NEEDED
// =============================================================================

/*
Add to your .env.dev and .env.production:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

*/

// =============================================================================
// EXAMPLE CONTROLLER USAGE
// =============================================================================

/*
// In your controller:
export const createRecord = async (req, res) => {
  try {
    // req.files contains uploaded files
    // Each file has: filename, path (cloudinary URL), mimetype, size, etc.
    
    const sampleImages = req.files?.map(file => file.path) || [];
    
    const recordData = {
      ...req.body,
      sample: {
        ...req.body.sample,
        sample_images: sampleImages
      }
    };

    const result = await recordsModel.createRecord(recordData, req.user.id);
    res.status(201).json(result);
    
  } catch (error) {
    // If error, delete uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const publicId = extractPublicIdFromUrl(file.path);
        if (publicId) {
          await deleteCloudinaryFile(publicId);
        }
      }
    }
    res.status(400).json({ error: error.message });
  }
};
*/

// =============================================================================
// FRONTEND USAGE EXAMPLE
// =============================================================================

/*
// React example for uploading sample images:

const handleCreateRecord = async (formData) => {
  const data = new FormData();
  
  // Add files
  for (const file of sampleImages) {
    data.append('sample_images', file);
  }
  
  // Add JSON data as string
  data.append('customer', JSON.stringify(customerData));
  data.append('sample', JSON.stringify(sampleData));
  data.append('tests', JSON.stringify(testsData));
  
  const response = await fetch('/api/v1/materials-lab/records', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - browser will set it with boundary
    },
    body: data
  });
  
  return await response.json();
};
*/

export default {
  uploadSampleImages,
  uploadTestResultFiles,
  uploadInvoicePdf,
  handleMulterError,
  deleteCloudinaryFile,
  deleteMultipleCloudinaryFiles,
  extractPublicIdFromUrl
};
