const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// Get all invoices for a user
const getInvoices = async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};
    
    if (role === 'provider') {
      query.provider = req.user._id;
    } else if (role === 'purchaser') {
      query.purchaser = req.user._id;
    }
    
    const invoices = await Invoice.find(query)
      .populate('provider', 'name email')
      .populate('purchaser', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('provider', 'name email')
      .populate('purchaser', 'name email');
    
    if (invoice) {
      // Check if user is authorized to view this invoice
      const { user } = req;
      if (
        invoice.provider._id.toString() === user._id.toString() ||
        invoice.purchaser._id.toString() === user._id.toString() ||
        user.role === 'admin' // <-- ADD THIS CHECK FOR ADMINS
      ) {
        res.json(invoice);
      } else {
        res.status(401).json({ message: 'Not authorized to view this invoice' });
      }
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Create a new invoice
const createInvoice = async (req, res) => {
  try {
    const {
      purchaser,
      items,
      currency,
      dueDate,
    } = req.body;
    
    // Calculate subtotal and total
    let subtotal = 0;
    const processedItems = items.map(item => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        ...item,
        total,
      };
    });
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = await Invoice.create({
      invoiceNumber,
      provider: req.user._id,
      purchaser,
      items: processedItems,
      subtotal,
      total: subtotal, // In a real app, you might add tax here
      currency,
      dueDate,
    });
    
   const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('provider', 'name email')
      .populate('purchaser', 'name email');
    
    res.status(201).json({
      message: 'Invoice created successfully!',
      invoice: populatedInvoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);
    
    if (invoice) {
      // Check if user is authorized to update this invoice
      if (
        invoice.provider.toString() === req.user._id.toString() ||
        invoice.purchaser.toString() === req.user._id.toString()
      ) {
        invoice.status = status;
        const updatedInvoice = await invoice.save();
        
        const populatedInvoice = await Invoice.findById(updatedInvoice._id)
          .populate('provider', 'name email')
          .populate('purchaser', 'name email');
        
        res.json(populatedInvoice);
      } else {
        res.status(401).json({ message: 'Not authorized to update this invoice' });
      }
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get payments for an invoice
const getInvoicePayments = async (req, res) => {
  try {
    const payments = await Payment.find({ invoice: req.params.id })
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  getInvoicePayments,
};