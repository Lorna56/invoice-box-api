const express = require('express');
const { getUsers, getUsersByRole } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/role/:role').get(protect, getUsersByRole);

module.exports = router;