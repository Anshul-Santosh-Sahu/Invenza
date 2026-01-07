const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer',
  },
  customerName: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  // --- NEW FIELDS ---
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  invoiceDate: { type: Date, default: Date.now },
  invoiceNumber: { type: String } // Added to store friendly ID (INV-123)
}, {
  timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;