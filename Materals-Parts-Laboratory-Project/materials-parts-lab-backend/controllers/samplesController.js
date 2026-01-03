import samplesModel from '../models/samplesModel.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Get all samples with pagination
 * GET /api/v1/materials-lab/samples
 */
export const getAllSamples = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      customer_id: req.query.customer_id ? parseInt(req.query.customer_id) : null,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null,
      search: req.query.search || null
    };

    const result = await samplesModel.getAllSamples(filters);
    
    res.json({
      success: true,
      data: result.samples,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting samples:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get sample by ID with all records
 * GET /api/v1/materials-lab/samples/:id
 */
export const getSampleById = async (req, res) => {
  try {
    const sampleId = parseInt(req.params.id);
    const sample = await samplesModel.getSampleById(sampleId);
    
    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found'
      });
    }

    res.json({
      success: true,
      data: sample
    });
  } catch (error) {
    console.error('Error getting sample:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update sample information
 * PUT /api/v1/materials-lab/samples/:id
 */
export const updateSample = async (req, res) => {
  try {
    const sampleId = parseInt(req.params.id);
    const updates = {
      sample_name: req.body.sample_name !== undefined ? req.body.sample_name : undefined,
      sample_description: req.body.sample_description !== undefined ? req.body.sample_description : undefined,
      quantity: req.body.quantity !== undefined ? parseInt(req.body.quantity) : undefined,
      reception_notes: req.body.reception_notes !== undefined ? req.body.reception_notes : undefined,
      sample_condition: req.body.sample_condition !== undefined ? req.body.sample_condition : undefined,
      expected_completion_date: req.body.expected_completion_date !== undefined ? req.body.expected_completion_date : undefined
    };

    const sample = await samplesModel.updateSample(sampleId, updates);
    
    res.json({
      success: true,
      message: 'Sample updated successfully',
      data: sample
    });
  } catch (error) {
    console.error('Error updating sample:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete sample (will cascade delete records)
 * DELETE /api/v1/materials-lab/samples/:id
 */
export const deleteSample = async (req, res) => {
  try {
    const sampleId = parseInt(req.params.id);
    
    // Get sample to retrieve images before deletion
    const sample = await samplesModel.getSampleById(sampleId);
    
    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found'
      });
    }

    const result = await samplesModel.deleteSample(sampleId);

    // Delete associated images from cloudinary
    if (sample.sample_images && sample.sample_images.length > 0) {
      for (const imageUrl of sample.sample_images) {
        try {
          // Extract public_id from cloudinary URL
          const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error('Error deleting cloudinary image:', deleteError);
        }
      }
    }
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting sample:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get samples by customer
 * GET /api/v1/materials-lab/samples/customer/:customerId
 */
export const getSamplesByCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const samples = await samplesModel.getSamplesByCustomer(customerId);
    
    res.json({
      success: true,
      data: samples
    });
  } catch (error) {
    console.error('Error getting samples by customer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Add images to a sample
 * POST /api/v1/materials-lab/samples/:id/images
 * This endpoint expects files uploaded via multer middleware
 */
export const addSampleImages = async (req, res) => {
  try {
    const sampleId = parseInt(req.params.id);
    
    // req.files should contain uploaded images from multer/cloudinary
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    const imagePaths = req.files.map(file => file.path);

    const sample = await samplesModel.addSampleImages(sampleId, imagePaths);
    
    res.json({
      success: true,
      message: 'Images added successfully',
      data: sample
    });
  } catch (error) {
    console.error('Error adding sample images:', error);
    
    // Delete uploaded images from cloudinary if adding fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const publicId = file.filename || file.public_id;
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (deleteError) {
          console.error('Error deleting cloudinary image:', deleteError);
        }
      }
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Remove an image from a sample
 * DELETE /api/v1/materials-lab/samples/:id/images
 */
export const removeSampleImage = async (req, res) => {
  try {
    const sampleId = parseInt(req.params.id);
    const imagePath = req.body.image_path;

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        error: 'Image path is required'
      });
    }

    const sample = await samplesModel.removeSampleImage(sampleId, imagePath);

    // Delete from cloudinary
    try {
      const publicId = imagePath.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (deleteError) {
      console.error('Error deleting cloudinary image:', deleteError);
    }
    
    res.json({
      success: true,
      message: 'Image removed successfully',
      data: sample
    });
  } catch (error) {
    console.error('Error removing sample image:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get sample statistics
 * GET /api/v1/materials-lab/samples/statistics
 */
export const getSampleStatistics = async (req, res) => {
  try {
    const filters = {
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null
    };

    const statistics = await samplesModel.getSampleStatistics(filters);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting sample statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
