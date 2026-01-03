import { materialsPool as pool } from "../db.js";

/**
 * Generate the next invoice number
 * Format: INV-1404-1, INV-1404-2, etc.
 */
export async function generateInvoiceNumber() {
  const result = await pool.query(`
    SELECT invoice_number
    FROM invoices
    WHERE invoice_number ~ '^INV-1404-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER) DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return "INV-1404-1";
  }

  const lastNumber = result.rows[0].invoice_number;
  const parts = lastNumber.split("-");
  const lastSequence = parseInt(parts[2]);
  const nextSequence = lastSequence + 1;

  return `INV-1404-${nextSequence}`;
}

// models/invoicesModel.js - createInvoice UPDATED for Junction Table

export async function createInvoice(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validate that all records exist and get their test totals
    const recordsCheck = await client.query(
      `
      SELECT 
        r.id,
        r.state,
        r.sample_id,
        s.customer_id,
        s.orderer_id,
        COALESCE(SUM(rt.final_price), 0) as record_total_price,
        COUNT(rt.id) as test_count
      FROM records r
      JOIN samples s ON r.sample_id = s.id
      LEFT JOIN record_tests rt ON r.id = rt.record_id
      WHERE r.id = ANY($1)
      GROUP BY r.id, r.state, r.sample_id, s.customer_id, s.orderer_id
    `,
      [data.record_ids]
    );

    if (recordsCheck.rows.length !== data.record_ids.length) {
      throw new Error("Some records were not found");
    }

    // Validate that records have tests
    const recordsWithoutTests = recordsCheck.rows.filter(
      (r) => r.test_count === 0
    );
    if (recordsWithoutTests.length > 0) {
      throw new Error(
        `Records without tests cannot be invoiced: ${recordsWithoutTests
          .map((r) => r.id)
          .join(", ")}`
      );
    }

    // Check if all records belong to the same customer OR orderer
    const customerIds = [
      ...new Set(
        recordsCheck.rows.map((r) => r.customer_id).filter((id) => id !== null)
      ),
    ];
    const ordererIds = [
      ...new Set(
        recordsCheck.rows.map((r) => r.orderer_id).filter((id) => id !== null)
      ),
    ];

    // All records must have same customer (if they have one)
    if (customerIds.length > 1) {
      throw new Error("All records must belong to the same customer");
    }

    // All records must have same orderer (if they have one)
    if (ordererIds.length > 1) {
      throw new Error("All records must belong to the same orderer");
    }

    const customerId = customerIds[0] || null;
    const ordererId = ordererIds[0] || null;

    // At least one must exist
    if (!customerId && !ordererId) {
      throw new Error("Records must have either a customer or orderer");
    }

    // Check if any records are already invoiced
    const alreadyInvoiced = await client.query(
      `
      SELECT record_id
      FROM invoice_records
      WHERE record_id = ANY($1)
    `,
      [data.record_ids]
    );

    if (alreadyInvoiced.rows.length > 0) {
      throw new Error("Some records are already invoiced");
    }

    // Calculate totals from all tests in all records
    const subtotal = recordsCheck.rows.reduce((sum, record) => {
      return sum + parseFloat(record.record_total_price);
    }, 0);

    const taxRate = data.tax_rate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = data.discount_amount || 0;
    const invoiceAdditionalCharges = data.invoiceAdditionalCharges || 0;
    const totalAmount =
      subtotal + taxAmount + invoiceAdditionalCharges - discountAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice
    const invoiceResult = await client.query(
      `
      INSERT INTO invoices (
        invoice_number,
        customer_id,
        orderer_id,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        invoice_additional_charges,
        total_amount,
        amount_paid,
        amount_remaining,
        payment_state,
        invoice_date,
        due_date,
        notes,
        terms_and_conditions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `,
      [
        invoiceNumber,
        customerId,
        ordererId,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        invoiceAdditionalCharges,
        totalAmount,
        0, // amount_paid
        totalAmount, // amount_remaining
        "pending",
        data.invoice_date || new Date(),
        data.due_date || null,
        data.notes || null,
        data.terms_and_conditions || null,
      ]
    );

    const invoiceId = invoiceResult.rows[0].id;

    // Link records to invoice
    for (const record of recordsCheck.rows) {
      await client.query(
        `
        INSERT INTO invoice_records (
          invoice_id,
          record_id,
          line_item_price,
          line_item_discount,
          line_item_addition,
          line_item_total
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          invoiceId,
          record.id,
          record.record_total_price, // Sum of all tests in this record
          0, // individual line discounts if needed
          0,
          record.record_total_price,
        ]
      );
    }

    // Update records state to 'invoiced' (if you have a trigger, it will do this automatically)
    await client.query(
      `UPDATE records SET state = 'invoiced' WHERE id = ANY($1)`,
      [data.record_ids]
    );

    await client.query("COMMIT");

    // Return the created invoice with full details
    return await getInvoiceById(invoiceId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all invoices with pagination and filtering
 */
export async function getAllInvoices(filters = {}) {
  const {
    page = 1,
    limit = 20,
    payment_state = null,
    customer_id = null,
    date_from = null,
    date_to = null,
  } = filters;

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (payment_state) {
    conditions.push(`i.payment_state = $${paramCount}`);
    params.push(payment_state);
    paramCount++;
  }

  if (customer_id) {
    conditions.push(`i.customer_id = $${paramCount}`);
    params.push(customer_id);
    paramCount++;
  }

  if (date_from) {
    conditions.push(`i.invoice_date >= $${paramCount}`);
    params.push(date_from);
    paramCount++;
  }

  if (date_to) {
    conditions.push(`i.invoice_date <= $${paramCount}`);
    params.push(date_to);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM invoices i
    ${whereClause}
  `,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get invoices with full information
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      i.*,
      c.name as customer_name,
      c.company_email,
      c.company_phone,
      c.address as customer_address,
      o.full_name as orderer_name,
      o.mobile as orderer_mobile,
      o.email as orderer_email,
      COUNT(DISTINCT ir.record_id) as total_records,
      ARRAY_AGG(ir.record_id) as record_ids,
      COUNT(rt.id) as total_test_count
    FROM invoices i
    LEFT JOIN invoice_records ir ON i.id = ir.invoice_id
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN records r ON ir.record_id = r.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    ${whereClause}
    GROUP BY i.id, c.name, c.company_email, c.company_phone, c.address, 
             o.full_name, o.mobile, o.email
    ORDER BY i.invoice_date DESC, i.id DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    invoices: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single invoice by ID with all related information
 */
export async function getInvoiceById(invoiceId) {
  const result = await pool.query(
    `
    SELECT 
      i.*,
      c.id as customer_id,
      c.name as customer_name,
      c.company_email,
      c.company_phone,
      c.address as customer_address,
      c.tax_id,
      o.id as orderer_id,
      o.full_name as orderer_name,
      o.mobile as orderer_mobile,
      o.email as orderer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    WHERE i.id = $1
  `,
    [invoiceId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const invoice = result.rows[0];

  // Get invoice records with full details
  const recordsResult = await pool.query(
    `
  SELECT 
    ir.*,
    r.record_number,
    r.state as record_state,
    s.sample_name,
    t.title as test_title,
    t.code as test_code,
    st.code as standard_code,
    tr.result_value,
    tr.declaration_of_conformity
  FROM invoice_records ir
  JOIN records r ON ir.record_id = r.id
  JOIN record_tests rt ON r.id = rt.record_id
  JOIN tests t ON rt.test_id = t.id
  LEFT JOIN standards st ON rt.standard_id = st.id
  JOIN samples s ON r.sample_id = s.id
  LEFT JOIN test_results tr ON r.id = tr.record_id
  WHERE ir.invoice_id = $1
  ORDER BY r.record_number
`,
    [invoiceId]
  );

  invoice.records = recordsResult.rows;

  // Get payments
  const paymentsResult = await pool.query(
    `
    SELECT 
      p.*
    FROM payments p
    WHERE p.invoice_id = $1
    ORDER BY p.payment_date DESC, p.created_at DESC
  `,
    [invoiceId]
  );

  invoice.payments = paymentsResult.rows;

  return invoice;
}

// models/invoicesModel.js - updateInvoice CORRECTED

export async function updateInvoice(invoiceId, updates) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get current invoice
    const currentInvoice = await client.query(
      "SELECT * FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (currentInvoice.rows.length === 0) {
      throw new Error("Invoice not found");
    }

    const current = currentInvoice.rows[0];

    // Don't allow updates if invoice is finalized
    if (current.is_finalized) {
      throw new Error("Cannot update a finalized invoice");
    }

    // Don't allow updates if invoice is paid (unless explicitly allowed)
    if (current.payment_state === "paid" && !updates.allow_paid_update) {
      throw new Error("Cannot update a paid invoice");
    }

    // ========================================
    // HANDLE RECORD_IDS UPDATE FIRST (if present)
    // ========================================
    if (updates.record_ids) {
      // Validate all records exist and get their totals
      const recordsCheck = await client.query(
        `
        SELECT 
          r.id,
          COALESCE(SUM(rt.final_price), 0) as record_total,
          COUNT(rt.id) as test_count
        FROM records r
        LEFT JOIN record_tests rt ON r.id = rt.record_id
        WHERE r.id = ANY($1)
        GROUP BY r.id
        `,
        [updates.record_ids]
      );

      if (recordsCheck.rows.length !== updates.record_ids.length) {
        throw new Error("Some records were not found");
      }

      // Validate records have tests
      const recordsWithoutTests = recordsCheck.rows.filter(
        (r) => r.test_count === 0
      );
      if (recordsWithoutTests.length > 0) {
        throw new Error("All records must have at least one test");
      }

      // Calculate new subtotal from all tests
      const subtotal = recordsCheck.rows.reduce((sum, record) => {
        return sum + parseFloat(record.record_total);
      }, 0);

      // Use existing or new values
      const taxRate =
        updates.tax_rate !== undefined ? updates.tax_rate : current.tax_rate;
      const discountAmount =
        updates.discount_amount !== undefined
          ? updates.discount_amount
          : current.discount_amount;
      const invoiceAdditionalCharges =
        updates.invoice_additional_charges !== undefined
          ? updates.invoice_additional_charges
          : current.invoice_additional_charges || 0;

      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount =
        subtotal + taxAmount + invoiceAdditionalCharges - discountAmount;
      const amountRemaining =
        totalAmount - parseFloat(current.amount_paid || 0);

      // Delete old invoice_records
      await client.query(`DELETE FROM invoice_records WHERE invoice_id = $1`, [
        invoiceId,
      ]);

      // Insert new invoice_records
      for (const record of recordsCheck.rows) {
        await client.query(
          `
          INSERT INTO invoice_records (
            invoice_id,
            record_id,
            line_item_price,
            line_item_discount,
            line_item_addition,
            line_item_total
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            invoiceId,
            record.id,
            record.record_total, // ✅ Fixed: was record_total_price
            0, // line_item_discount
            0, // line_item_addition
            record.record_total, // ✅ Fixed: was record_total_price
          ]
        );
      }

      // Update invoice with new totals
      await client.query(
        `
        UPDATE invoices
        SET 
          subtotal = $1,
          tax_rate = $2,
          tax_amount = $3,
          discount_amount = $4,
          invoice_additional_charges = $5,
          total_amount = $6,
          amount_remaining = $7,
          payment_state = CASE
            WHEN $7 <= 0 THEN 'paid'
            WHEN $8 > 0 THEN 'partial'
            ELSE 'pending'
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        `,
        [
          subtotal,
          taxRate,
          taxAmount,
          discountAmount,
          invoiceAdditionalCharges,
          totalAmount,
          amountRemaining,
          current.amount_paid || 0,
          invoiceId,
        ]
      );

      // Update records state
      await client.query(
        `UPDATE records SET state = 'invoiced' WHERE id = ANY($1)`,
        [updates.record_ids]
      );
    }

    // ========================================
    // HANDLE OTHER FIELD UPDATES
    // ========================================
    const updateFields = [];
    const updateValues = [];
    let valueCount = 1;

    // Tax rate change (only if record_ids not already handled)
    if (
      !updates.record_ids &&
      updates.tax_rate !== undefined &&
      updates.tax_rate !== current.tax_rate
    ) {
      updateFields.push(`tax_rate = $${valueCount}`);
      updateValues.push(updates.tax_rate);
      valueCount++;

      const newTaxAmount =
        (parseFloat(current.subtotal) * parseFloat(updates.tax_rate)) / 100;
      updateFields.push(`tax_amount = $${valueCount}`);
      updateValues.push(newTaxAmount);
      valueCount++;
    }

    // Discount change (only if record_ids not already handled)
    if (
      !updates.record_ids &&
      updates.discount_amount !== undefined &&
      updates.discount_amount !== current.discount_amount
    ) {
      updateFields.push(`discount_amount = $${valueCount}`);
      updateValues.push(updates.discount_amount);
      valueCount++;
    }

    // Invoice additional charges (only if record_ids not already handled)
    if (
      !updates.record_ids &&
      updates.invoice_additional_charges !== undefined &&
      updates.invoice_additional_charges !== current.invoice_additional_charges
    ) {
      updateFields.push(`invoice_additional_charges = $${valueCount}`);
      updateValues.push(updates.invoice_additional_charges);
      valueCount++;
    }

    // Recalculate total if tax, discount, or additional charges changed
    if (
      !updates.record_ids &&
      (updates.tax_rate !== undefined ||
        updates.discount_amount !== undefined ||
        updates.invoice_additional_charges !== undefined)
    ) {
      const newTaxRate =
        updates.tax_rate !== undefined ? updates.tax_rate : current.tax_rate;
      const newDiscount =
        updates.discount_amount !== undefined
          ? updates.discount_amount
          : current.discount_amount;
      const newAdditionalCharges =
        updates.invoice_additional_charges !== undefined
          ? updates.invoice_additional_charges
          : current.invoice_additional_charges || 0;

      const newTaxAmount =
        (parseFloat(current.subtotal) * parseFloat(newTaxRate)) / 100;
      const newTotal =
        parseFloat(current.subtotal) +
        newTaxAmount +
        parseFloat(newAdditionalCharges) -
        parseFloat(newDiscount);

      updateFields.push(`total_amount = $${valueCount}`);
      updateValues.push(newTotal);
      valueCount++;

      // Update remaining amount
      const newRemaining = newTotal - parseFloat(current.amount_paid || 0);
      updateFields.push(`amount_remaining = $${valueCount}`);
      updateValues.push(newRemaining);
      valueCount++;

      // Update payment state if needed
      if (newRemaining <= 0) {
        updateFields.push(`payment_state = 'paid'`);
      } else if (parseFloat(current.amount_paid || 0) > 0) {
        updateFields.push(`payment_state = 'partial'`);
      }
    }

    // Due date
    if (updates.due_date !== undefined) {
      updateFields.push(`due_date = $${valueCount}`);
      updateValues.push(updates.due_date);
      valueCount++;
    }

    // Payment date
    if (updates.payment_date !== undefined) {
      updateFields.push(`payment_date = $${valueCount}`);
      updateValues.push(updates.payment_date);
      valueCount++;
    }

    // Notes
    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${valueCount}`);
      updateValues.push(updates.notes);
      valueCount++;
    }

    // Terms and conditions
    if (updates.terms_and_conditions !== undefined) {
      updateFields.push(`terms_and_conditions = $${valueCount}`);
      updateValues.push(updates.terms_and_conditions);
      valueCount++;
    }

    // PDF generated flag
    if (updates.pdf_generated !== undefined) {
      updateFields.push(`pdf_generated = $${valueCount}`);
      updateValues.push(updates.pdf_generated);
      valueCount++;
    }

    // PDF path
    if (updates.pdf_path !== undefined) {
      updateFields.push(`pdf_path = $${valueCount}`);
      updateValues.push(updates.pdf_path);
      valueCount++;
    }

    // Payment state manual update (for overdue, cancelled)
    if (
      updates.payment_state &&
      updates.payment_state !== current.payment_state
    ) {
      updateFields.push(`payment_state = $${valueCount}`);
      updateValues.push(updates.payment_state);
      valueCount++;
    }

    // Perform update if there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(invoiceId);
      const updateQuery = `
        UPDATE invoices
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${valueCount}
        RETURNING *
      `;

      await client.query(updateQuery, updateValues);
    }

    await client.query("COMMIT");

    return await getInvoiceById(invoiceId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// /**
//  * Add a payment to an invoice
//  */
// export async function addPayment(invoiceId, paymentData) {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     // Get invoice
//     const invoice = await client.query("SELECT * FROM invoices WHERE id = $1", [
//       invoiceId,
//     ]);

//     if (invoice.rows.length === 0) {
//       throw new Error("Invoice not found");
//     }

//     const currentInvoice = invoice.rows[0];

//     // Validate payment amount
//     if (paymentData.amount <= 0) {
//       throw new Error("Payment amount must be greater than 0");
//     }

//     if (
//       parseFloat(paymentData.amount) >
//       parseFloat(currentInvoice.amount_remaining)
//     ) {
//       throw new Error("Payment amount exceeds remaining balance");
//     }

//     // Insert payment
//     await client.query(
//       `
//       INSERT INTO payments (
//         invoice_id,
//         amount,
//         payment_method,
//         payment_reference,
//         payment_date,
//         notes,
//       )
//       VALUES ($1, $2, $3, $4, $5, $6)
//     `,
//       [
//         invoiceId,
//         paymentData.amount,
//         paymentData.payment_method || null,
//         paymentData.payment_reference || null,
//         paymentData.payment_date || new Date(),
//         paymentData.notes || null,
//       ]
//     );

//     // Trigger will automatically update invoice payment status

//     await client.query("COMMIT");

//     return await getInvoiceById(invoiceId);
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// }

/**
 * Search invoices by partial invoice number
 */
export async function searchInvoicesByPartialNumber(partialCode) {
  const trimmed = (partialCode || "").toString().trim();

  if (!trimmed) {
    // Return most recent 20 invoices
    const result = await pool.query(`
      SELECT 
        i.*,
        c.name as customer_name,
        o.full_name as orderer_name,
        COUNT(ir.record_id) as total_records
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orderers o ON i.orderer_id = o.id
      LEFT JOIN invoice_records ir ON i.id = ir.invoice_id
      GROUP BY i.id, c.name, o.full_name
      ORDER BY i.invoice_date DESC, i.id DESC
      LIMIT 20
    `);
    return result.rows;
  }

  // Search by invoice number pattern
  const result = await pool.query(
    `
    SELECT 
      i.*,
      c.name as customer_name,
      o.full_name as orderer_name,
      COUNT(ir.record_id) as total_records
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    LEFT JOIN invoice_records ir ON i.id = ir.invoice_id
    WHERE i.invoice_number ILIKE $1
    GROUP BY i.id, c.name, o.full_name
    ORDER BY i.invoice_date DESC
    LIMIT 20
  `,
    [`%${trimmed}%`]
  );

  return result.rows;
}

/**
 * Get invoices by customer
 */
export async function getInvoicesByCustomer(customerId) {
  const result = await pool.query(
    `
    SELECT 
      i.*,
      c.name as customer_name,
      o.full_name as orderer_name,
      COUNT(ir.record_id) as total_records
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    LEFT JOIN invoice_records ir ON i.id = ir.invoice_id
    WHERE i.customer_id = $1
    GROUP BY i.id, c.name, o.full_name
    ORDER BY i.invoice_date DESC
  `,
    [customerId]
  );

  return result.rows;
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices() {
  const result = await pool.query(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.company_email,
      c.company_phone,
      o.full_name as orderer_name,
      o.mobile as orderer_mobile,
      COUNT(ir.record_id) as total_records,
      CURRENT_DATE - i.due_date as days_overdue
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    LEFT JOIN invoice_records ir ON i.id = ir.invoice_id
    WHERE i.payment_state IN ('pending', 'partial')
      AND i.due_date < CURRENT_DATE
    GROUP BY i.id, c.name, c.company_email, c.company_phone, 
             o.full_name, o.mobile
    ORDER BY days_overdue DESC
  `);

  return result.rows;
}

/**
 * Delete an invoice (only if not paid)
 */
export async function deleteInvoice(invoiceId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check invoice status
    const invoice = await client.query(
      "SELECT payment_state, amount_paid FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (invoice.rows.length === 0) {
      throw new Error("Invoice not found");
    }

    if (parseFloat(invoice.rows[0].amount_paid) > 0) {
      throw new Error("Cannot delete an invoice with payments");
    }

    if (is_finalized === "true") {
      throw new Error("Cannot delete finilized invoice");
    }

    // Get associated records to update their state back to 'completed'
    const records = await client.query(
      "SELECT record_id FROM invoice_records WHERE invoice_id = $1",
      [invoiceId]
    );

    // Delete invoice (cascade will delete invoice_records and payments)
    await client.query("DELETE FROM invoices WHERE id = $1", [invoiceId]);

    // Update records state back to 'completed'
    if (records.rows.length > 0) {
      const recordIds = records.rows.map((r) => r.record_id);
      await client.query("UPDATE records SET state = $1 WHERE id = ANY($2)", [
        "completed",
        recordIds,
      ]);
    }

    await client.query("COMMIT");

    return { success: true, message: "Invoice deleted successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Mark invoice as ready for PDF generation
 */
export async function markInvoiceForPdfGeneration(invoiceId, pdfPath) {
  await pool.query(
    `
    UPDATE invoices
    SET pdf_generated = TRUE, pdf_path = $2
    WHERE id = $1
  `,
    [invoiceId, pdfPath]
  );

  return await getInvoiceById(invoiceId);
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStatistics(filters = {}) {
  const { date_from = null, date_to = null } = filters;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (date_from) {
    conditions.push(`invoice_date >= $${paramCount}`);
    params.push(date_from);
    paramCount++;
  }

  if (date_to) {
    conditions.push(`invoice_date <= $${paramCount}`);
    params.push(date_to);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT 
      COUNT(*) as total_invoices,
      COUNT(*) FILTER (WHERE payment_state = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE payment_state = 'partial') as partial_count,
      COUNT(*) FILTER (WHERE payment_state = 'paid') as paid_count,
      COUNT(*) FILTER (WHERE payment_state IN ('pending', 'partial') AND due_date < CURRENT_DATE) as overdue_count,
      COALESCE(SUM(total_amount), 0) as total_amount,
      COALESCE(SUM(amount_paid), 0) as total_paid,
      COALESCE(SUM(amount_remaining), 0) as total_remaining,
      COALESCE(SUM(CASE WHEN payment_state IN ('pending', 'partial') AND due_date < CURRENT_DATE THEN amount_remaining ELSE 0 END), 0) as overdue_amount
    FROM invoices
    ${whereClause}
  `,
    params
  );

  return result.rows[0];
}
