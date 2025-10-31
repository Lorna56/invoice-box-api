const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.user._id);
    
    const { name, email } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!name && !email) {
      return res.status(400).json({ message: 'At least name or email must be provided' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user:', { _id: user._id, name: user.name, email: user.email });
    
    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      console.log('Email change detected, checking for duplicates');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already in use by:', existingUser._id);
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Update user fields
    const oldData = { name: user.name, email: user.email };
    if (name) user.name = name;
    if (email) user.email = email;
    
    console.log('Updating user from:', oldData, 'to:', { name: user.name, email: user.email });
    
    // Save the updated user
    const updatedUser = await user.save();
    console.log('User saved successfully');
    
    // Return success response with updated user data (without password)
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    };
    
    console.log('Returning updated user:', userResponse);
    res.status(200).json({ 
      message: 'Profile updated successfully!', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', errors);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle duplicate key error (for email)
    if (error.code === 11000) {
      console.log('Duplicate key error:', error);
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    console.log('=== DELETE ACCOUNT REQUEST ===');
    console.log('User ID from token:', req.user._id);
    
    const userId = req.user._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user to delete:', { _id: user._id, name: user.name, email: user.email, role: user.role });
    
    // Check if user has any unpaid invoices (for purchasers)
    if (user.role === 'purchaser') {
      console.log('Checking for unpaid invoices for purchaser');
      const unpaidInvoices = await Invoice.find({
        purchaser: userId,
        status: { $in: ['pending', 'overdue'] }
      });
      
      if (unpaidInvoices.length > 0) {
        console.log('Found unpaid invoices:', unpaidInvoices.map(inv => inv._id));
        return res.status(400).json({ 
          message: 'Cannot delete account with unpaid invoices. Please pay all invoices before deleting your account.' 
        });
      }
    }
    
    // Check if user has any pending invoices (for providers)
    if (user.role === 'provider') {
      console.log('Checking for pending invoices for provider');
      const pendingInvoices = await Invoice.find({
        provider: userId,
        status: { $in: ['pending', 'overdue'] }
      });
      
      if (pendingInvoices.length > 0) {
        console.log('Found pending invoices:', pendingInvoices.map(inv => inv._id));
        return res.status(400).json({ 
          message: 'Cannot delete account with pending invoices. Please wait for all invoices to be paid or marked as defaulted before deleting your account.' 
        });
      }
    }
    
    // Get all invoices associated with the user
    console.log('Finding all invoices associated with user');
    const userInvoices = await Invoice.find({
      $or: [
        { provider: userId },
        { purchaser: userId }
      ]
    }).select('_id');
    
    const invoiceIds = userInvoices.map(invoice => invoice._id);
    console.log('Found invoices to delete:', invoiceIds);
    
    // Delete all payments associated with those invoices
    if (invoiceIds.length > 0) {
      console.log('Deleting payments for invoices');
      const paymentDeleteResult = await Payment.deleteMany({
        invoice: { $in: invoiceIds }
      });
      console.log('Deleted payments:', paymentDeleteResult.deletedCount, 'documents');
    }
    
    // Delete all invoices associated with the user
    console.log('Deleting invoices');
    const invoiceDeleteResult = await Invoice.deleteMany({
      $or: [
        { provider: userId },
        { purchaser: userId }
      ]
    });
    console.log('Deleted invoices:', invoiceDeleteResult.deletedCount, 'documents');
    
    // Delete the user
    console.log('Deleting user');
    const userDeleteResult = await User.findByIdAndDelete(userId);
    console.log('Deleted user:', userDeleteResult._id);
    
    console.log('=== ACCOUNT DELETED SUCCESSFULLY ===');
    res.status(200).json({ message: 'Your account has been successfully deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUsersByRole,
  updateUserProfile,
  deleteUserAccount,
};