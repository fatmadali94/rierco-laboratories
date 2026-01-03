// controllers/sizesController.js
import {
  getAllSizes,
  searchSizesByName,
  addSizeIfNotExists
} from '../../models/tire_data_model/sizesModel.js';

// GET /api/sizes
export const fetchSizes = async (req, res) => {
  try {
    const sizes = await getAllSizes();
    res.json(sizes);
  } catch (err) {
    console.error('Error fetching sizes:', err);
    res.status(500).json({ message: 'Error fetching sizes' });
  }
};

// GET /api/sizes/search?query=...
export const searchSizes = async (req, res) => {
  try {
    const query = req.query.query || '';
    const sizes = await searchSizesByName(query);
    res.json(sizes);
  } catch (err) {
    console.error('Error searching sizes:', err);
    res.status(500).json({ message: 'Error searching sizes' });
  }
};

// POST /api/sizes
export const createSize = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'size name is required' });
    }

    const size = await addSizeIfNotExists(name);
    res.status(201).json(size);
  } catch (err) {
    console.error('Error creating size:', err);
    res.status(500).json({ message: 'Error creating size' });
  }
};
