import { Router } from 'express';
import * as testsController from '../controllers/testsController.js';

const router = Router();

router.post('/', testsController.createStandard);
router.get('/', testsController.getAllStandards);
router.get('/active', testsController.getActiveStandards);
router.get('/search/:searchTerm', testsController.searchStandards);
router.get('/test/:testId', testsController.getStandardsForTest);
router.get('/:id', testsController.getStandardById);
router.put('/:id', testsController.updateStandard);
router.delete('/:id', testsController.deleteStandard);


export default router;