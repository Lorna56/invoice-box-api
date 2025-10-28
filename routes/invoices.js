const express = require('express');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  getInvoicePayments,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getInvoices).post(protect, createInvoice);
router.route('/:id').get(protect, getInvoiceById).put(protect, updateInvoiceStatus);
router.route('/:id/payments').get(protect, getInvoicePayments);

module.exports = router;