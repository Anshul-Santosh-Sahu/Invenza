const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  // --- NEW FIELDS ---
  type: {
    type: String,
    enum: ['Individual', 'Business'],
    default: 'Individual',
  },
  gstin: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;