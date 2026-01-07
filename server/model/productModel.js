const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  sku: { 
    type: String,
    required: [true, 'SKU is required'],
    // We check uniqueness per user in controller now, 
    // or keep sparse unique index if you want strict db rules
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    default: 0,
    required: [true, 'Quantity is required']
  },
  // --- NEW FIELDS ---
  category: { type: String, default: '' },
  supplier: { type: String, default: '' },
  description: { type: String, default: '' }
}, {
  timestamps: true,
});

// Ensure SKU is unique *per user* (compound index)
productSchema.index({ user_id: 1, sku: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;