const express = require('express');
const { getUsers, getUsersByRole, updateUserProfile, deleteUserAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.route('/').get(protect, getUsers);

// Get users by role
router.route('/role/:role').get(protect, getUsersByRole);

// Profile routes with individual middleware
router.route('/profile')
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserAccount);

module.exports = router;