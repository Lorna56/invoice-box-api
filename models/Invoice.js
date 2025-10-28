const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purchaser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      description: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['UGX', 'USD', 'LYD'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'defaulted'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Invoice', invoiceSchema);