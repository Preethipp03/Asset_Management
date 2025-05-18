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
const assetsCollection = 'assets';

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

app.get('/users/:id', authMiddleware, isSelfOrAdmin, async (req, res) => {
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

app.put('/users/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']),isSelfOrAdmin, async (req, res) => {
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

app.patch('/users/:id', authMiddleware,roleMiddleware(['admin', 'super_admin']), isSelfOrAdmin, async (req, res) => {
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
// assets ROUTES (unchanged)
// =========================

function validateAsset(asset) {
  if (!asset.name || typeof asset.name !== 'string') {
    throw new Error('Asset name is required and should be a string.');
  }
  if (!asset.type || typeof asset.type !== 'string') {
    throw new Error('Asset type is required and should be a string.');
  }
  if (!asset.category || typeof asset.category !== 'string') {
    throw new Error('Asset category is required and should be a string.');
  }
  if (typeof asset.price !== 'number') {
    throw new Error('Asset price is required and should be a number.');
  }
  if (!asset.purchaseDate || isNaN(Date.parse(asset.purchaseDate))) {
    throw new Error('Purchase date is required and should be a valid date.');
  }
  if (!asset.location || typeof asset.location !== 'string') {
    throw new Error('Location is required and should be a string.');
  }
  if (!asset.condition || typeof asset.condition !== 'string') {
    throw new Error('Condition is required and should be a string.');
  }

  // Optional fields
  if (asset.warranty && typeof asset.warranty !== 'string') {
    throw new Error('Warranty should be a string if provided.');
  }
  if (asset.serialNumber && typeof asset.serialNumber !== 'string') {
    throw new Error('Serial Number should be a string if provided.');
  }
  if (asset.assignedTo && typeof asset.assignedTo !== 'string') {
    throw new Error('Assigned To should be a string if provided.');
  }
  if (asset.notes && typeof asset.notes !== 'string') {
    throw new Error('Notes should be a string if provided.');
  }
  
}

function validateAsset(asset) {
  if (!asset.name || !asset.type || !asset.category || !asset.price || !asset.purchaseDate) {
    throw new Error('Missing required fields');
  }
  const validStatuses = ['active', 'in_repair', 'disposed'];
  if (asset.status && !validStatuses.includes(asset.status)) {
    throw new Error('Invalid status value');
  }
}


app.post('/assets', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const asset = req.body;
    validateAsset(asset);

    const formattedAsset = {
      name: asset.name.trim(),
      type: asset.type.trim(),
      category: asset.category.trim(),
      price: Number(asset.price),
      purchaseDate: new Date(asset.purchaseDate),
      warranty: asset.warranty?.trim() || '',
      location: asset.location.trim(),
      condition: asset.condition.trim(),
      serialNumber: asset.serialNumber?.trim() || '',
      assignedTo: asset.assignedTo?.trim() || '',
      notes: asset.notes?.trim() || '',
    };

    const db = await connectDB();
    const result = await db.collection(assetsCollection).insertOne(formattedAsset);

    res.status(201).json({ message: 'Asset created', assetId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create asset' });
  }
});



app.get('/assets', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const assets = await db.collection(assetsCollection).find().toArray();
    res.status(200).json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets', details: err.message });
  }
});


app.get('/assets/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const asset = await db.collection(assetsCollection).findOne(query);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.status(200).json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch asset', details: err.message });
  }
});

app.put('/assets/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const asset = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    validateAsset(asset);

    const updatedAsset = {
      name: asset.name.trim(),
      type: asset.type.trim(),
      category: asset.category.trim(),
      price: Number(asset.price),
      purchaseDate: new Date(asset.purchaseDate),
      warranty: asset.warranty?.trim() || '',
      location: asset.location.trim(),
      condition: asset.condition.trim(),
      serialNumber: asset.serialNumber?.trim() || '',
      assignedTo: asset.assignedTo?.trim() || '',
      notes: asset.notes?.trim() || '',
      status: asset.status?.trim() || '', // ✅ Add this line
    };


    const db = await connectDB();
    const result = await db.collection(assetsCollection).updateOne(query, { $set: updatedAsset });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Asset not found' });
    res.status(200).json({ message: 'Asset updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update asset' });
  }
});



app.patch('/assets/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    // Prepare an object to hold only valid fields for update
    const allowedFields = [
      'name', 'type', 'category', 'price', 'purchaseDate',
      'warranty', 'location', 'condition', 'serialNumber',
      'assignedTo','status', 'notes'
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        // Format fields properly
        if (key === 'price') {
          updateData[key] = Number(updates[key]);
        } else if (key === 'purchaseDate') {
          updateData[key] = new Date(updates[key]);
        } else if (typeof updates[key] === 'string') {
          updateData[key] = updates[key].trim();
        } else {
          updateData[key] = updates[key];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const db = await connectDB();
    const result = await db.collection(assetsCollection).updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Asset not found' });

    res.status(200).json({ message: 'Asset updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update asset' });
  }
});


app.delete('/assets/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    const db = await connectDB();
    const result = await db.collection(assetsCollection).deleteOne(query);

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Asset not found' });
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete asset', details: err.message });
  }
});



// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
