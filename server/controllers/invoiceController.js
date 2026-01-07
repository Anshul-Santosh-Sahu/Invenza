const Invoice = require('../model/invoiceModel.js');
const Product = require('../model/productModel.js');

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user_id: req.user.id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create Invoice
const createInvoice = async (req, res) => {
  const { 
    customer, 
    customerName, 
    items, 
    status, 
    totalAmount, 
    invoiceDate, 
    invoiceNumber,
    discount, // New
    tax,      // New
    notes     // New
  } = req.body;
  
  try {
    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Please provide customer and items' });
    }

    let processedItems = [];
    
    // 1. Process items & Reduce Stock
    for (const item of items) {
      const product = await Product.findById(item.product); 
      if (!product) {
        return res.status(404).json({ message: `Product with id ${item.product} not found` });
      }
      
      // --- FIX: Check if enough stock exists ---
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` });
      }

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price, 
      });
    }
    
    // 2. Create Invoice
    const invoice = new Invoice({
      user_id: req.user.id,
      customer,
      customerName,
      items: processedItems,
      totalAmount,
      status,
      invoiceDate,
      invoiceNumber,
      discount: discount || 0,
      tax: tax || 0,
      notes: notes || ''
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);

  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete Invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    
    if (invoice) {
      res.status(200).json({ message: 'Invoice removed' });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update Invoice (Basic implementation)
const updateInvoice = async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            req.body,
            { new: true }
        );
        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
}

module.exports = {
  getInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoice
};