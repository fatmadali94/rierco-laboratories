import express from "express";
import multer from "multer";
import * as paymentsController from "../controllers/paymentController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Add payment to invoice (with optional images)
router.post(
  "/invoice/:invoiceId/payments",
  upload.array("payment_images", 5), // Max 5 images
  paymentsController.addPayment
);

// Get all payments for an invoice
router.get(
  "/invoice/:invoiceId/payments",
  paymentsController.getPaymentsByInvoice
);

// Get single payment
router.get("/payments/:id", paymentsController.getPaymentById);

// Update payment (with optional new images)
router.patch(
  "/payments/:id",
  upload.array("payment_images", 5),
  paymentsController.updatePayment
);

// Delete payment
router.delete("/payments/:id", paymentsController.deletePayment);

export default router;
