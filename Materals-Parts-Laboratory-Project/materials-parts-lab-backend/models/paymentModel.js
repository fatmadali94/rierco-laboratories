// models/paymentsModel.js - CORRECTED addPayment with image support
import { materialsPool as pool } from "../db.js";
import * as invoicesModel from "./invoicesModel.js";

export async function addPayment(invoiceId, paymentData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get invoice
    const invoice = await client.query("SELECT * FROM invoices WHERE id = $1", [
      invoiceId,
    ]);

    if (invoice.rows.length === 0) {
      throw new Error("Invoice not found");
    }

    const currentInvoice = invoice.rows[0];

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error("Payment amount must be greater than 0");
    }

    if (
      parseFloat(paymentData.amount) >
      parseFloat(currentInvoice.amount_remaining)
    ) {
      throw new Error("Payment amount exceeds remaining balance");
    }

    // Step 1: Insert payment
    console.log("Step 1: Inserting payment...");
    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        payment_image,
        payment_reference,
        payment_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        invoiceId,
        paymentData.amount,
        paymentData.payment_method || null,
        paymentData.payment_image || [],
        paymentData.payment_reference || null,
        paymentData.payment_date || new Date().toISOString().split("T")[0],
        paymentData.notes || null,
      ],
    );
    console.log("✅ Payment inserted:", paymentResult.rows[0].id);

    // Step 2: Calculate new amounts IN JAVASCRIPT (not in SQL)
    console.log("Step 2: Calculating new amounts...");
    const paymentAmount = parseFloat(paymentData.amount);
    const currentAmountPaid = parseFloat(currentInvoice.amount_paid || 0);
    const totalAmount = parseFloat(currentInvoice.total_amount);

    const newAmountPaid = currentAmountPaid + paymentAmount;
    const newAmountRemaining = totalAmount - newAmountPaid;

    let newPaymentState = "pending";
    if (newAmountRemaining <= 0) {
      newPaymentState = "paid";
    } else if (newAmountPaid > 0) {
      newPaymentState = "partial";
    }

    console.log("Calculation:", {
      currentAmountPaid,
      paymentAmount,
      newAmountPaid,
      totalAmount,
      newAmountRemaining,
      newPaymentState,
    });

    // Step 3: Update invoice with CALCULATED values
    console.log("Step 3: Updating invoice...");
    await client.query(
      `
  UPDATE invoices
  SET 
    amount_paid = $1,
    amount_remaining = $2,
    payment_state = $3,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $4
  `,
      [newAmountPaid, newAmountRemaining, newPaymentState, invoiceId],
    );
    console.log("✅ Invoice updated");

    // Step 4: Commit
    await client.query("COMMIT");
    console.log("✅ Transaction committed");

    // Step 5: Get updated invoice
    const updatedInvoiceResult = await pool.query(
      "SELECT * FROM invoices WHERE id = $1",
      [invoiceId],
    );

    return {
      payment: paymentResult.rows[0],
      invoice: updatedInvoiceResult.rows[0],
    };
  } catch (error) {
    console.error("=== PAYMENT MODEL ERROR ===");
    console.error("Error:", error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ALTERNATIVE: Even safer - recalculate from database
export async function addPaymentWithRecalculation(invoiceId, paymentData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get invoice
    const invoice = await client.query("SELECT * FROM invoices WHERE id = $1", [
      invoiceId,
    ]);

    if (invoice.rows.length === 0) {
      throw new Error("Invoice not found");
    }

    const currentInvoice = invoice.rows[0];

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error("Payment amount must be greater than 0");
    }

    if (
      parseFloat(paymentData.amount) >
      parseFloat(currentInvoice.amount_remaining)
    ) {
      throw new Error("Payment amount exceeds remaining balance");
    }

    // Insert payment
    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        payment_image,
        payment_reference,
        payment_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        invoiceId,
        paymentData.amount,
        paymentData.payment_method || null,
        paymentData.payment_image || [],
        paymentData.payment_reference || null,
        paymentData.payment_date || new Date().toISOString().split("T")[0],
        paymentData.notes || null,
      ],
    );

    // Recalculate from ALL payments in database (safest method)
    const totalPaidResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = $1`,
      [invoiceId],
    );

    const newAmountPaid = parseFloat(totalPaidResult.rows[0].total_paid);
    const totalAmount = parseFloat(currentInvoice.total_amount);
    const newAmountRemaining = totalAmount - newAmountPaid;

    let newPaymentState = "pending";
    if (newAmountRemaining <= 0) {
      newPaymentState = "paid";
    } else if (newAmountPaid > 0) {
      newPaymentState = "partial";
    }

    // Update invoice
    await client.query(
      `
      UPDATE invoices
      SET 
        amount_paid = $1,
        amount_remaining = $2,
        payment_state = $3,
        payment_date = CASE
          WHEN $3 = 'paid' THEN CURRENT_DATE
          ELSE payment_date
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      `,
      [newAmountPaid, newAmountRemaining, newPaymentState, invoiceId],
    );

    await client.query("COMMIT");

    const updatedInvoiceResult = await pool.query(
      "SELECT * FROM invoices WHERE id = $1",
      [invoiceId],
    );

    return {
      payment: paymentResult.rows[0],
      invoice: updatedInvoiceResult.rows[0],
    };
  } catch (error) {
    console.error("=== PAYMENT MODEL ERROR ===");
    console.error("Error:", error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all payments for an invoice
 */
export async function getPaymentsByInvoice(invoiceId) {
  const result = await pool.query(
    `
    SELECT 
      p.*,
      i.invoice_number,
      i.total_amount,
      i.amount_remaining
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.invoice_id = $1
    ORDER BY p.payment_date DESC, p.created_at DESC
    `,
    [invoiceId],
  );

  return result.rows;
}

/**
 * Get single payment by ID
 */
export async function getPaymentById(paymentId) {
  const result = await pool.query(
    `
    SELECT 
      p.*,
      i.invoice_number,
      i.total_amount,
      i.amount_paid,
      i.amount_remaining
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.id = $1
    `,
    [paymentId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update payment (including images)
 */
export async function updatePayment(paymentId, updates) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get current payment
    const currentPayment = await client.query(
      "SELECT * FROM payments WHERE id = $1",
      [paymentId],
    );

    if (currentPayment.rows.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = currentPayment.rows[0];

    // Get invoice to check if finalized
    const invoice = await client.query(
      "SELECT is_finalized, amount_paid, amount_remaining, total_amount FROM invoices WHERE id = $1",
      [payment.invoice_id],
    );

    if (invoice.rows[0].is_finalized) {
      throw new Error("Cannot update payment for finalized invoice");
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (updates.amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      values.push(updates.amount);
      paramCount++;
    }

    if (updates.payment_method !== undefined) {
      updateFields.push(`payment_method = $${paramCount}`);
      values.push(updates.payment_method);
      paramCount++;
    }

    if (updates.payment_image !== undefined) {
      updateFields.push(`payment_image = $${paramCount}`);
      values.push(updates.payment_image);
      paramCount++;
    }

    if (updates.payment_reference !== undefined) {
      updateFields.push(`payment_reference = $${paramCount}`);
      values.push(updates.payment_reference);
      paramCount++;
    }

    if (updates.payment_date !== undefined) {
      updateFields.push(`payment_date = $${paramCount}`);
      values.push(updates.payment_date);
      paramCount++;
    }

    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      values.push(updates.notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      await client.query("COMMIT");
      return await getPaymentById(paymentId);
    }

    values.push(paymentId);
    await client.query(
      `UPDATE payments 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount}`,
      values,
    );

    // If amount changed, recalculate invoice totals
    if (updates.amount !== undefined) {
      const allPayments = await client.query(
        "SELECT SUM(amount) as total FROM payments WHERE invoice_id = $1",
        [payment.invoice_id],
      );

      const totalPaid = parseFloat(allPayments.rows[0].total || 0);
      const remaining = parseFloat(invoice.rows[0].total_amount) - totalPaid;

      let paymentState = "pending";
      if (remaining <= 0) {
        paymentState = "paid";
      } else if (totalPaid > 0) {
        paymentState = "partial";
      }

      await client.query(
        `UPDATE invoices 
         SET amount_paid = $1, amount_remaining = $2, payment_state = $3 
         WHERE id = $4`,
        [totalPaid, remaining, paymentState, payment.invoice_id],
      );
    }

    await client.query("COMMIT");
    return await getPaymentById(paymentId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete payment
 */
export async function deletePayment(paymentId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const payment = await client.query("SELECT * FROM payments WHERE id = $1", [
      paymentId,
    ]);

    if (payment.rows.length === 0) {
      throw new Error("Payment not found");
    }

    const invoiceId = payment.rows[0].invoice_id;

    // Check if invoice is finalized
    const invoice = await client.query(
      "SELECT is_finalized, total_amount FROM invoices WHERE id = $1",
      [invoiceId],
    );

    if (invoice.rows[0].is_finalized) {
      throw new Error("Cannot delete payment from finalized invoice");
    }

    // Delete payment
    await client.query("DELETE FROM payments WHERE id = $1", [paymentId]);

    // Recalculate invoice totals
    const remainingPayments = await client.query(
      "SELECT SUM(amount) as total FROM payments WHERE invoice_id = $1",
      [invoiceId],
    );

    const totalPaid = parseFloat(remainingPayments.rows[0].total || 0);
    const remaining = parseFloat(invoice.rows[0].total_amount) - totalPaid;

    let paymentState = "pending";
    if (remaining <= 0) {
      paymentState = "paid";
    } else if (totalPaid > 0) {
      paymentState = "partial";
    }

    await client.query(
      `UPDATE invoices 
       SET amount_paid = $1, amount_remaining = $2, payment_state = $3 
       WHERE id = $4`,
      [totalPaid, remaining, paymentState, invoiceId],
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
