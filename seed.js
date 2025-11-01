const mongoose = require('mongoose');
const User = require('./models/User');
const Invoice = require('./models/Invoice');
const Payment = require('./models/Payment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});

    // Create providers
    const providers = await User.create([
      { name: 'John Provider', email: 'john@provider.com', password: 'password123', role: 'provider' },
      { name: 'Sarah Provider', email: 'sarah@provider.com', password: 'password123', role: 'provider' },
      { name: 'Mike Provider', email: 'mike@provider.com', password: 'password123', role: 'provider' },
      { name: 'Linda Provider', email: 'linda@provider.com', password: 'password123', role: 'provider' },
      { name: 'Tom Provider', email: 'tom@provider.com', password: 'password123', role: 'provider' },
      { name: 'Emma Provider', email: 'emma@provider.com', password: 'password123', role: 'provider' },
      { name: 'James Provider', email: 'james@provider.com', password: 'password123', role: 'provider' },
    ]);

    // Create purchasers
    const purchasers = await User.create([
      { name: 'Alice Purchaser', email: 'alice@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'Bob Purchaser', email: 'bob@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'Charlie Purchaser', email: 'charlie@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'Diana Purchaser', email: 'diana@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'Ethan Purchaser', email: 'ethan@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'Fiona Purchaser', email: 'fiona@purchaser.com', password: 'password123', role: 'purchaser' },
      { name: 'George Purchaser', email: 'george@purchaser.com', password: 'password123', role: 'purchaser' },
    ]);

    // Create admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@invoicebox.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin user created: admin@invoicebox.com / admin123');

    // Create invoices
    const invoices = await Invoice.insertMany([
      {
        invoiceNumber: 'INV-1001',
        provider: providers[0]._id,
        purchaser: purchasers[0]._id,
        items: [
          { description: 'Web Development Services', quantity: 40, unitPrice: 50, total: 2000 },
          { description: 'Hosting Services', quantity: 1, unitPrice: 100, total: 100 },
        ],
        subtotal: 2100,
        tax: 210,
        total: 2310,
        currency: 'USD',
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1002',
        provider: providers[1]._id,
        purchaser: purchasers[1]._id,
        items: [
          { description: 'Graphic Design', quantity: 10, unitPrice: 75, total: 750 },
        ],
        subtotal: 750,
        tax: 75,
        total: 825,
        currency: 'USD',
        status: 'paid',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1003',
        provider: providers[0]._id,
        purchaser: purchasers[2]._id,
        items: [
          { description: 'Mobile App Development', quantity: 80, unitPrice: 60, total: 4800 },
        ],
        subtotal: 4800,
        tax: 480,
        total: 5280,
        currency: 'USD',
        status: 'overdue',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1004',
        provider: providers[2]._id,
        purchaser: purchasers[0]._id,
        items: [
          { description: 'Consulting Services', quantity: 20, unitPrice: 150, total: 3000 },
        ],
        subtotal: 3000,
        tax: 300,
        total: 3300,
        currency: 'UGX',
        status: 'pending',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1005',
        provider: providers[1]._id,
        purchaser: purchasers[2]._id,
        items: [
          { description: 'Marketing Campaign', quantity: 1, unitPrice: 5000, total: 5000 },
        ],
        subtotal: 5000,
        tax: 500,
        total: 5500,
        currency: 'LYD',
        status: 'defaulted',
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1006',
        provider: providers[3]._id,
        purchaser: purchasers[3]._id,
        items: [
          { description: 'SEO Services', quantity: 15, unitPrice: 200, total: 3000 },
        ],
        subtotal: 3000,
        tax: 300,
        total: 3300,
        currency: 'USD',
        status: 'pending',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 'INV-1007',
        provider: providers[4]._id,
        purchaser: purchasers[4]._id,
        items: [
          { description: 'Photography Services', quantity: 5, unitPrice: 500, total: 2500 },
        ],
        subtotal: 2500,
        tax: 250,
        total: 2750,
        currency: 'USD',
        status: 'paid',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Create payments
    await Payment.insertMany([
      {
        invoice: invoices[1]._id,
        amount: 825,
        method: 'bank transfer',
        status: 'completed',
        paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        invoice: invoices[0]._id,
        amount: 1000,
        method: 'mobile money',
        status: 'completed',
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        invoice: invoices[6]._id,
        amount: 2750,
        method: 'bank transfer',
        status: 'completed',
        paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
