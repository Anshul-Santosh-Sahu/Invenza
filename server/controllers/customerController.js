const Customer = require('../model/customerModel.js');

// @desc    Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new customer
const createCustomer = async (req, res) => {
  // Add type and gstin to destructuring
  const { name, email, phone, address, type, gstin } = req.body;
  
  try {
    const customer = new Customer({
      user_id: req.user.id,
      name,
      email,
      phone,
      address,
      type: type || 'Individual', // Default to Individual
      gstin: gstin || ''         // Default empty
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create customer', error: error.message });
  }
};

// @desc    Update a customer
const updateCustomer = async (req, res) => {
  const { name, email, phone, address, type, gstin } = req.body;
  
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user_id: req.user.id });

    if (customer) {
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.phone = phone || customer.phone;
      customer.address = address || customer.address;
      customer.type = type || customer.type;
      customer.gstin = gstin || customer.gstin;

      const updatedCustomer = await customer.save();
      res.status(200).json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (customer) {
      res.status(200).json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};