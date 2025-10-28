const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { invoice, amount, method, notes } = req.body;
    
    // Check if invoice exists
    const invoiceExists = await Invoice.findById(invoice);
    if (!invoiceExists) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if user is authorized to make payment for this invoice
    if (invoiceExists.purchaser.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to make payment for this invoice' });
    }
    
    const payment = await Payment.create({
      invoice,
      amount,
      method,
      notes,
    });
    
    // Update invoice status if fully paid
    const totalPayments = await Payment.find({ invoice });
    const totalPaid = totalPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalPaid >= invoiceExists.total) {
      invoiceExists.status = 'paid';
      await invoiceExists.save();
    }
    
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all payments for a user
const getUserPayments = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Get all invoices for the user
    let invoiceQuery = {};
    if (role === 'provider') {
      invoiceQuery.provider = req.user._id;
    } else if (role === 'purchaser') {
      invoiceQuery.purchaser = req.user._id;
    }
    
    const invoices = await Invoice.find(invoiceQuery).select('_id');
    const invoiceIds = invoices.map(inv => inv._id);
    
    // Get all payments for those invoices
    const payments = await Payment.find({ invoice: { $in: invoiceIds } })
      .populate({
        path: 'invoice',
        populate: [
          { path: 'provider', select: 'name email' },
          { path: 'purchaser', select: 'name email' }
        ]
      })
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getUserPayments,
};