const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, ObjectId } = require('./db');
const { authMiddleware, roleMiddleware, isSelfOrAdmin } = require('./middleware/auth');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());

const usersCollection = 'users';
const assetsCollection = 'assets';
const movementsCollection = 'movements';

// =========================
// AUTH ROUTES
// =========================

// Get current logged-in user
app.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Current logged-in user',
    user: req.user,
  });
});

// Login route
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

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

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

// Get all users (super_admin only)
app.get('/users', authMiddleware, roleMiddleware(['super_admin']), async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection(usersCollection).find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// Get user by ID (self or admin)
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

// Update user (PUT) (admin or super_admin and self)
app.put('/users/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), isSelfOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    if (updatedData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
    }

    const db = await connectDB();
    const result = await db.collection(usersCollection).updateOne(query, { $set: updatedData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Partial update user (PATCH) (admin or super_admin and self)
app.patch('/users/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), isSelfOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

  try {
    if (updateData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const db = await connectDB();
    const result = await db.collection(usersCollection).updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Delete user (admin or super_admin)
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
// ASSET ROUTES
// =========================

function validateAsset(asset) {
  if (
    !asset.name || typeof asset.name !== 'string' ||
    !asset.type || typeof asset.type !== 'string' ||
    !asset.category || typeof asset.category !== 'string' ||
    asset.price === undefined || typeof asset.price !== 'number' ||
    !asset.purchaseDate || isNaN(Date.parse(asset.purchaseDate)) ||
    !asset.location || typeof asset.location !== 'string' ||
    !asset.condition || typeof asset.condition !== 'string'
  ) {
    throw new Error('Missing or invalid required fields');
  }

  const validStatuses = ['active', 'in_repair', 'disposed'];
  if (asset.status && !validStatuses.includes(asset.status)) {
    throw new Error('Invalid status value');
  }

  // Optional fields type checks
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

// Create asset
app.post('/assets', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const asset = req.body;
    validateAsset(asset);

    const formattedAsset = {
      name: asset.name.trim(),
      type: asset.type.trim(),
      category:asset.category.trim(),
      price: asset.price,
      purchaseDate: new Date(asset.purchaseDate),
      location: asset.location.trim(),
      condition: asset.condition.trim(),
      status: asset.status ? asset.status.trim() : 'active',
      warranty: asset.warranty ? asset.warranty.trim() : '',
      serialNumber: asset.serialNumber ? asset.serialNumber.trim() : '',
      assignedTo: asset.assignedTo ? asset.assignedTo.trim() : '',
      notes: asset.notes ? asset.notes.trim() : '',
      };
const db = await connectDB();
const result = await db.collection(assetsCollection).insertOne(formattedAsset);

res.status(201).json({ message: 'Asset created', assetId: result.insertedId });
} catch (err) {
res.status(400).json({ error: 'Failed to create asset', details: err.message });
}
});

// Get all assets
app.get('/assets', authMiddleware, async (req, res) => {
try {
const db = await connectDB();
const assets = await db.collection(assetsCollection).find().toArray();
res.status(200).json(assets);
} catch (err) {
res.status(500).json({ error: 'Failed to fetch assets', details: err.message });
}
});

// Get asset by ID
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

// Update asset (PUT)
app.put('/assets/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
const { id } = req.params;
try {
const asset = req.body;
validateAsset(asset);
const formattedAsset = {
  name: asset.name.trim(),
  type: asset.type.trim(),
  category: asset.category.trim(),
  price: asset.price,
  purchaseDate: new Date(asset.purchaseDate),
  location: asset.location.trim(),
  condition: asset.condition.trim(),
  status: asset.status ? asset.status.trim() : 'active',
  warranty: asset.warranty ? asset.warranty.trim() : '',
  serialNumber: asset.serialNumber ? asset.serialNumber.trim() : '',
  assignedTo: asset.assignedTo ? asset.assignedTo.trim() : '',
  notes: asset.notes ? asset.notes.trim() : '',
};

const db = await connectDB();
const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
const result = await db.collection(assetsCollection).updateOne(query, { $set: formattedAsset });

if (result.matchedCount === 0) return res.status(404).json({ error: 'Asset not found' });
res.status(200).json({ message: 'Asset updated successfully' });
} catch (err) {
res.status(400).json({ error: 'Failed to update asset', details: err.message });
}
});

// Delete asset
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



// Validate movement data
function validateMovement(movement) {
  const validTypes = ['inside_building', 'outside_building'];

  if (
    !movement.assetId ||
    !ObjectId.isValid(movement.assetId) ||
    !movement.movementFrom ||
    !movement.movementTo ||
    !movement.movementType || // required
    !movement.dispatchedBy ||
    !movement.receivedBy ||
    !movement.date
  ) {
    throw new Error('Missing or invalid required fields for movement');
  }

  if (!validTypes.includes(movement.movementType)) {
    throw new Error('movementType must be either "inside_building" or "outside_building"');
  }

  if (movement.returnable !== undefined && typeof movement.returnable !== 'boolean') {
    throw new Error('returnable must be a boolean');
  }

  if (movement.returnable && !movement.expectedReturnDate) {
    throw new Error('Expected return date required if returnable is true');
  }
}


// Create a new asset movement (transfer)
app.post('/movements', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const movement = req.body;
    validateMovement(movement);

    const db = await connectDB();

    // Confirm asset exists
    const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(movement.assetId) });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Fix: set assetName from found asset
    const movementDoc = {
      assetId: new ObjectId(movement.assetId),
      assetName: asset.name,  // <-- use asset.name (or asset.assetName) depending on your schema
      movementFrom: movement.movementFrom.trim(),
      movementTo: movement.movementTo.trim(),
      movementType: movement.movementType.trim(),
      dispatchedBy: movement.dispatchedBy.trim(),
      receivedBy: movement.receivedBy.trim(),
      returnable: movement.returnable || false,
      expectedReturnDate: movement.returnable ? new Date(movement.expectedReturnDate) : null,
      date: new Date(movement.date),  // Ensure frontend sends ISO or parseable date string
      notes: movement.notes ? movement.notes.trim() : ''
    };

    const result = await db.collection(movementsCollection).insertOne(movementDoc);

    await db.collection(assetsCollection).updateOne(
      { _id: new ObjectId(movement.assetId) },
      { $set: { location: movement.movementTo } }
    );

    res.status(201).json({ message: 'Asset movement recorded', movementId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: 'Failed to record movement', details: err.message });
  }
});

