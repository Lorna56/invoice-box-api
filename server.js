const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

// ---------------------------
// CORS Configuration
// ---------------------------
const allowedOrigins = [
  'http://localhost:3000',       // Local dev
  'https://lorna56.github.io'    // Deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ---------------------------
// Test route
// ---------------------------
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date(),
    origin: req.get('origin') || 'No origin'
  });
});

// ---------------------------
// MongoDB Connection
// ---------------------------
const MONGODB_URI = process.env.MONGODB_URI || '';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

// ---------------------------
// API Routes
// ---------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ---------------------------
// Error Handling Middleware
// ---------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy error: origin not allowed' });
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

