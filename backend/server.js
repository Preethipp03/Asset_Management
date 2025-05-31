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



///Movements APIS


function validateMovement(movement) {
  const validTypes = ['inside_building', 'outside_building'];

  // assetId must be a valid ObjectId if provided
  const hasAssetId = movement.assetId && ObjectId.isValid(movement.assetId);
  // Or assetName and serialNumber must exist
  const hasAssetInfo = movement.assetName && movement.serialNumber;

  if (
    (!hasAssetId && !hasAssetInfo) ||
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

  if (movement.expectedReturnDate && isNaN(Date.parse(movement.expectedReturnDate))) {
    throw new Error('expectedReturnDate must be a valid date string');
  }
}

// Create new movement
app.post('/movements', authMiddleware, async (req, res) => {
  try {
    const {
      assetName,
      serialNumber,
      movementFrom,
      movementTo,
      movementType,
      dispatchedBy,
      receivedBy,
      date,
      returnable,
      expectedReturnDate,
      assetCondition,
      description,
    } = req.body;

    // Validate required fields
    if (
      !assetName ||
      !serialNumber ||
      !movementFrom ||
      !movementTo ||
      !movementType ||
      !dispatchedBy ||
      !receivedBy ||
      !date
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (returnable && !expectedReturnDate) {
      return res.status(400).json({ message: 'Expected return date required if returnable is true' });
    }

    const newMovement = {
      assetName: assetName.trim(),
      serialNumber: serialNumber.trim(),
      movementFrom: movementFrom.trim(),
      movementTo: movementTo.trim(),
      movementType,
      dispatchedBy: dispatchedBy.trim(),
      receivedBy: receivedBy.trim(),
      date: new Date(date),
      returnable: Boolean(returnable),
      expectedReturnDate: returnable ? new Date(expectedReturnDate) : null,
      assetCondition: assetCondition?.trim() || '',
      description: description?.trim() || '',
      createdAt: new Date(),
    };

    const db = await connectDB();
    await db.collection(movementsCollection).insertOne(newMovement);

    res.status(201).json({ message: 'Movement added successfully' });
  } catch (err) {
    console.error('Error creating movement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all movements
app.get('/movements', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  try {
    const db = await connectDB();
    const movements = await db.collection(movementsCollection).find({}).sort({ date: -1 }).toArray();
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
    const movement = await db.collection(movementsCollection).findOne({ _id: new ObjectId(id) });

    if (!movement) return res.status(404).json({ error: 'Movement not found' });

    res.json(movement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movement', details: err.message });
  }
});

// Full update movement (PUT)
app.put('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  const updatedMovement = req.body;

  try {
    validateMovement(updatedMovement);

    const db = await connectDB();

    const existingMovement = await db.collection(movementsCollection).findOne({ _id: new ObjectId(id) });
    if (!existingMovement) return res.status(404).json({ error: 'Movement not found' });

    // Don't override assetName from DB or assetId, use the one from request if given
    const updateDoc = {
      assetId: updatedMovement.assetId ? new ObjectId(updatedMovement.assetId) : existingMovement.assetId,
      assetName: updatedMovement.assetName ? updatedMovement.assetName.trim() : existingMovement.assetName,
      serialNumber: updatedMovement.serialNumber || existingMovement.serialNumber || '',
      movementFrom: updatedMovement.movementFrom.trim(),
      movementTo: updatedMovement.movementTo.trim(),
      movementType: updatedMovement.movementType.trim(),
      dispatchedBy: updatedMovement.dispatchedBy.trim(),
      receivedBy: updatedMovement.receivedBy.trim(),
      date: new Date(updatedMovement.date),
      returnable: typeof updatedMovement.returnable === 'boolean' ? updatedMovement.returnable : false,
      expectedReturnDate: updatedMovement.returnable ? new Date(updatedMovement.expectedReturnDate) : null,
      returnedDateTime: updatedMovement.returnedDateTime ? new Date(updatedMovement.returnedDateTime) : null,
      assetCondition: updatedMovement.assetCondition?.trim() || '',
      description: updatedMovement.description?.trim() || ''
    };

    const result = await db.collection(movementsCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movement not found' });

    // Update asset location if assetId and movementTo are present
    if (updatedMovement.assetId && updatedMovement.movementTo) {
      await db.collection(assetsCollection).updateOne(
        { _id: new ObjectId(updatedMovement.assetId) },
        { $set: { location: updatedMovement.movementTo.trim() } }
      );
    }

    res.status(200).json({ message: 'Movement updated successfully' });

  } catch (err) {
    console.error('Error updating movement:', err);
    res.status(400).json({ error: 'Failed to update movement', details: err.message });
  }
});

app.patch('/movements/:id', authMiddleware, roleMiddleware(['admin', 'super_admin', 'user']), async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid movement ID' });

  try {
    const db = await connectDB();
    const updateData = { ...req.body };

    // Validate date fields if present
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

    // If assetId provided, validate and set, but don't overwrite assetName forcibly
    if (updateData.assetId) {
      if (!ObjectId.isValid(updateData.assetId)) {
        return res.status(400).json({ error: 'Invalid assetId' });
      }
      const asset = await db.collection(assetsCollection).findOne({ _id: new ObjectId(updateData.assetId) });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      updateData.assetId = new ObjectId(updateData.assetId);

      // Only set assetName if not explicitly provided in the updateData
      if (!updateData.assetName) {
        updateData.assetName = asset.name;
      }
      // Similarly for serialNumber if not provided
      if (!updateData.serialNumber) {
        updateData.serialNumber = asset.serialNumber || '';
      }
    }

    // Convert date strings to Date objects
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.expectedReturnDate) updateData.expectedReturnDate = new Date(updateData.expectedReturnDate);
    if (updateData.returnedDateTime) updateData.returnedDateTime = new Date(updateData.returnedDateTime);

    // Validate returnable if provided
    if (updateData.returnable !== undefined) {
      if (typeof updateData.returnable !== 'boolean') {
        return res.status(400).json({ error: 'returnable must be a boolean' });
      }
    }

    // Trim string fields if present
    ['movementFrom', 'movementTo', 'dispatchedBy', 'receivedBy', 'assetCondition', 'description', 'assetName'].forEach(field => {
      if (updateData[field]) updateData[field] = updateData[field].trim();
    });

    const result = await db.collection(movementsCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movement not found' });

    // Update asset location if assetId and movementTo are present
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


////Maintenance APIs

   function validateMaintenance(maintenance) {
  const validStatuses = ['scheduled', 'in_progress', 'completed'];
  const validTypes = ['preventive', 'corrective'];

  if (
    !maintenance.assetName ||
    !maintenance.serialNumber ||
    !maintenance.maintenanceType ||
    !validTypes.includes(maintenance.maintenanceType) ||
    !maintenance.scheduledDate ||
    isNaN(Date.parse(maintenance.scheduledDate)) ||
    !maintenance.status ||
    !validStatuses.includes(maintenance.status) ||
    !maintenance.technicianInHouse ||
    !maintenance.technicianVendor
  ) {
    throw new Error('Missing or invalid required fields');
  }
}

// --- Maintenance POST route ---
app.post(
  '/maintenance',
  authMiddleware,
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const maintenance = req.body;

      // Validation function matching frontend fields and logic
      function validateMaintenance(data) {
        const allowedTypes = ['preventive', 'corrective', 'predictive'];
        const allowedStatus = ['scheduled', 'in-progress', 'completed', 'cancelled'];

        if (!data.assetName || typeof data.assetName !== 'string' || !data.assetName.trim()) {
          throw new Error('Asset Name is required and must be a non-empty string.');
        }
        if (!data.serialNumber || typeof data.serialNumber !== 'string' || !data.serialNumber.trim()) {
          throw new Error('Serial Number is required and must be a non-empty string.');
        }
        if (!data.scheduledDate || isNaN(Date.parse(data.scheduledDate))) {
          throw new Error('Scheduled Date is required and must be a valid date.');
        }
        if (data.nextScheduledDate && isNaN(Date.parse(data.nextScheduledDate))) {
          throw new Error('Next Scheduled Date must be a valid date.');
        }
        if (
          data.nextScheduledDate &&
          new Date(data.nextScheduledDate) <= new Date(data.scheduledDate)
        ) {
          throw new Error('Next Scheduled Date must be after Scheduled Date.');
        }
        if (
          !data.maintenanceType ||
          !allowedTypes.includes(data.maintenanceType.trim().toLowerCase())
        ) {
          throw new Error(`Maintenance Type must be one of: ${allowedTypes.join(', ')}`);
        }
        if (
          !data.status ||
          !allowedStatus.includes(data.status.trim().toLowerCase())
        ) {
          throw new Error(`Status must be one of: ${allowedStatus.join(', ')}`);
        }
      }

      validateMaintenance(maintenance);

      const db = await connectDB();

      const maintenanceDoc = {
        assetName: maintenance.assetName.trim(),
        serialNumber: maintenance.serialNumber.trim(),
        maintenanceType: maintenance.maintenanceType.trim().toLowerCase(),
        scheduledDate: new Date(maintenance.scheduledDate),
        nextScheduledDate: maintenance.nextScheduledDate
          ? new Date(maintenance.nextScheduledDate)
          : null,
        status: maintenance.status.trim().toLowerCase(),
        technicianInHouse: maintenance.technicianInHouse
          ? maintenance.technicianInHouse.trim()
          : '',
        technicianVendor: maintenance.technicianVendor
          ? maintenance.technicianVendor.trim()
          : '',
        description: maintenance.description
          ? maintenance.description.trim()
          : '',
        createdBy: req.user.id, // from authMiddleware
        createdAt: new Date(),
      };

      const result = await db
        .collection(maintenanceCollection)
        .insertOne(maintenanceDoc);

      res.status(201).json({
        message: 'Maintenance record created',
        maintenanceId: result.insertedId,
      });
    } catch (err) {
      res.status(400).json({
        error: 'Failed to create maintenance',
        details: err.message,
      });
    }
  }
);

// --- Maintenance GET all ---
app.get(
  '/maintenance',
  authMiddleware,
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const db = await connectDB();
      const maintenanceList = await db.collection(maintenanceCollection).find().toArray();
      res.status(200).json(maintenanceList);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch maintenance records', details: err.message });
    }
  }
);

// --- Maintenance GET by ID ---
app.get('/maintenance/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: 'Invalid maintenance ID' });

  try {
    const db = await connectDB();
    const maintenance = await db.collection(maintenanceCollection).findOne({ _id: new ObjectId(id) });
    if (!maintenance)
      return res.status(404).json({ error: 'Maintenance record not found' });
    res.status(200).json(maintenance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance record', details: err.message });
  }
});

// --- Maintenance PUT (update) ---
app.put(
  '/maintenance/:id',
  authMiddleware,
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const maintenanceId = req.params.id;
      if (!ObjectId.isValid(maintenanceId)) {
        return res.status(400).json({ error: 'Invalid maintenance ID' });
      }

      const maintenance = req.body;

      // Same validation as POST route:
      function validateMaintenance(data) {
        const allowedTypes = ['preventive', 'corrective', 'predictive'];
        const allowedStatus = ['scheduled', 'in-progress', 'completed', 'cancelled'];

        if (!data.assetName || typeof data.assetName !== 'string' || !data.assetName.trim()) {
          throw new Error('Asset Name is required and must be a non-empty string.');
        }
        if (!data.serialNumber || typeof data.serialNumber !== 'string' || !data.serialNumber.trim()) {
          throw new Error('Serial Number is required and must be a non-empty string.');
        }
        if (!data.scheduledDate || isNaN(Date.parse(data.scheduledDate))) {
          throw new Error('Scheduled Date is required and must be a valid date.');
        }
        if (data.nextScheduledDate && isNaN(Date.parse(data.nextScheduledDate))) {
          throw new Error('Next Scheduled Date must be a valid date.');
        }
        if (
          data.nextScheduledDate &&
          new Date(data.nextScheduledDate) <= new Date(data.scheduledDate)
        ) {
          throw new Error('Next Scheduled Date must be after Scheduled Date.');
        }
        if (
          !data.maintenanceType ||
          !allowedTypes.includes(data.maintenanceType.trim().toLowerCase())
        ) {
          throw new Error(`Maintenance Type must be one of: ${allowedTypes.join(', ')}`);
        }
        if (
          !data.status ||
          !allowedStatus.includes(data.status.trim().toLowerCase())
        ) {
          throw new Error(`Status must be one of: ${allowedStatus.join(', ')}`);
        }
      }

      validateMaintenance(maintenance);

      const db = await connectDB();

      const updateDoc = {
        $set: {
          assetName: maintenance.assetName.trim(),
          serialNumber: maintenance.serialNumber.trim(),
          maintenanceType: maintenance.maintenanceType.trim().toLowerCase(),
          scheduledDate: new Date(maintenance.scheduledDate),
          nextScheduledDate: maintenance.nextScheduledDate
            ? new Date(maintenance.nextScheduledDate)
            : null,
          status: maintenance.status.trim().toLowerCase(),
          technicianInHouse: maintenance.technicianInHouse
            ? maintenance.technicianInHouse.trim()
            : '',
          technicianVendor: maintenance.technicianVendor
            ? maintenance.technicianVendor.trim()
            : '',
          description: maintenance.description
            ? maintenance.description.trim()
            : '',
          updatedAt: new Date(),
          updatedBy: req.user.id, // track who updated
        },
      };

      const result = await db
        .collection(maintenanceCollection)
        .updateOne({ _id: new ObjectId(maintenanceId) }, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      res.json({ message: 'Maintenance record updated' });
    } catch (err) {
      res.status(400).json({ error: 'Failed to update maintenance', details: err.message });
    }
  }
);

// --- Maintenance DELETE ---
app.delete(
  '/maintenance/:id',
  authMiddleware,
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid maintenance ID' });

    try {
      const db = await connectDB();
      const result = await db.collection(maintenanceCollection).deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: 'Maintenance record not found' });

      res.status(200).json({ message: 'Maintenance record deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete maintenance', details: err.message });
    }
  }
);

// =========================
// SERVER SETUP
// =========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log("Server running on port ${PORT}");
});
