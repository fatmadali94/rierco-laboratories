// controllers/countriesController.js
import {
  getAllCountries,
  searchCountriesByName,
  addCountryIfNotExists
} from '../../models/tire_data_model/countriesModel.js';

// GET /api/countries
export const fetchCountries = async (req, res) => {
  try {
    const countries = await getAllCountries();
    res.json(countries);
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ message: 'Error fetching countries' });
  }
};

// GET /api/countries/search?query=...
export const searchCountries = async (req, res) => {
  try {
    const query = req.query.query || '';
    const countries = await searchCountriesByName(query);
    res.json(countries);
  } catch (err) {
    console.error('Error searching countries:', err);
    res.status(500).json({ message: 'Error searching countries' });
  }
};

// POST /api/countries
export const createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Country name is required' });
    }

    const country = await addCountryIfNotExists(name);
    res.status(201).json(country);
  } catch (err) {
    console.error('Error creating country:', err);
    res.status(500).json({ message: 'Error creating country' });
  }
};
