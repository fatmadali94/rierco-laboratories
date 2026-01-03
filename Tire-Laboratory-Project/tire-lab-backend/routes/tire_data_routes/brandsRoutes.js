import express from 'express';
import {
  fetchBrands,
  searchBrands,
  createBrand
} from '../../controllers/tire_data_controllers/brandController.js';

const router = express.Router();

router.get('/', fetchBrands);         
router.get('/search', searchBrands);  
router.post('/', createBrand);         

export default router;
