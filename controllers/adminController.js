// const User = require('../models/User');
// const Invoice = require('../models/Invoice');
// const Payment = require('../models/Payment');
// const ActivityLog = require('../models/ActivityLog'); // <-- Import the mode

// // @desc    Get all users
// // @route   GET /api/admin/users
// // @access  Private/Admin
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({}).select('-password').sort({ createdAt: -1 });
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get all invoices
// // @route   GET /api/admin/invoices
// // @access  Private/Admin
// const getAllInvoices = async (req, res) => {
//   try {
//     const invoices = await Invoice.find({})
//       .populate('provider', 'name email')
//       .populate('purchaser', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(invoices);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Get system-wide stats
// // @route   GET /api/admin/stats
// // @access  Private/Admin
// const getActivityLog = async (req, res) => {
//   try {
//     const logs = await ActivityLog.find({})
//       .populate('user', 'name email role')
//       .sort({ timestamp: -1 })
//       .limit(100); // Get the latest 100 activities
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// const getSystemStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalProviders = await User.countDocuments({ role: 'provider' });
//     const totalPurchasers = await User.countDocuments({ role: 'purchaser' });
//     const totalInvoices = await Invoice.countDocuments();
//     const totalPaidInvoices = await Invoice.countDocuments({ status: 'paid' });
//     const totalPendingInvoices = await Invoice.countDocuments({ status: 'pending' });
//     const totalOverdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

//     // Calculate total revenue from paid invoices
//     const paidInvoices = await Invoice.find({ status: 'paid' });
//     const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

//     res.json({
//       users: {
//         total: totalUsers,
//         providers: totalProviders,
//         purchasers: totalPurchasers,
//       },
//       invoices: {
//         total: totalInvoices,
//         paid: totalPaidInvoices,
//         pending: totalPendingInvoices,
//         overdue: totalOverdueInvoices,
//       },
//       revenue: totalRevenue,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getAllUsers,
//   getAllInvoices,
//   getSystemStats,
//   createUser,
//   updateUserStatus,
//   deleteUser,
//   getActivityLog, // <-- Export the new function
// };
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
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
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ message: `User status updated to ${status}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
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