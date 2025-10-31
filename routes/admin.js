const express = require('express');
const {
  getAllUsers,
  getAllInvoices,
  getSystemStats,
  updateUserStatus,
  deleteUser,
  getActivityLog
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/admin');

const router = express.Router();

// Apply both protect and admin middleware to all routes
router.use(protect);
router.use(admin);

// Get all users
router.get('/users', getAllUsers);

// Update user status
router.put('/users/:id', updateUserStatus);

// Delete user
router.delete('/users/:id', deleteUser);

// Get all invoices
router.get('/invoices', getAllInvoices);

// Get system stats
router.get('/stats', getSystemStats);

// Get activity logs
router.get('/activity', getActivityLog);

module.exports = router;