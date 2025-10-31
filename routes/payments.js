const express = require('express');
const { createPayment, getUserPayments, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getUserPayments).post(protect, createPayment);
router.route('/my').get(protect, getMyPayments); // <-- Add new route

module.exports = router;