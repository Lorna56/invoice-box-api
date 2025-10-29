const express = require('express');
const { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);

module.exports = router;
// const express = require('express');
// const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.post('/forgot-password', forgotPassword); // <-- Add new route
// router.post('/reset-password', resetPassword); // <-- Add new route
// router.get('/profile', protect, getUserProfile);

// module.exports = router;