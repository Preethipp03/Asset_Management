const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Mongo URI:', uri);

const client = new MongoClient(uri);

let dbInstance = null; // Store the database instance

async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    if (!dbInstance) { // Only connect if not already connected
      await client.connect();
      console.log('Connected to MongoDB!');
      dbInstance = client.db(); // Store the database object
    }    
    return dbInstance; // Return the stored instance
  } catch (err) {
    console.error('Connection error:', err);
    // Instead of process.exit, throw the error.  This allows the application to *try* to continue.
    throw err; 
  }
}

// Function to get the database instance.  This is the preferred way to get the database.
function getDB() {
    if (!dbInstance) {
        throw new Error("Database not connected. Call connectDB() first.");
    }
    return dbInstance;
}

// Exporting ObjectId and the connectDB function
module.exports = { connectDB, ObjectId, getDB };
