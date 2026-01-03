import { Router } from 'express';
import * as testsController from '../controllers/testsController.js';

const router = Router();

router.post('/', testsController.createTest);
router.get('/', testsController.getAllTests);
router.get('/active', testsController.getActiveTests);
router.get('/search/:searchTerm', testsController.searchTests);
router.get('/:id', testsController.getTestById);
router.put('/:id', testsController.updateTest);
router.delete('/:id', testsController.deleteTest);


export default router;