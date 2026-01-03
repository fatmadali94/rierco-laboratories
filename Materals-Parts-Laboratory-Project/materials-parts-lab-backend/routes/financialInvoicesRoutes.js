import express from "express";
import * as financialInvoicesController from "../controllers/financialInvoicesController.js";

const router = express.Router();

// Get all invoices with advanced filtering
router.get("/", financialInvoicesController.getAllInvoices);

// Search invoices by partial invoice number
router.get("/search", financialInvoicesController.searchInvoices);

// Get single invoice by ID with full details
router.get("/:id", financialInvoicesController.getInvoiceById);

// Get payments for a specific invoice
router.get("/:id/payments", financialInvoicesController.getInvoicePayments);

export default router;
