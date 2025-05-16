// index.js
const connectDB = require('./db');  // Import the connectDB function

async function main() {
  console.log('Starting connection...');
  
  const db = await connectDB();  // Use the connectDB function here
  console.log('Connected to database!');
  
  const collection = db.collection('items');
  const insertResult = await collection.insertMany([
    { name: 'Keyboard', price: 50 },
    { name: 'Monitor', price: 200 }
  ]);
  
  const result = await collection.insertOne({ name: 'Test Document', date: new Date() });
  console.log('Document inserted:', result.insertedId);
}

main().catch(err => console.error('Error:', err));
