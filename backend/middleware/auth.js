// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Authorization header missing or malformed');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user) {
    console.log('Role middleware: No user found on request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!roles.includes(req.user.role)) {
    console.log(`Forbidden: User role (${req.user.role}) not in allowed roles: ${roles.join(', ')}`);
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

  console.log('Access denied: user is not owner or admin');
  return res.status(403).json({ error: 'Access denied' });
};

module.exports = { authMiddleware, roleMiddleware, isSelfOrAdmin };
