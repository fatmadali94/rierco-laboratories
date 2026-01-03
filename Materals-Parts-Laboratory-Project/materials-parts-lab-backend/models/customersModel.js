import { materialsPool as pool } from "../db.js";

/**
 * CUSTOMERS MANAGEMENT
 */

/**
 * Create a new customer
 */
async function createCustomer(data) {
  const result = await pool.query(
    `
    INSERT INTO customers (
      name,
      company_phone,
      company_email,
      address,
      tax_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [
      data.name,
      data.company_phone || null,
      data.company_email || null,
      data.address || null,
      data.tax_id || null,
    ]
  );

  return result.rows[0];
}

/**
 * Get all customers with pagination
 */
async function getAllCustomers(filters = {}) {
  const { page = 1, limit = 50, search = null } = filters;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (search) {
    conditions.push(
      `(c.name ILIKE $${paramCount} OR c.company_email ILIKE $${paramCount} OR c.company_phone ILIKE $${paramCount})`
    );
    params.push(`%${search}%`);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM customers c
    ${whereClause}
  `,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get customers
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      c.*,
      COUNT(DISTINCT s.id) as total_samples,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT i.id) as total_invoices
    FROM customers c
    LEFT JOIN samples s ON c.id = s.customer_id
    LEFT JOIN records r ON s.id = r.sample_id
    LEFT JOIN invoices i ON c.id = i.customer_id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.name
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    customers: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get customer by ID with full details
 */
async function getCustomerById(customerId) {
  const result = await pool.query(
    `
    SELECT 
      c.*,
      COUNT(DISTINCT s.id) as total_samples,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT i.id) as total_invoices,
      COALESCE(SUM(i.total_amount), 0) as total_invoiced,
      COALESCE(SUM(i.amount_paid), 0) as total_paid,
      COALESCE(SUM(i.amount_remaining), 0) as total_outstanding
    FROM customers c
    LEFT JOIN samples s ON c.id = s.customer_id
    LEFT JOIN records r ON s.id = r.sample_id
    LEFT JOIN invoices i ON c.id = i.customer_id
    WHERE c.id = $1
    GROUP BY c.id
  `,
    [customerId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const customer = result.rows[0];

  // Get orderers
  const orderersResult = await pool.query(
    `
    SELECT * FROM orderers
    WHERE customer_id = $1
    ORDER BY full_name
  `,
    [customerId]
  );

  customer.orderers = orderersResult.rows;

  return customer;
}

/**
 * Update customer
 */
async function updateCustomer(customerId, updates) {
  const updateFields = [];
  const updateValues = [];
  let valueCount = 1;

  const allowedFields = [
    "name",
    "company_phone",
    "company_email",
    "address",
    "tax_id",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${valueCount}`);
      updateValues.push(updates[field]);
      valueCount++;
    }
  }

  if (updateFields.length === 0) {
    return await getCustomerById(customerId);
  }

  updateValues.push(customerId);

  await pool.query(
    `
    UPDATE customers
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${valueCount}
  `,
    updateValues
  );

  return await getCustomerById(customerId);
}

/**
 * Delete customer (only if no associated records)
 */
async function deleteCustomer(customerId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if customer has any samples/records
    const hasRecords = await client.query(
      `
      SELECT COUNT(*) as count
      FROM samples
      WHERE customer_id = $1
    `,
      [customerId]
    );

    if (parseInt(hasRecords.rows[0].count) > 0) {
      throw new Error("Cannot delete customer with existing samples/records");
    }

    await client.query("DELETE FROM customers WHERE id = $1", [customerId]);

    await client.query("COMMIT");

    return { success: true, message: "Customer deleted successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Search customers by name, email, or phone
 */
async function searchCustomers(searchTerm) {
  const result = await pool.query(
    `
    SELECT 
      c.*,
      COUNT(DISTINCT s.id) as total_samples
    FROM customers c
    LEFT JOIN samples s ON c.id = s.customer_id
    WHERE c.name ILIKE $1 
       OR c.company_email ILIKE $1 
       OR c.company_phone ILIKE $1
    GROUP BY c.id
    ORDER BY c.name
    LIMIT 20
  `,
    [`%${searchTerm}%`]
  );

  return result.rows;
}

/**
 * ORDERERS MANAGEMENT
 */

/**
 * Create a new orderer
 */
async function createOrderer(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let customerId = null;

    // Handle customer - either use existing or create new
    if (data.customer) {
      if (data.customer_id) {
        // Use existing customer by ID
        customerId = data.customer_id;
      } else if (data.customer.name) {
        // Create new customer
        const customerResult = await client.query(
          `
          INSERT INTO customers (name, company_phone, company_email, address, tax_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
          [
            data.customer.name,
            data.customer.company_phone || null,
            data.customer.company_email || null,
            data.customer.address || null,
            data.customer.tax_id || null,
          ]
        );
        customerId = customerResult.rows[0].id;
      }
    }

    // Create orderer
    const ordererResult = await client.query(
      `
      INSERT INTO orderers (
        customer_id,
        full_name,
        mobile,
        email,
        national_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        customerId, // Can be null
        data.full_name,
        data.mobile || null,
        data.email || null,
        data.national_id || null,
      ]
    );

    await client.query("COMMIT");

    return ordererResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
/**
 * Get all orderers for a customer
 */

/**
 * Get all orderers with pagination
 */
async function getAllOrderers(filters = {}) {
  const { page = 1, limit = 50, search = null } = filters;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (search) {
    conditions.push(
      `(o.full_name ILIKE $${paramCount} OR o.email ILIKE $${paramCount} OR o.mobile ILIKE $${paramCount})`
    );
    params.push(`%${search}%`);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM orderers o
    ${whereClause}
  `,
    params
  );
  const total = parseInt(countResult.rows[0].total);

  // Get orderers with customer data
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      o.*,
      c.id as customer_id,
      c.name as customer_name,
      c.company_email as customer_email,
      c.company_phone as customer_phone,
      COUNT(DISTINCT s.id) as total_samples,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT i.id) as total_invoices
    FROM orderers o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN samples s ON o.id = s.orderer_id
    LEFT JOIN records r ON s.id = r.sample_id
    LEFT JOIN invoices i ON o.id = i.orderer_id
    ${whereClause}
    GROUP BY o.id, c.id, c.name, c.company_email, c.company_phone
    ORDER BY o.full_name
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    orderers: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getOrderersByCustomer(customerId) {
  const result = await pool.query(
    `
    SELECT 
      o.*,
      COUNT(DISTINCT s.id) as total_samples
    FROM orderers o
    LEFT JOIN samples s ON o.id = s.orderer_id
    WHERE o.customer_id = $1
    GROUP BY o.id
    ORDER BY o.full_name
  `,
    [customerId]
  );

  return result.rows;
}

/**
 * Get orderer by ID
 */
async function getOrdererById(ordererId) {
  const result = await pool.query(
    `
    SELECT 
      o.*,
      c.name as customer_name,
      COUNT(DISTINCT s.id) as total_samples
    FROM orderers o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN samples s ON o.id = s.orderer_id
    WHERE o.id = $1
    GROUP BY o.id, c.name
  `,
    [ordererId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update orderer
 */
async function updateOrderer(ordererId, updates) {
  const updateFields = [];
  const updateValues = [];
  let valueCount = 1;

  const allowedFields = [
    "customer_id",
    "full_name",
    "mobile",
    "email",
    "national_id",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${valueCount}`);
      updateValues.push(updates[field]);
      valueCount++;
    }
  }

  if (updateFields.length === 0) {
    return await getOrdererById(ordererId);
  }

  updateValues.push(ordererId);

  await pool.query(
    `
    UPDATE orderers
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${valueCount}
  `,
    updateValues
  );

  return await getOrdererById(ordererId);
}

/**
 * Delete orderer (only if no associated samples)
 */
async function deleteOrderer(ordererId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if orderer has any samples
    const hasSamples = await client.query(
      `
      SELECT COUNT(*) as count
      FROM samples
      WHERE orderer_id = $1
    `,
      [ordererId]
    );

    if (parseInt(hasSamples.rows[0].count) > 0) {
      throw new Error("Cannot delete orderer with existing samples");
    }

    await client.query("DELETE FROM orderers WHERE id = $1", [ordererId]);

    await client.query("COMMIT");

    return { success: true, message: "Orderer deleted successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Search orderers by name, mobile, or email
 */
async function searchOrderers(searchTerm) {
  const result = await pool.query(
    `
    SELECT 
      o.*,
      c.name as customer_name,
      COUNT(DISTINCT s.id) as total_samples
    FROM orderers o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN samples s ON o.id = s.orderer_id
    WHERE o.full_name ILIKE $1 
       OR o.mobile ILIKE $1 
       OR o.email ILIKE $1
    GROUP BY o.id, c.name
    ORDER BY o.full_name
    LIMIT 20
  `,
    [`%${searchTerm}%`]
  );

  return result.rows;
}

/**
 * Get or create customer (for quick record creation)
 */
async function getOrCreateCustomer(data) {
  // Try to find existing customer by name and email
  let customer = null;

  if (data.company_email) {
    const result = await pool.query(
      "SELECT * FROM customers WHERE company_email = $1 LIMIT 1",
      [data.company_email]
    );
    if (result.rows.length > 0) {
      customer = result.rows[0];
    }
  }

  if (!customer && data.name) {
    const result = await pool.query(
      "SELECT * FROM customers WHERE name ILIKE $1 LIMIT 1",
      [data.name]
    );
    if (result.rows.length > 0) {
      customer = result.rows[0];
    }
  }

  // If not found, create new
  if (!customer) {
    customer = await createCustomer(data);
  }

  return customer;
}

/**
 * Get or create orderer (for quick record creation)
 */
async function getOrCreateOrderer(data, customerId) {
  if (!data || !data.full_name) {
    return null;
  }

  // Try to find existing orderer
  let orderer = null;

  if (data.mobile) {
    const result = await pool.query(
      "SELECT * FROM orderers WHERE mobile = $1 AND customer_id = $2 LIMIT 1",
      [data.mobile, customerId]
    );
    if (result.rows.length > 0) {
      orderer = result.rows[0];
    }
  }

  if (!orderer && data.email) {
    const result = await pool.query(
      "SELECT * FROM orderers WHERE email = $1 AND customer_id = $2 LIMIT 1",
      [data.email, customerId]
    );
    if (result.rows.length > 0) {
      orderer = result.rows[0];
    }
  }

  // If not found, create new
  if (!orderer) {
    orderer = await createOrderer({ ...data, customer_id: customerId });
  }

  return orderer;
}

export default {
  // Customers
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getOrCreateCustomer,

  // Orderers
  createOrderer,
  getAllOrderers,
  getOrderersByCustomer,
  getOrdererById,
  updateOrderer,
  deleteOrderer,
  searchOrderers,
  getOrCreateOrderer,
};
