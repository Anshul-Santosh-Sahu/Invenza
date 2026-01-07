const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoice // <--- 1. Import this function
} = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .put(updateInvoice)    // <--- 2. Add this PUT route
  .delete(deleteInvoice);

module.exports = router;