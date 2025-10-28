const express = require('express');
const { createPayment, getUserPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getUserPayments).post(protect, createPayment);

module.exports = router;