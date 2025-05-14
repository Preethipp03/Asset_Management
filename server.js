const express = require('express');
const { connectDB, ObjectId, getDB } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

const usersCollection = 'users';
const itemsCollection = 'items';

// Users Routes

// POST route to create a new user
app.post('/users', async (req, res) => {
  const { name, email, role } = req.body;

  // Check if name, email, and role are provided
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  // Validate role
  const validRoles = ['super_admin', 'admin', 'user'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be one of the following: super_admin, admin, or user' });
  }

  // Validate email format
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const db = await connectDB(); // Connect to the DB
    const collection = db.collection(usersCollection);
    const result = await collection.insertOne({ name, email, role });

    // Respond with the user data
    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertedId,
    });
  } catch (err) {
    console.error('Error in POST /users:', err);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});


// GET route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const db = await connectDB();  // Connect, and potentially reuse existing connection.
    const collection = db.collection(usersCollection);
    const users = await collection.find().toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// GET route to fetch a user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect, and potentially reuse existing connection.
    const collection = db.collection(usersCollection);
    const user = await collection.findOne(query);

    if (!user) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error fetching user with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// PUT route to update a user by ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;  // The data you want to update

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect to the database
    const collection = db.collection(usersCollection);

    // Update the user with the new data
    const result = await collection.updateOne(query, { $set: updatedData });

    if (result.matchedCount === 0) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with success
    res.status(200).json({ message: `User with ID: ${id} updated successfully` });
  } catch (err) {
    console.error(`Error updating user with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});


// DELETE route to delete a user by ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(usersCollection);
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If deletion was successful
    res.status(200).json({ message: `User with ID: ${id} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting user with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// PATCH route to partially update a user by ID
app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;  // The fields to be updated

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id }; // If not a valid ObjectId, treat it as a string ID
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(usersCollection);

    // Update the user with the provided fields
    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: `User with ID: ${id} updated successfully` });
  } catch (err) {
    console.error(`Error updating user with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});



// Items Routes

function validateItem(item) {
  if (!item.name || typeof item.name !== 'string') {
    throw new Error('Item name is required and should be a string.');
  }
  if (!item.price || typeof item.price !== 'number') {
    throw new Error('Item price is required and should be a number.');
  }
}

app.post('/items', async (req, res) => {
  console.log("POST /items hit!", req.body);

  try {
    const db = await connectDB();  // Connect, and potentially reuse existing connection.
    const collection = db.collection(itemsCollection);
    const item = req.body;
    validateItem(item);
    const result = await collection.insertOne(item);
    res.status(201).send({
      message: 'Item inserted',
      insertedId: result.insertedId
    });
  } catch (err) {
    console.error('Error in POST /items:', err);
    res.status(400).send({
      error: err.message
    });
  }
});

app.get('/items', async (req, res) => {
  try {
    const db = await connectDB();  // Connect, and potentially reuse existing connection.
    const collection = db.collection(itemsCollection);
    const items = await collection.find().toArray();
    res.status(200).send(items);
  } catch (err) {
    console.error('Error in GET /items:', err);
    res.status(500).send({
      error: 'Failed to fetch items'
    });
  }
});

// GET route to fetch an item by ID
app.get('/items/:id', async (req, res) => {
  const { id } = req.params;
  
  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };  // If not a valid ObjectId, handle it like a regular string ID
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(itemsCollection);
    const item = await collection.findOne(query);

    if (!item) {
      console.log(`Item not found with ID: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);  // Return the found item
  } catch (err) {
    console.error(`Error fetching item with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to fetch item', details: err.message });
  }
});
// PUT route to update an item by ID
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;  // The new data to update the item with

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(itemsCollection);

    // Update the item
    const result = await collection.updateOne(query, { $set: updatedData });

    if (result.matchedCount === 0) {
      console.log(`Item not found with ID: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: `Item with ID: ${id} updated successfully` });
  } catch (err) {
    console.error(`Error updating item with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});
// DELETE route to remove an item by ID
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(itemsCollection);

    // Delete the item
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      console.log(`Item not found with ID: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: `Item with ID: ${id} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting item with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

// PATCH route to partially update an item by ID
app.patch('/items/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;  // Only the fields that need to be updated

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { _id: id };
  }

  try {
    const db = await connectDB();  // Connect to DB
    const collection = db.collection(itemsCollection);

    // Update only the fields that are provided in the request body
    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      console.log(`Item not found with ID: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: `Item with ID: ${id} updated successfully` });
  } catch (err) {
    console.error(`Error updating item with ID: ${id}`, err);
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

// ===============================
// Start the Server
// ===============================
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB(); // Ensure DB connection is established *before* starting the server.
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    // Handle the error appropriately, maybe retry connection, or exit.
  }
}
startServer();

