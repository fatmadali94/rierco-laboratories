import customersModel from "../models/customersModel.js";

// ==================== CUSTOMERS ====================

/**
 * Create a new customer
 * POST /api/v1/materials-lab/customers
 */
export const createCustomer = async (req, res) => {
  try {
    const customerData = {
      name: req.body.name,
      company_phone: req.body.company_phone || null,
      company_email: req.body.company_email || null,
      address: req.body.address || null,
      tax_id: req.body.tax_id || null,
    };

    if (!customerData.name) {
      return res.status(400).json({
        success: false,
        error: "Customer name is required",
      });
    }

    const customer = await customersModel.createCustomer(customerData);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all customers with pagination
 * GET /api/v1/materials-lab/customers
 */
export const getAllCustomers = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search || null,
    };

    const result = await customersModel.getAllCustomers(filters);

    res.json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get customer by ID with full details
 * GET /api/v1/materials-lab/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = await customersModel.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error getting customer:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update customer
 * PUT /api/v1/materials-lab/customers/:id
 */
export const updateCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const updates = {
      name: req.body.name !== undefined ? req.body.name : undefined,
      company_phone:
        req.body.company_phone !== undefined
          ? req.body.company_phone
          : undefined,
      company_email:
        req.body.company_email !== undefined
          ? req.body.company_email
          : undefined,
      address: req.body.address !== undefined ? req.body.address : undefined,
      tax_id: req.body.tax_id !== undefined ? req.body.tax_id : undefined,
    };

    const customer = await customersModel.updateCustomer(customerId, updates);

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete customer
 * DELETE /api/v1/materials-lab/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const result = await customersModel.deleteCustomer(customerId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search customers by name, email, or phone
 * GET /api/v1/materials-lab/customers/search/:searchTerm
 */
export const searchCustomers = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm || "";
    const customers = await customersModel.searchCustomers(searchTerm);

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==================== ORDERERS ====================

/**
 * Create a new orderer
 * POST /api/v1/materials-lab/orderers
 */
export const createOrderer = async (req, res) => {
  try {
    const ordererData = {
      customer_id: req.body.customer_id ? parseInt(req.body.customer_id) : null,
      full_name: req.body.full_name,
      mobile: req.body.mobile || null,
      email: req.body.email || null,
      national_id: req.body.national_id || null,
      // Add customer object for creating new customer
      customer: req.body.customer
        ? {
            name: req.body.customer.name,
            company_phone: req.body.customer.company_phone || null,
            company_email: req.body.customer.company_email || null,
            address: req.body.customer.address || null,
            tax_id: req.body.customer.tax_id || null,
          }
        : null,
    };

    if (!ordererData.full_name) {
      return res.status(400).json({
        success: false,
        error: "Orderer full name is required",
      });
    }

    const orderer = await customersModel.createOrderer(ordererData);

    res.status(201).json({
      success: true,
      message: "Orderer created successfully",
      data: orderer,
    });
  } catch (error) {
    console.error("Error creating orderer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllOrderers = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search || null,
    };

    const result = await customersModel.getAllOrderers(filters);

    res.json({
      success: true,
      data: result.orderers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error getting Orderers:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all orderers for a customer
 * GET /api/v1/materials-lab/orderers/customer/:customerId
 */
export const getOrderersByCustomer = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const orderers = await customersModel.getOrderersByCustomer(customerId);

    res.json({
      success: true,
      data: orderers,
    });
  } catch (error) {
    console.error("Error getting orderers by customer:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get orderer by ID
 * GET /api/v1/materials-lab/orderers/:id
 */
export const getOrdererById = async (req, res) => {
  try {
    const ordererId = parseInt(req.params.id);
    const orderer = await customersModel.getOrdererById(ordererId);

    if (!orderer) {
      return res.status(404).json({
        success: false,
        error: "Orderer not found",
      });
    }

    res.json({
      success: true,
      data: orderer,
    });
  } catch (error) {
    console.error("Error getting orderer:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update orderer
 * PUT /api/v1/materials-lab/orderers/:id
 */
export const updateOrderer = async (req, res) => {
  try {
    const ordererId = parseInt(req.params.id);
    const updates = {
      customer_id:
        req.body.customer_id !== undefined
          ? parseInt(req.body.customer_id)
          : undefined,
      full_name:
        req.body.full_name !== undefined ? req.body.full_name : undefined,
      mobile: req.body.mobile !== undefined ? req.body.mobile : undefined,
      email: req.body.email !== undefined ? req.body.email : undefined,
      national_id:
        req.body.national_id !== undefined ? req.body.national_id : undefined,
    };

    const orderer = await customersModel.updateOrderer(ordererId, updates);

    res.json({
      success: true,
      message: "Orderer updated successfully",
      data: orderer,
    });
  } catch (error) {
    console.error("Error updating orderer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete orderer
 * DELETE /api/v1/materials-lab/orderers/:id
 */
export const deleteOrderer = async (req, res) => {
  try {
    const ordererId = parseInt(req.params.id);
    const result = await customersModel.deleteOrderer(ordererId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting orderer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search orderers by name, mobile, or email
 * GET /api/v1/materials-lab/orderers/search/:searchTerm
 */
export const searchOrderers = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm || "";
    const orderers = await customersModel.searchOrderers(searchTerm);

    res.json({
      success: true,
      data: orderers,
    });
  } catch (error) {
    console.error("Error searching orderers:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
