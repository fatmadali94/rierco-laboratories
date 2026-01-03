import express from 'express';
import {
  getEntryCountsByDate,
  getRingsSumByDate,
  getEntryCountsBySize,
  getEntryCountsByBrand,
  getEntryCountsByCustomer,
  getTestsByDate,
  getEntryCountsByTireType,
  getEntryCountsByTireGroup,
  getLabConfirmationStatus,
  getDepositorySums,
  getAllData,
  downloadDepositoryData,
  downloadAllData,
  getDashboardSummary,
} from '../controllers/dashboardController.js';


const router = express.Router();

// Individual endpoints
router.get('/entry-counts-by-date', getEntryCountsByDate);
router.get('/rings-sum-by-date', getRingsSumByDate);
router.get('/entry-counts-by-size', getEntryCountsBySize);
router.get('/entry-counts-by-brand', getEntryCountsByBrand);
router.get('/entry-counts-by-customer', getEntryCountsByCustomer);
router.get('/tests-by-date', getTestsByDate);
router.get('/entry-counts-by-tire-type', getEntryCountsByTireType);
router.get('/entry-counts-by-tire-group', getEntryCountsByTireGroup);
router.get('/lab-confirmation-status', getLabConfirmationStatus);
router.get('/depository-sums', getDepositorySums);
router.get('/all-data', getAllData);
router.get("/download-all-data", downloadAllData);
router.get("/download-Depository-data", downloadDepositoryData);


// Combined endpoint for efficient dashboard loading
router.get('/summary', getDashboardSummary);

export default router;