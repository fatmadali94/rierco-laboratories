import { Router } from 'express';
import  * as customersController  from '../controllers/customersController.js'

const router = Router();

router.post('/', customersController.createCustomer);
router.get('/', customersController.getAllCustomers);
router.get('/search/:searchTerm', customersController.searchCustomers);
router.get('/:id', customersController.getCustomerById);
router.put('/:id', customersController.updateCustomer);
router.delete('/:id', customersController.deleteCustomer);

export default router;