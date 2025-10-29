const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const ActivityLog = require('../models/ActivityLog');
require('dotenv').config();

// Generate a JWT for a given user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || '0.0.0.0'; // Get user's IP address

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      // Log the login activity to the database
      await ActivityLog.create({
        user: user._id,
        action: 'login',
        ipAddress: ipAddress,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if the user exists or not
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been generated.' });
    }

    // Invalidate any existing tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // Generate the token directly in the controller
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Create the new token document with the pre-generated token
    await PasswordResetToken.create({
      user: user._id,
      token: resetToken,
      expiresAt: Date.now() + 10 * 60 * 1000, // Token expires in 10 minutes
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // THIS IS THE KEY PART FOR OUR DEMO
    console.log('===== PASSWORD RESET LINK =====');
    console.log(`Copy and paste this link in your browser: ${resetUrl}`);
    console.log('==============================');

    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been generated.',
      resetLink: resetUrl // Return the link in the response for the frontend to display
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const resetTokenDoc = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: Date.now() }, // Check if token is not expired
    }).populate('user');

    if (!resetTokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password and save it
    resetTokenDoc.user.password = newPassword;
    await resetTokenDoc.user.save();

    // Delete the token after use
    await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
};

// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');
// const PasswordResetToken = require('../models/PasswordResetToken');
// const ActivityLog = require('../models/ActivityLog'); // <-- THIS WAS MISSING
// require('dotenv').config();

// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

// // Register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//     });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const ipAddress = req.ip;

//     const user = await User.findOne({ email });
//     if (user && (await user.comparePassword(password))) {
//       // Log the login activity
//       await ActivityLog.create({
//         user: user._id,
//         action: 'login',
//         ipAddress: ipAddress,
//       });

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (user) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Request password reset
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been generated.' });
//     }

//     await PasswordResetToken.deleteMany({ user: user._id });

//     const resetToken = new PasswordResetToken({
//       user: user._id,
//       expiresAt: Date.now() + 10 * 60 * 1000,
//     });

//     await resetToken.save();

//     const resetUrl = `http://localhost:3000/reset-password?token=${resetToken.token}`;
    
//     console.log('===== PASSWORD RESET LINK =====');
//     console.log(`Copy and paste this link in your browser: ${resetUrl}`);
//     console.log('==============================');

//     res.status(200).json({ 
//       message: 'If an account with that email exists, a password reset link has been generated.',
//       resetLink: resetUrl
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Reset password with token
// const resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     const resetToken = await PasswordResetToken.findOne({
//       token,
//       expiresAt: { $gt: Date.now() },
//     }).populate('user');

//     if (!resetToken) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     resetToken.user.password = newPassword;
//     await resetToken.user.save();

//     await PasswordResetToken.deleteOne({ _id: resetToken._id });

//     res.status(200).json({ message: 'Password has been reset successfully' });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile,
//   forgotPassword,
//   resetPassword,
// };

// const User = require('../models/User');
// const PasswordResetToken = require('../models/PasswordResetToken');

// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

// // Register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//     });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const ipAddress = req.ip;

//     const user = await User.findOne({ email });
//     if (user && (await user.comparePassword(password))) {
//       // Log the login activity
//       await ActivityLog.create({
//         user: user._id,
//         action: 'login',
//         ipAddress: ipAddress,
//       });

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (user) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Request password reset
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been generated.' });
//     }

//     await PasswordResetToken.deleteMany({ user: user._id });

//     const resetToken = new PasswordResetToken({
//       user: user._id,
//       expiresAt: Date.now() + 10 * 60 * 1000,
//     });

//     await resetToken.save();

//     const resetUrl = `http://localhost:3000/reset-password?token=${resetToken.token}`;
    
//     console.log('===== PASSWORD RESET LINK =====');
//     console.log(`Copy and paste this link in your browser: ${resetUrl}`);
//     console.log('==============================');

//     res.status(200).json({ 
//       message: 'If an account with that email exists, a password reset link has been generated.',
//       resetLink: resetUrl
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Reset password with token
// const resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     const resetToken = await PasswordResetToken.findOne({
//       token,
//       expiresAt: { $gt: Date.now() },
//     }).populate('user');

//     if (!resetToken) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     resetToken.user.password = newPassword;
//     await resetToken.user.save();

//     await PasswordResetToken.deleteOne({ _id: resetToken._id });

//     res.status(200).json({ message: 'Password has been reset successfully' });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile,
//   forgotPassword,
//   resetPassword,
// };

// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// // ... (keep other imports)
// const ActivityLog = require('../models/ActivityLog'); // <-- Import the model
// const PasswordResetToken = require('../models/PasswordResetToken'); // <-- Import the new model


// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

// // Register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//     });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// // ... (keep other imports)


// // Login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const ipAddress = req.ip; // Get user's IP address

//     const user = await User.findOne({ email });
//     if (user && (await user.comparePassword(password))) {
//       // Log the login activity
//       await ActivityLog.create({
//         user: user._id,
//         action: 'login',
//         ipAddress: ipAddress,
//       });

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ... (export loginUser)

// // Login user
// // const loginUser = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     // Check for user email
// //     const user = await User.findOne({ email });
// //     if (user && (await user.comparePassword(password))) {
// //       res.json({
// //         _id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         token: generateToken(user._id),
// //       });
// //     } else {
// //       res.status(401).json({ message: 'Invalid email or password' });
// //     }
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (user) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been generated.' });
//     }

//     await PasswordResetToken.deleteMany({ user: user._id });

//     const resetToken = new PasswordResetToken({
//       user: user._id,
//       expiresAt: Date.now() + 10 * 60 * 1000,
//     });

//     await resetToken.save();

//     const resetUrl = `http://localhost:3000/reset-password?token=${resetToken.token}`;
    
//     // FOR DEVELOPMENT ONLY: Log to console AND return in response
//     console.log('===== PASSWORD RESET LINK =====');
//     console.log(`Copy and paste this link in your browser: ${resetUrl}`);
//     console.log('==============================');

//     // Return the link in the response for the frontend to display
//     res.status(200).json({ 
//       message: 'If an account with that email exists, a password reset link has been generated.',
//       resetLink: resetUrl // <-- ADD THIS
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile,
//   forgotPassword, // <-- Export new functions
//   resetPassword,
// };