// Get all movements (admin and super_admin only)
app.get('/movements', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const db = await connectDB();
    const movements = await db.collection(movementsCollection).find().toArray();
    res.status(200).json(movements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movements', details: err.message });
  }
});

// Get movements by asset ID
app.get('/movements/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });
  try {
    const db = await connectDB();
    const movement = await db.collection(movementsCollection).findOne({ _id: new ObjectId(id) });
    if (!movement) return res.status(404).json({ error: 'Movement not found' });
    res.json(movement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movement' });
  }
});

app.put('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  const updatedMovement = req.body;

  try {
    // Validate movement, ensure assetId exists or fallback dummy for validation (could refine this)
    validateMovement({
      ...updatedMovement,
      assetId: updatedMovement.assetId || '',
    });

    const db = await connectDB();

    // Confirm asset exists if assetId provided
    if (updatedMovement.assetId) {
      const assetExists = await db.collection(assetsCollection).findOne({ _id: new ObjectId(updatedMovement.assetId) });
      if (!assetExists) return res.status(404).json({ error: 'Asset not found' });
    }

    // Format fields (trim strings, convert dates)
    const updateDoc = {
      movementFrom: updatedMovement.movementFrom.trim(),
      movementTo: updatedMovement.movementTo.trim(),
      movementType: updatedMovement.movementType.trim(),
      dispatchedBy: updatedMovement.dispatchedBy.trim(),
      receivedBy: updatedMovement.receivedBy.trim(),
      returnable: updatedMovement.returnable || false,
      expectedReturnDate: updatedMovement.returnable ? new Date(updatedMovement.expectedReturnDate) : null,
      date: new Date(updatedMovement.date),
      notes: updatedMovement.notes ? updatedMovement.notes.trim() : '',
    };

    if (updatedMovement.assetId) {
      updateDoc.assetId = new ObjectId(updatedMovement.assetId);

      // Get asset name for the movement record
      const asset = await db.collection(assetsCollection).findOne({ _id: updateDoc.assetId });
      updateDoc.assetName = asset.name;
    }

    // Update movement document
    const result = await db.collection(movementsCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movement not found' });

    // If asset location changed, update asset location
    if (updatedMovement.movementTo && updatedMovement.assetId) {
      await db.collection(assetsCollection).updateOne(
        { _id: new ObjectId(updatedMovement.assetId) },
        { $set: { location: updatedMovement.movementTo.trim() } }
      );
    }

    res.status(200).json({ message: 'Movement updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update movement', details: err.message });
  }
});
// Partial update movement
app.patch('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  const updateData = req.body;

  try {
    const assetId = req.params.id;
    const updateData = req.body;

    // Validate and parse date if present
    if (updateData.date) {
      const parsedDate = new Date(updateData.date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      updateData.date = parsedDate;
    }

    // Validate movementType if present
    if (updateData.movementType) {
      const validTypes = ['inside building', 'outside building'];
      if (!validTypes.includes(updateData.movementType.trim())) {
        return res.status(400).json({ error: 'Invalid movementType value' });
      }
      updateData.movementType = updateData.movementType.trim();
    }

    // Update the asset document
    const updatedAsset = await Asset.findByIdAndUpdate(assetId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.delete('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  try {
    const assetId = req.params.id;

    const deletedAsset = await Asset.findByIdAndDelete(assetId);

    if (!deletedAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =========================
// SERVER SETUP
// =========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log("Server running on port ${PORT}");
});
