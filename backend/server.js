const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, ObjectId } = require('./db');
const { authMiddleware, roleMiddleware, isSelfOrAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());
app.use('/auth', authRoutes);

const usersCollection = 'users';
const assetsCollection = 'assets';
const movementsCollection = 'movements';
const maintenanceCollection = 'maintenance';

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


//Profile route
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection(usersCollection).findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

// PUT /api/profile
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const db = await connectDB();

    await db.collection(usersCollection).updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name } }
    );

    const updatedUser = await db.collection(usersCollection).findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
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
  {
    id: user._id.toString(),
    user_name: user.name,  // inside the payload object
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '365d' } 
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

  // Enforce role creation permissions
  const requesterRole = req.user.role;

  if (requesterRole === 'admin' && role !== 'user') {
    return res.status(403).json({ error: 'Admin can only create users' });
  }

  if (requesterRole === 'user') {
    return res.status(403).json({ error: 'User role is not allowed to create users' });
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
// Get all users (admin and super_admin only)
app.get('/users', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection(usersCollection).find({}).toArray();

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
  if (asset.description && typeof asset.description !== 'string') {
    throw new Error('description should be a string if provided.');
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
      purchaseDate: new Date(asset.purchaseDate),
      location: asset.location.trim(),
      condition: asset.condition.trim(),
      status: asset.status ? asset.status.trim() : 'active',
      warranty: asset.warranty ? asset.warranty.trim() : '',
      serialNumber: asset.serialNumber ? asset.serialNumber.trim() : '',
      assignedTo: asset.assignedTo ? asset.assignedTo.trim() : '',
      description: asset.description ? asset.description.trim() : '',
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
  purchaseDate: new Date(asset.purchaseDate),
  location: asset.location.trim(),
  condition: asset.condition.trim(),
  status: asset.status ? asset.status.trim() : 'active',
  warranty: asset.warranty ? asset.warranty.trim() : '',
  serialNumber: asset.serialNumber ? asset.serialNumber.trim() : '',
  assignedTo: asset.assignedTo ? asset.assignedTo.trim() : '',
  description: asset.description ? asset.description.trim() : '',
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








function validateMovement(movement) {
  const validTypes = ['inside_building', 'outside_building'];

  if (
    !movement.assetId ||
    !ObjectId.isValid(movement.assetId) ||
    !movement.movementFrom ||
    !movement.movementTo ||
    !movement.movementType ||
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

  if (movement.returnedDateTime && isNaN(Date.parse(movement.returnedDateTime))) {
    throw new Error('returnedDateTime must be a valid date-time string');
  }

  if (movement.expectedReturnDate && isNaN(Date.parse(movement.expectedReturnDate))) {
    throw new Error('expectedReturnDate must be a valid date string');
  }
}

// Create new movement
app.post('/movements', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  try {
    const movement = req.body;
    validateMovement(movement);

    const db = await connectDB();

    const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(movement.assetId) });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const movementDoc = {
      assetId: new ObjectId(movement.assetId),
      assetName: asset.name,
      serialNumber: asset.serialNumber || '',
      movementFrom: movement.movementFrom.trim(),
      movementTo: movement.movementTo.trim(),
      movementType: movement.movementType.trim(),
      dispatchedBy: movement.dispatchedBy.trim(),
      receivedBy: movement.receivedBy.trim(),
      date: new Date(movement.date),
      returnable: typeof movement.returnable === 'boolean' ? movement.returnable : false,
      expectedReturnDate: movement.returnable ? new Date(movement.expectedReturnDate) : null,
      returnedDateTime: movement.returnedDateTime ? new Date(movement.returnedDateTime) : null,
      assetCondition: movement.assetCondition ? movement.assetCondition.trim() : '',
      description: movement.description ? movement.description.trim() : ''
    };

    const result = await db.collection(movementsCollection).insertOne(movementDoc);

    await db.collection(assetsCollection).updateOne(
      { _id: new ObjectId(movement.assetId) },
      { $set: { location: movement.movementTo.trim() } }
    );

    res.status(201).json({ message: 'Asset movement recorded', movementId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: 'Failed to record movement', details: err.message });
  }
});

// Get all movements
app.get('/movements', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  try {
    const db = await connectDB();

    const movements = await db.collection(movementsCollection).aggregate([
      {
        $lookup: {
          from: assetsCollection,
          localField: "assetId",
          foreignField: "_id",
          as: "assetInfo"
        }
      },
      { $unwind: { path: "$assetInfo", preserveNullAndEmptyArrays: true } },
      { $addFields: { serialNumber: "$assetInfo.serialNumber" } },
      { $project: { assetInfo: 0 } }
    ]).toArray();

    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movements', details: err.message });
  }
});

