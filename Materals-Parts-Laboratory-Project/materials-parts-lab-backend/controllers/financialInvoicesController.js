import * as Invoice from "../models/financialInvoicesModel.js";
import * as Payment from "../models/paymentModel.js";

/**
 * Get all invoices with advanced filtering
 */
export async function getAllInvoices(req, res) {
  try {
    const {
      page,
      limit,
      payment_state,
      customer_id,
      customer_name,
      orderer_name,
      date_from,
      date_to,
      due_date_from,
      due_date_to,
      invoice_number,
    } = req.query;

    const filters = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      payment_state: payment_state || null,
      customer_id: customer_id || null,
      customer_name: customer_name || null,
      orderer_name: orderer_name || null,
      date_from: date_from || null,
      date_to: date_to || null,
      due_date_from: due_date_from || null,
      due_date_to: due_date_to || null,
      invoice_number: invoice_number || null,
    };

    const result = await Invoice.getAllInvoices(filters);

    res.status(200).json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
}

/**
 * Get single invoice by ID with full details
 */
export async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.getInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
}

/**
 * Search invoices by partial invoice number
 */
export async function searchInvoices(req, res) {
  try {
    const { q } = req.query;

    const invoices = await Invoice.searchInvoicesByPartialNumber(q);

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error searching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search invoices",
      error: error.message,
    });
  }
}

/**
 * Get all payments for a specific invoice
 */
export async function getInvoicePayments(req, res) {
  try {
    const { id } = req.params;

    const payments = await Payment.getPaymentsByInvoice(id);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching invoice payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice payments",
      error: error.message,
    });
  }
}
