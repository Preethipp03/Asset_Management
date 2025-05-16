// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();my
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};

// Optional ownership check (for /users/:id and own maintenance)
const isSelfOrAdmin = (req, res, next) => {
  const userId = req.params.id;
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
  if (req.user.id === userId || isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied' });
};

module.exports = { authMiddleware, roleMiddleware, isSelfOrAdmin };
