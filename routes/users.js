const express = require('express');
const { getUsers, getUsersByRole } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { updateUserProfile, deleteUserAccount } = require('../controllers/userController'); // <-- Import

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/role/:role').get(protect, getUsersByRole);
router.route('/profile').put(updateUserProfile).delete(deleteUserAccount); // <-- Add routes

module.exports = router;