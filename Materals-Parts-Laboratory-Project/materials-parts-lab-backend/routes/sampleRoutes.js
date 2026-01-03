import { Router } from 'express';
import * as samplesController from '..//controllers/samplesController.js';
import { handleMulterError, uploadSampleImages } from '../middleware/uploadConfig.js';

const router = Router();

router.get('/', samplesController.getAllSamples);
router.get('/customer/:customerId', samplesController.getSamplesByCustomer);
router.get('/statistics', samplesController.getSampleStatistics);
router.get('/:id', samplesController.getSampleById);
router.put('/:id', samplesController.updateSample);
router.delete('/:id', samplesController.deleteSample);
router.post('/:id/images',
  uploadSampleImages.array('images', 10),
  handleMulterError,
  samplesController.addSampleImages
);
router.delete('/:id/images', samplesController.removeSampleImage);

export default router;