// Get movement by ID
app.get('/movements/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  try {
    const db = await connectDB();

    const movement = await db.collection(movementsCollection).aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: assetsCollection,
          localField: "assetId",
          foreignField: "_id",
          as: "assetInfo"
        }
      },
      { $unwind: { path: "$assetInfo", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          assetName: "$assetInfo.name",
          serialNumber: "$assetInfo.serialNumber"
        }
      },
      { $project: { assetInfo: 0 } }
    ]).next();

    if (!movement) return res.status(404).json({ error: 'Movement not found' });

    res.json(movement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movement', details: err.message });
  }
});

// Update full movement
app.put('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  const updatedMovement = req.body;

  try {
    validateMovement(updatedMovement);

    const db = await connectDB();

    const assetExists = await db.collection(assetsCollection).findOne({ _id: new ObjectId(updatedMovement.assetId) });
    if (!assetExists) return res.status(404).json({ error: 'Asset not found' });

    const updateDoc = {
      assetId: new ObjectId(updatedMovement.assetId),
      assetName: assetExists.name,
      serialNumber: assetExists.serialNumber || '',
      movementFrom: updatedMovement.movementFrom.trim(),
      movementTo: updatedMovement.movementTo.trim(),
      movementType: updatedMovement.movementType.trim(),
      dispatchedBy: updatedMovement.dispatchedBy.trim(),
      receivedBy: updatedMovement.receivedBy.trim(),
      date: new Date(updatedMovement.date),
      returnable: typeof updatedMovement.returnable === 'boolean' ? updatedMovement.returnable : false,
      expectedReturnDate: updatedMovement.returnable ? new Date(updatedMovement.expectedReturnDate) : null,
      returnedDateTime: updatedMovement.returnedDateTime ? new Date(updatedMovement.returnedDateTime) : null,
      assetCondition: updatedMovement.assetCondition ? updatedMovement.assetCondition.trim() : '',
      description: updatedMovement.description ? updatedMovement.description.trim() : ''
    };

    const result = await db.collection(movementsCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movement not found' });

    await db.collection(assetsCollection).updateOne(
      { _id: new ObjectId(updatedMovement.assetId) },
      { $set: { location: updatedMovement.movementTo.trim() } }
    );

    res.status(200).json({ message: 'Movement updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update movement', details: err.message });
  }
});

// Partial update movement
app.patch('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  try {
    const db = await connectDB();
    const updateData = { ...req.body };

    // Validate dates if present
    if (updateData.date && isNaN(Date.parse(updateData.date))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (updateData.expectedReturnDate && isNaN(Date.parse(updateData.expectedReturnDate))) {
      return res.status(400).json({ error: 'Invalid expectedReturnDate format' });
    }
    if (updateData.returnedDateTime && isNaN(Date.parse(updateData.returnedDateTime))) {
      return res.status(400).json({ error: 'Invalid returnedDateTime format' });
    }

    // Validate movementType if present
    if (updateData.movementType) {
      const validTypes = ['inside_building', 'outside_building'];
      if (!validTypes.includes(updateData.movementType.trim())) {
        return res.status(400).json({ error: 'Invalid movementType value' });
      }
      updateData.movementType = updateData.movementType.trim();
    }

    // If assetId provided, verify asset exists & add assetName and serialNumber
    if (updateData.assetId) {
      if (!ObjectId.isValid(updateData.assetId)) {
        return res.status(400).json({ error: 'Invalid assetId' });
      }
      const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(updateData.assetId) });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      updateData.assetId = new ObjectId(updateData.assetId);
      updateData.assetName = asset.name;
      updateData.serialNumber = asset.serialNumber || '';
    }

    // Convert dates to Date objects
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.expectedReturnDate) updateData.expectedReturnDate = new Date(updateData.expectedReturnDate);
    if (updateData.returnedDateTime) updateData.returnedDateTime = new Date(updateData.returnedDateTime);

    // Correct returnable type if present
    if (updateData.returnable !== undefined) {
      if (typeof updateData.returnable !== 'boolean') {
        return res.status(400).json({ error: 'returnable must be a boolean' });
      }
    }

    // Trim string fields
    ['movementFrom', 'movementTo', 'dispatchedBy', 'receivedBy', 'assetCondition', 'description'].forEach(field => {
      if (updateData[field]) updateData[field] = updateData[field].trim();
    });

    const result = await db.collection(movementsCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movement not found' });

    // Update asset location if movementTo and assetId changed
    if (updateData.assetId && updateData.movementTo) {
      await db.collection(assetsCollection).updateOne(
        { _id: updateData.assetId },
        { $set: { location: updateData.movementTo } }
      );
    }

    res.json({ message: 'Movement updated successfully' });
  } catch (error) {
    console.error('Error updating movement:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete movement
app.delete('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid movement ID' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection(movementsCollection).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    res.status(200).json({ message: 'Movement deleted successfully' });
  } catch (err) {
    console.error('Error deleting movement:', err);
    res.status(500).json({ error: 'Failed to delete movement', details: err.message });
  }
});
app.get('/assets/serial/:serialNumber', authMiddleware, async (req, res) => {
  const serialNumber = req.params.serialNumber.trim();
  console.log('Serial number param:', serialNumber);

  // Escape regex special chars
  const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const escapedSerialNumber = escapeRegex(serialNumber);

  try {
    const db = await connectDB();
    const assets = await db.collection(assetsCollection).find({
      serialNumber: { $regex: `^${escapedSerialNumber}$`, $options: 'i' }
    }).toArray();

    if (assets.length === 0) {
      return res.status(404).json({ message: 'No assets found with this serial number' });
    }

    res.status(200).json(assets);
  } catch (err) {
    console.error('Error fetching asset by serial number:', err);
    res.status(500).json({ error: 'Failed to fetch assets by serial number', details: err.message });
  }
});






   ///MAINTENANCE  APIs

