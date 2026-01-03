// routes/newEntries.js
import express from 'express';
import * as newEntriesController from '../controllers/newEntriesController.js';

const router = express.Router();

router.get('/', newEntriesController.getAllNewEntries);
router.get('/search', newEntriesController.searchNewEntriesByPartialCode);
router.get('/:entry_code', newEntriesController.getNewEntryByEntryCode);
router.post('/', newEntriesController.createNewEntry);
router.put('/:entry_code', newEntriesController.updateNewEntry);
router.delete('/:entry_code', newEntriesController.deleteNewEntry);

export default router;


