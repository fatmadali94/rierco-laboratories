// controllers/customersController.js
import {
  getAllCustomers,
  searchCustomersByName,
  addCustomerIfNotExists
} from '../../models/tire_data_model/customersModel.js';

// GET /api/customers
export const fetchCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// GET /api/customers/search?query=...
export const searchCustomers = async (req, res) => {
  try {
    const query = req.query.query || '';
    const customers = await searchCustomersByName(query);
    res.json(customers);
  } catch (err) {
    console.error('Error searching customers:', err);
    res.status(500).json({ message: 'Error searching customers' });
  }
};

// POST /api/customers
export const createCustomer = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const Customer = await addCustomerIfNotExists(name);
    res.status(201).json(Customer);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ message: 'Error creating customer' });
  }
};
