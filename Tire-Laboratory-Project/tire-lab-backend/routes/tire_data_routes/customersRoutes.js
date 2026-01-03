import express from 'express';
import {
  fetchCustomers,
  searchCustomers,
  createCustomer
} from '../../controllers/tire_data_controllers/customerController.js';

const router = express.Router();

router.get('/', fetchCustomers);         
router.get('/search', searchCustomers);  
router.post('/', createCustomer);         

export default router;