function calculateNextDate(scheduledDate, frequency) {
  if (!scheduledDate || !frequency) return null;
  const date = new Date(scheduledDate);
  if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  else if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
  else if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
  else return null;
  return date;
}

const validFrequencies = ['weekly', 'monthly', 'quarterly'];

function validateMaintenance(maintenance) {
  const validStatuses = ['scheduled', 'in_progress', 'completed'];
  const validTypes = ['preventive', 'corrective'];

  if (
    !maintenance.assetId ||
    !ObjectId.isValid(maintenance.assetId) ||
    !maintenance.maintenanceType ||
    !validTypes.includes(maintenance.maintenanceType) ||
    !maintenance.scheduledDate ||
    isNaN(Date.parse(maintenance.scheduledDate)) ||
    !maintenance.status ||
    !validStatuses.includes(maintenance.status) ||
    !maintenance.frequency ||
    !validFrequencies.includes(maintenance.frequency)
  ) {
    throw new Error('Missing or invalid required fields for maintenance');
  }

  if (maintenance.completedDate && isNaN(Date.parse(maintenance.completedDate))) {
    throw new Error('Invalid completedDate');
  }

  if (maintenance.description && typeof maintenance.description !== 'string') {
    throw new Error('description should be a string');
  }

  if (maintenance.performedBy && typeof maintenance.performedBy !== 'string') {
    throw new Error('performedBy should be a string');
  }
}

// CREATE maintenance
app.post('/maintenance', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  try {
    const maintenance = req.body;
    validateMaintenance(maintenance);

    const db = await connectDB();

    const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(maintenance.assetId) });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const nextMaintenanceDate = calculateNextDate(maintenance.scheduledDate, maintenance.frequency);

    const maintenanceDoc = {
      assetId: new ObjectId(maintenance.assetId),
      assetName: asset.name,
      maintenanceType: maintenance.maintenanceType.trim(),
      description: maintenance.description?.trim() || '',
      scheduledDate: new Date(maintenance.scheduledDate),
      completedDate: maintenance.completedDate ? new Date(maintenance.completedDate) : null,
      status: maintenance.status.trim(),
      performedBy: maintenance.performedBy?.trim() || '',
      frequency: maintenance.frequency.trim(),
      nextMaintenanceDate,
    };

    const result = await db.collection(maintenanceCollection).insertOne(maintenanceDoc);
    res.status(201).json({ message: 'Maintenance record created', maintenanceId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create maintenance record', details: err.message });
  }
});

// GET all maintenance
app.get('/maintenance', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  try {
    const db = await connectDB();
    const maintenance = await db.collection(maintenanceCollection).find().toArray();
    res.status(200).json(maintenance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance records', details: err.message });
  }
});

