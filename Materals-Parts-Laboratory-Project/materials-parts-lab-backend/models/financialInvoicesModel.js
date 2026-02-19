import { materialsPool as pool } from "../db.js";

/**
 * Get all invoices with advanced filtering
 */
export async function getAllInvoices(filters = {}) {
  const {
    page = 1,
    limit = 20,
    payment_state = null,
    customer_id = null,
    customer_name = null,
    orderer_name = null,
    date_from = null,
    date_to = null,
    due_date_from = null,
    due_date_to = null,
    invoice_number = null,
  } = filters;

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramCount = 1;

  // Payment state filter
  if (payment_state) {
    conditions.push(`i.payment_state = $${paramCount}`);
    params.push(payment_state);
    paramCount++;
  }

  // Customer ID filter
  if (customer_id) {
    conditions.push(`i.customer_id = $${paramCount}`);
    params.push(customer_id);
    paramCount++;
  }

  // Customer name filter (case-insensitive partial match)
  if (customer_name) {
    conditions.push(`c.name ILIKE $${paramCount}`);
    params.push(`%${customer_name}%`);
    paramCount++;
  }

  // Orderer name filter (case-insensitive partial match)
  if (orderer_name) {
    conditions.push(`o.full_name ILIKE $${paramCount}`);
    params.push(`%${orderer_name}%`);
    paramCount++;
  }

  // Invoice date range filter
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

  // Due date range filter
  if (due_date_from) {
    conditions.push(`i.due_date >= $${paramCount}`);
    params.push(due_date_from);
    paramCount++;
  }

  if (due_date_to) {
    conditions.push(`i.due_date <= $${paramCount}`);
    params.push(due_date_to);
    paramCount++;
  }

  // Invoice number filter (case-insensitive partial match)
  if (invoice_number) {
    conditions.push(`i.invoice_number ILIKE $${paramCount}`);
    params.push(`%${invoice_number}%`);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN orderers o ON i.orderer_id = o.id
    ${whereClause}
  `,
    params,
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
      ARRAY_AGG(DISTINCT ir.record_id) FILTER (WHERE ir.record_id IS NOT NULL) as record_ids,
      COUNT(DISTINCT rt.id) as total_test_count
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
    params,
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
    [invoiceId],
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
    rt.test_id,
    rt.id as record_test_id,
    t.title as test_title,
    t.code as test_code,
    st.title as standard_title,
    tr.result_value,
    tr.declaration_of_conformity
  FROM invoice_records ir
  JOIN records r ON ir.record_id = r.id
  JOIN record_tests rt ON r.id = rt.record_id
  JOIN tests t ON rt.test_id = t.id
  LEFT JOIN standards st ON rt.standard_id = st.id
  JOIN samples s ON r.sample_id = s.id
  LEFT JOIN LATERAL (
    SELECT result_value, declaration_of_conformity
    FROM test_results
    WHERE record_test_id = rt.id
    ORDER BY test_date DESC, created_at DESC
    LIMIT 1
  ) tr ON true
  WHERE ir.invoice_id = $1
  ORDER BY r.record_number, rt.id
`,
    [invoiceId],
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
    [invoiceId],
  );

  invoice.payments = paymentsResult.rows;

  return invoice;
}

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
    [`%${trimmed}%`],
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
    [customerId],
  );

  return result.rows;
}
