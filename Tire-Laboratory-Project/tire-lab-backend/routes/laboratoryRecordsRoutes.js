// routes/laboratoryRecords.js
import express from 'express';
import * as laboratoryRecordsController from '../controllers/laboratoryRecordsController.js';

const router = express.Router();

router.get('/', laboratoryRecordsController.getAllLaboratoryRecords);
router.get('/search', laboratoryRecordsController.searchLaboratoryRecordsByPartialCode);
router.get('/:entry_code', laboratoryRecordsController.getLaboratoryRecordByEntryCode);
router.post('/', laboratoryRecordsController.createLaboratoryRecord);
router.put('/:entry_code', laboratoryRecordsController.updateLaboratoryRecordByEntryCode);

export default router;
