const express = require('express');
const {
  getAllUsers,
  getAllInvoices,
  getSystemStats,
} = require('../controllers/adminController');
const { admin } = require('../middleware/admin');
const { getActivityLog } = require('../controllers/adminController'); // <-- Import

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(admin);

router.route('/users').get(getAllUsers);
router.route('/invoices').get(getAllInvoices);
router.route('/stats').get(getSystemStats);
router.route('/activity').get(getActivityLog); // <-- Add new route

module.exports = router;