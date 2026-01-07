const Product = require('../model/productModel.js');

// Create or Update (Restock) a product
// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, sku, price, quantity, category, supplier, description } = req.body;

    if (!name || !sku || !price) {
      return res.status(400).json({ message: 'Missing required fields: name, sku, price' });
    }

    // 1. Check if product exists for this user
    let existingProduct = await Product.findOne({ sku, user_id });

    if (existingProduct) {
      // 2. RESTOCK LOGIC: If exists, just add quantity and update details
      existingProduct.quantity += parseInt(quantity) || 0;
      existingProduct.price = price; // Update price to latest
      if(category) existingProduct.category = category;
      if(supplier) existingProduct.supplier = supplier;
      if(description) existingProduct.description = description;
      
      const updatedProduct = await existingProduct.save();
      return res.status(200).json(updatedProduct);
    }

    // 3. CREATE LOGIC: If new, create it
    const newProduct = new Product({
      user_id,
      name,
      sku,
      price,
      quantity: parseInt(quantity) || 0,
      category,
      supplier,
      description
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Update a product (Direct Edit)
exports.updateProduct = async (req, res) => {
  try {
    delete req.body.user_id; // Prevent changing owner
    
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};