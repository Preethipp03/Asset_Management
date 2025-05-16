const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, ObjectId } = require('./db');
const { authMiddleware, roleMiddleware, isSelfOrAdmin } = require('./middleware/auth');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

const usersCollection = 'users';
const itemsCollection = 'items';

// =========================
// AUTH ROUTES
// =========================

// Get current logged-in user
app.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Current logged-in user',
    user: req.user
  });
});

// Public registration (usually users only)
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const validRoles = ['user'];  // Only allow 'user' role for public registration

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  // If role is passed, ignore or restrict to 'user' only
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role for registration' });
  }

  try {
    const db = await connectDB();
    const users = db.collection(usersCollection);

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await users.insertOne({ name, email, role: 'user', password: hashedPassword });

    res.status(201).json({ message: 'User registered', userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Login route (only one!)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const db = await connectDB();
    const users = db.collection(usersCollection);

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// =========================
// USER ROUTES
// =========================

// Create new user (admin and super_admin only)
app.post('/users', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { name, email, password, role } = req.body;
  const validRoles = ['super_admin', 'admin', 'user'];

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const db = await connectDB();
    const users = db.collection(usersCollection);

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await users.insertOne({ name, email, role, password: hashedPassword });

    res.status(201).json({ message: 'User created', userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

app.get('/users', authMiddleware, roleMiddleware(['super_admin']), async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection(usersCollection).find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.get('/users/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const user = await db.collection(usersCollection).findOne(query);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

app.put('/users/:id', authMiddleware, isSelfOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();

    // If password is updated, hash it
    if (updatedData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
    }

    const result = await db.collection(usersCollection).updateOne(query, { $set: updatedData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

app.patch('/users/:id', authMiddleware, isSelfOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();

    if (updateData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const result = await db.collection(usersCollection).updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

app.delete('/users/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const result = await db.collection(usersCollection).deleteOne(query);

    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// =========================
// ITEMS ROUTES (unchanged)
// =========================

function validateItem(item) {
  if (!item.name || typeof item.name !== 'string') {
    throw new Error('Item name is required and should be a string.');
  }
  if (typeof item.price !== 'number') {
    throw new Error('Item price is required and should be a number.');
  }
}

app.post('/items', authMiddleware, async (req, res) => {
  try {
    const item = req.body;
    validateItem(item);

    const db = await connectDB();
    const result = await db.collection(itemsCollection).insertOne(item);

    res.status(201).json({ message: 'Item created', itemId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create item' });
  }
});

app.get('/items', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const items = await db.collection(itemsCollection).find().toArray();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items', details: err.message });
  }
});

app.get('/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const item = await db.collection(itemsCollection).findOne(query);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item', details: err.message });
  }
});

app.put('/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const item = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    validateItem(item);

    const db = await connectDB();
    const result = await db.collection(itemsCollection).updateOne(query, { $set: item });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update item' });
  }
});

app.patch('/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const result = await db.collection(itemsCollection).updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

app.delete('/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const result = await db.collection(itemsCollection).deleteOne(query);

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
