const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users for admin');
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/admin/invoices
// @access  Private/Admin
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('provider', 'name email')
      .populate('purchaser', 'name email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalPurchasers = await User.countDocuments({ role: 'purchaser' });
    const totalInvoices = await Invoice.countDocuments();
    const totalPaidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const totalPendingInvoices = await Invoice.countDocuments({ status: 'pending' });
    const totalOverdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

    const paidInvoices = await Invoice.find({ status: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      users: {
        total: totalUsers,
        providers: totalProviders,
        purchasers: totalPurchasers,
      },
      invoices: {
        total: totalInvoices,
        paid: totalPaidInvoices,
        pending: totalPendingInvoices,
        overdue: totalOverdueInvoices,
      },
      revenue: totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status (active/inactive)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;
    
    console.log(`Updating user ${userId} status to ${status}`);
    
    const user = await User.findById(userId);

    if (user) {
      user.status = status;
      await user.save();
      console.log(`User ${userId} status updated to ${status}`);
      res.status(200).json({ message: `User status successfully updated to ${status}.` });
    } else {
      console.log(`User ${userId} not found`);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Attempting to delete user ${userId}`);
    
    const user = await User.findById(userId);

    if (user) {
      // Use findByIdAndDelete instead of deprecated remove()
      await User.findByIdAndDelete(userId);
      console.log(`User ${userId} deleted successfully`);
      res.status(200).json({ message: 'User successfully deleted.' });
    } else {
      console.log(`User ${userId} not found`);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
const getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all the controller functions
module.exports = {
  getAllUsers,
  getAllInvoices,
  getSystemStats,
  updateUserStatus,
  deleteUser,
  getActivityLog,
};