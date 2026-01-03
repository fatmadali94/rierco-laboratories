import { Router } from "express";
import * as invoicesController from "../controllers/invoicesController.js";
// import { uploadInvoicePdf, handleMulterError } from '../middleware/uploadConfig.js';

const router = Router();

router.patch("/:id/finalize", invoicesController.finalizeInvoice);
router.post("/", invoicesController.createInvoice);
router.get("/", invoicesController.getAllInvoices);
router.get(
  "/search/:partialCode",
  invoicesController.searchInvoicesByPartialNumber
);
router.get("/customer/:customerId", invoicesController.getInvoicesByCustomer);
router.get("/overdue", invoicesController.getOverdueInvoices);
router.get("/statistics", invoicesController.getInvoiceStatistics);
router.get("/:id", invoicesController.getInvoiceById);
router.patch("/:id", invoicesController.updateInvoice);
router.delete("/:id", invoicesController.deleteInvoice);
router.post("/:id/payments", invoicesController.addPayment);
router.put("/:id/pdf", invoicesController.markInvoiceForPdfGeneration);
router.patch("/:id/finalize", invoicesController.finalizeInvoice);
// router.post('//:id/pdf',
//   uploadInvoicePdf.single('invoice_pdf'),
//   handleMulterError,
//   invoicesController.uploadPdf
// );

export default router;