// GET maintenance by ID
app.get('/maintenance/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid maintenance ID' });

  try {
    const db = await connectDB();
    const maintenance = await db.collection(maintenanceCollection).findOne({ _id: new ObjectId(id) });
    if (!maintenance) return res.status(404).json({ error: 'Maintenance record not found' });
    res.status(200).json(maintenance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance record', details: err.message });
  }
});

// UPDATE (full) maintenance by ID
app.put('/maintenance/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid maintenance ID' });

  try {
    const maintenance = req.body;
    validateMaintenance(maintenance);

    const db = await connectDB();

    const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(maintenance.assetId) });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const nextMaintenanceDate = calculateNextDate(maintenance.scheduledDate, maintenance.frequency);

    const updatedDoc = {
      assetId: new ObjectId(maintenance.assetId),
      assetName: asset.name,
      maintenanceType: maintenance.maintenanceType.trim(),
      description: maintenance.description?.trim() || '',
      scheduledDate: new Date(maintenance.scheduledDate),
      completedDate: maintenance.completedDate ? new Date(maintenance.completedDate) : null,
      status: maintenance.status.trim(),
      performedBy: maintenance.performedBy?.trim() || '',
      frequency: maintenance.frequency.trim(),
      nextMaintenanceDate,
    };

    const result = await db.collection(maintenanceCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedDoc }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Maintenance record not found' });
    res.status(200).json({ message: 'Maintenance record updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update maintenance record', details: err.message });
  }
});

// PATCH (partial update) maintenance by ID
app.patch('/maintenance/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid maintenance ID' });

  const updates = req.body;
  const validStatuses = ['scheduled', 'in_progress', 'completed'];
  const validTypes = ['preventive', 'corrective'];
  const validFrequencies = ['weekly', 'monthly', 'quarterly'];

  if (updates.assetId && !ObjectId.isValid(updates.assetId)) {
    return res.status(400).json({ error: 'Invalid assetId' });
  }

  if (updates.status && !validStatuses.includes(updates.status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  if (updates.maintenanceType && !validTypes.includes(updates.maintenanceType)) {
    return res.status(400).json({ error: 'Invalid maintenanceType value' });
  }

  if (updates.frequency && !validFrequencies.includes(updates.frequency)) {
    return res.status(400).json({ error: 'Invalid frequency value' });
  }

  try {
    const db = await connectDB();

    if (updates.assetId) {
      const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(updates.assetId) });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      updates.assetName = asset.name;
      updates.assetId = new ObjectId(updates.assetId);
    }

    if (updates.scheduledDate && isNaN(Date.parse(updates.scheduledDate))) {
      return res.status(400).json({ error: 'Invalid scheduledDate' });
    }

    if (updates.completedDate && isNaN(Date.parse(updates.completedDate))) {
      return res.status(400).json({ error: 'Invalid completedDate' });
    }

    if (updates.scheduledDate) updates.scheduledDate = new Date(updates.scheduledDate);
    if (updates.completedDate) updates.completedDate = new Date(updates.completedDate);

    ['maintenanceType', 'status', 'description', 'performedBy', 'frequency'].forEach(field => {
      if (updates[field] && typeof updates[field] === 'string') {
        updates[field] = updates[field].trim();
      }
    });

    // Recalculate nextMaintenanceDate if scheduledDate or frequency is updated
    if (updates.scheduledDate || updates.frequency) {
      const current = await db.collection(maintenanceCollection).findOne({ _id: new ObjectId(id) });
      if (!current) return res.status(404).json({ error: 'Maintenance record not found' });

      const scheduledDate = updates.scheduledDate || current.scheduledDate;
      const frequency = updates.frequency || current.frequency;

      const nextMaintenanceDate = calculateNextDate(scheduledDate, frequency);
      updates.nextMaintenanceDate = nextMaintenanceDate;
    }

    const result = await db.collection(maintenanceCollection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Maintenance record not found' });

    res.status(200).json({ message: 'Maintenance record updated successfully', maintenance: result.value });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update maintenance record', details: err.message });
  }
});

// DELETE maintenance by ID
app.delete('/maintenance/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid maintenance ID' });

  try {
    const db = await connectDB();
    const result = await db.collection(maintenanceCollection).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Maintenance record not found' });
    res.status(200).json({ message: 'Maintenance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete maintenance record', details: err.message });
  }
});

// =========================
// SERVER SETUP
// =========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log("Server running on port ${PORT}");
});
