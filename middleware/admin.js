const { protect } = require('./auth');

const admin = (req, res, next) => {
  // First, ensure the user is authenticated
  protect(req, res, () => {
    // Then, check if the user's role is 'admin'
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  });
};

module.exports = { admin };