// routes/depositoryRecords.js
import express from 'express';
import * as depositoryRecordsController from '../controllers/depositoryRecordsController.js';

const router = express.Router();

router.get('/', depositoryRecordsController.getAllDepositoryRecords);
router.get('/search', depositoryRecordsController.searchDepositoryRecordsByPartialCode);
router.get('/:entry_code', depositoryRecordsController.getDepositoryRecordByEntryCode);
router.post('/', depositoryRecordsController.createDepositoryRecord);
router.put('/:entry_code', depositoryRecordsController.updateDepositoryRecordByEntryCode);
// router.delete('/:entry_code', depositoryRecordsController.deleteDepositoryRecord);

export default router;