const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById // Assuming you might need this, adding it just in case or removing if not in controller
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  // Remove getProductById if not implemented in controller, but usually good to have
  //.get(getProductById) 
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;