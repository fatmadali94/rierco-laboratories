import express from 'express';
import {
  fetchCountries,
  searchCountries,
  createCountry
} from '../../controllers/tire_data_controllers/countryController.js';

const router = express.Router();

router.get('/', fetchCountries);         
router.get('/search', searchCountries);  
router.post('/', createCountry);         

export default router;
