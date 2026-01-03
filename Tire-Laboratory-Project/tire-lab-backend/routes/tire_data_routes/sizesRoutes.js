import express from 'express';
import {
  fetchSizes,
  searchSizes,
  createSize
} from '../../controllers/tire_data_controllers/sizeController.js';

const router = express.Router();

router.get('/', fetchSizes);         
router.get('/search', searchSizes);  
router.post('/', createSize);         

export default router;
