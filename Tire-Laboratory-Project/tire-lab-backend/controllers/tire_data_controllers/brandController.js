// controllers/BrandsController.js
import {
  getAllBrands,
  searchBrandsByName,
  addBrandIfNotExists
} from '../../models/tire_data_model/brandsModel.js';

// GET /api/Brands
export const fetchBrands = async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ message: 'Error fetching brands' });
  }
};

// GET /api/brands/search?query=...
export const searchBrands = async (req, res) => {
  try {
    const query = req.query.query || '';
    const brands = await searchBrandsByName(query);
    res.json(brands);
  } catch (err) {
    console.error('Error searching brands:', err);
    res.status(500).json({ message: 'Error searching brands' });
  }
};

// POST /api/brands
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const brand = await addBrandIfNotExists(name);
    res.status(201).json(brand);
  } catch (err) {
    console.error('Error creating brand:', err);
    res.status(500).json({ message: 'Error creating brand' });
  }
};
