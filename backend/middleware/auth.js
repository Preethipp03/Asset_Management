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
    next();
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

// Ownership check: user can access own data or admin/super_admin can access
const isSelfOrAdmin = (req, res, next) => {
  const userId = req.user.id.toString();
  const paramId = req.params.id.toString();
  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

  console.log('isSelfOrAdmin check:', { userId, paramId, userRole: req.user.role, isAdmin });

  if (userId === paramId || isAdmin) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied' });
};

module.exports = { authMiddleware, roleMiddleware, isSelfOrAdmin };
