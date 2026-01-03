// routes/receptoryRecords.js
import express from 'express';
import * as receptoryRecordsController from '../controllers/receptoryRecordsController.js';

const router = express.Router();

router.get('/', receptoryRecordsController.getAllReceptoryRecords);
router.get('/search', receptoryRecordsController.searchReceptoryRecordsByPartialCode);
router.get('/:entry_code', receptoryRecordsController.getReceptoryRecordByEntryCode);
router.post('/', receptoryRecordsController.createReceptoryRecord);
router.put('/:entry_code', receptoryRecordsController.updateReceptoryRecordByEntryCode);

export default router;