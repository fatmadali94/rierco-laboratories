import * as recordsModel from "../models/recordsModel.js";
import * as invoicesModel from "../models/invoicesModel.js";
/**
 * Create an invoice from completed records
 * POST /api/v1/materials-lab/invoices
 */
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = {
      record_ids: req.body.record_ids,
      tax_rate: parseFloat(req.body.tax_rate) || 0,
      discount_amount: parseFloat(req.body.discount_amount) || 0,
      invoice_additional_charges:
        parseFloat(req.body.invoice_additional_charges) || 0,
      invoice_date: req.body.invoice_date || new Date(),
      due_date: req.body.due_date || null,
      notes: req.body.notes || null,
      terms_and_conditions: req.body.terms_and_conditions || null,
    };
    console.log(invoiceData);
    const invoice = await invoicesModel.createInvoice(invoiceData);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all invoices with pagination and filters
 * GET /api/v1/materials-lab/invoices
 */
export const getAllInvoices = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      payment_state: req.query.payment_state || null,
      customer_id: req.query.customer_id
        ? parseInt(req.query.customer_id)
        : null,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null,
    };

    console.log("invoicesModel:", invoicesModel);
    console.log("getAllInvoices function:", invoicesModel.getAllInvoices);
    console.log("Type:", typeof invoicesModel.getAllInvoices);
    const result = await invoicesModel.getAllInvoices(filters);

    res.json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error getting invoices:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single invoice by ID
 * GET /api/v1/materials-lab/invoices/:id
 */
export const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const invoice = await invoicesModel.getInvoiceById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error getting invoice:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update an invoice
 * PUT /api/v1/materials-lab/invoices/:id
 */
// controllers/invoicesController.js - COMPLETE updateInvoice Controller

export const updateInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);

    // Build updates object with all possible fields
    const updates = {};

    // Financial fields
    if (req.body.tax_rate !== undefined) {
      updates.tax_rate = parseFloat(req.body.tax_rate);
    }

    if (req.body.discount_amount !== undefined) {
      updates.discount_amount = parseFloat(req.body.discount_amount);
    }

    if (req.body.invoice_additional_charges !== undefined) {
      updates.invoice_additional_charges = parseFloat(
        req.body.invoice_additional_charges
      );
    }

    // Date fields
    if (req.body.due_date !== undefined) {
      updates.due_date = req.body.due_date;
    }

    if (req.body.payment_date !== undefined) {
      updates.payment_date = req.body.payment_date;
    }

    // Text fields
    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    if (req.body.terms_and_conditions !== undefined) {
      updates.terms_and_conditions = req.body.terms_and_conditions;
    }

    // PDF fields
    if (req.body.pdf_generated !== undefined) {
      updates.pdf_generated =
        req.body.pdf_generated === true || req.body.pdf_generated === "true";
    }

    if (req.body.pdf_path !== undefined) {
      updates.pdf_path = req.body.pdf_path;
    }

    // Payment state (for manual overrides like 'overdue' or 'cancelled')
    if (req.body.payment_state !== undefined) {
      updates.payment_state = req.body.payment_state;
    }

    // Record IDs (if changing which records are in invoice)
    if (req.body.record_ids !== undefined) {
      updates.record_ids = Array.isArray(req.body.record_ids)
        ? req.body.record_ids
        : [req.body.record_ids];
    }

    // Special flag to allow updates on paid invoices
    if (req.body.allow_paid_update !== undefined) {
      updates.allow_paid_update =
        req.body.allow_paid_update === true ||
        req.body.allow_paid_update === "true";
    }

    const invoice = await invoicesModel.updateInvoice(invoiceId, updates);

    res.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export async function finalizeInvoice(req, res) {
  try {
    const { id } = req.params;

    const finalizedInvoice = await recordsModel.finalizeInvoice(id);

    res.json({
      success: true,
      message:
        "فاکتور با موفقیت نهایی شد. رکوردهای مربوطه دیگر قابل ویرایش نیستند.",
      data: finalizedInvoice,
    });
  } catch (error) {
    console.error("Error finalizing invoice:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Delete an invoice
 * DELETE /api/v1/materials-lab/invoices/:id
 */
export const deleteInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const result = await invoicesModel.deleteInvoice(invoiceId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Add a payment to an invoice
 * POST /api/v1/materials-lab/invoices/:id/payments
 */
export const addPayment = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const paymentData = {
      amount: parseFloat(req.body.amount),
      payment_method: req.body.payment_method || null,
      payment_reference: req.body.payment_reference || null,
      payment_date: req.body.payment_date || new Date(),
      notes: req.body.notes || null,
    };

    if (!paymentData.amount || paymentData.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Payment amount must be greater than 0",
      });
    }

    const invoice = await invoicesModel.addPayment(invoiceId, paymentData);

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search invoices by partial invoice number
 * GET /api/v1/materials-lab/invoices/search/:partialCode
 */
export const searchInvoicesByPartialNumber = async (req, res) => {
  try {
    const partialCode = req.params.partialCode || "";
    const invoices = await invoicesModel.searchInvoicesByPartialNumber(
      partialCode
    );

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error searching invoices:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get invoices by customer
 * GET /api/v1/materials-lab/invoices/customer/:customerId
 */
export const getInvoicesByCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const invoices = await invoicesModel.getInvoicesByCustomer(customerId);

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error getting invoices by customer:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all overdue invoices
 * GET /api/v1/materials-lab/invoices/overdue
 */
export const getOverdueInvoices = async (req, res) => {
  try {
    const invoices = await invoicesModel.getOverdueInvoices();

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error getting overdue invoices:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get invoice statistics
 * GET /api/v1/materials-lab/invoices/statistics
 */
export const getInvoiceStatistics = async (req, res) => {
  try {
    const filters = {
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null,
    };

    const statistics = await invoicesModel.getInvoiceStatistics(filters);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error getting invoice statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Mark invoice for PDF generation
 * PUT /api/v1/materials-lab/invoices/:id/pdf
 */
export const markInvoiceForPdfGeneration = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const pdfPath = req.body.pdf_path;

    if (!pdfPath) {
      return res.status(400).json({
        success: false,
        error: "PDF path is required",
      });
    }

    const invoice = await invoicesModel.markInvoiceForPdfGeneration(
      invoiceId,
      pdfPath
    );

    res.json({
      success: true,
      message: "Invoice PDF marked successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error marking invoice for PDF:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
