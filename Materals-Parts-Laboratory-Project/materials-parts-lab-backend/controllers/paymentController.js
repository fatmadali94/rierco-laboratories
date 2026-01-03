// controllers/paymentsController.js - With Cloudinary Image Upload

import { v2 as cloudinary } from "cloudinary";
import * as paymentsModel from "../models/paymentModel.js";

/**
 * Add payment to invoice with image upload
 */
export const addPayment = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);

    // Parse payment data (might be JSON string if files present)
    let paymentData;
    if (req.body.paymentData) {
      paymentData = JSON.parse(req.body.paymentData);
    } else {
      paymentData = req.body;
    }

    // Upload payment images to Cloudinary (if any)
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "laboratory/payments",
          resource_type: "auto",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Add image URLs to payment data
    paymentData.payment_image = imageUrls;

    // Validate required fields
    if (!paymentData.amount) {
      return res.status(400).json({
        success: false,
        error: "Payment amount is required",
      });
    }

    // Add payment
    const result = await paymentsModel.addPayment(invoiceId, {
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.payment_method || null,
      payment_image: imageUrls,
      payment_reference: paymentData.payment_reference || null,
      payment_date: paymentData.payment_date || new Date(),
      notes: paymentData.notes || null,
    });

    return res.status(200).json({
      success: true,
      message: "Payment added successfully",
      data: {
        payment: result.payment,
        invoice: result.invoice,
      },
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all payments for an invoice
 */
export const getPaymentsByInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const payments = await paymentsModel.getPaymentsByInvoice(invoiceId);

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get single payment
 */
export const getPaymentById = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const payment = await paymentsModel.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    return res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update payment with optional new images
 */
export const updatePayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);

    // Parse update data
    let updates;
    if (req.body.paymentData) {
      updates = JSON.parse(req.body.paymentData);
    } else {
      updates = req.body;
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "laboratory/payments",
          resource_type: "auto",
        });
        newImageUrls.push(result.secure_url);
      }

      // Merge with existing images if keeping them
      if (updates.existing_images && Array.isArray(updates.existing_images)) {
        updates.payment_image = [...updates.existing_images, ...newImageUrls];
      } else {
        updates.payment_image = newImageUrls;
      }
    } else if (updates.existing_images) {
      // Only keep existing images
      updates.payment_image = updates.existing_images;
    }

    // Parse numeric fields
    if (updates.amount !== undefined) {
      updates.amount = parseFloat(updates.amount);
    }

    const payment = await paymentsModel.updatePayment(paymentId, updates);

    return res.json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete payment
 */
export const deletePayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    await paymentsModel.deletePayment(paymentId);

    return res.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
