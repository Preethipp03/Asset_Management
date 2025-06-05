
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createSuperadmin() {
  // Connect to your MongoDB
  const uri = "mongodb://172.16.0.36:27017/mydatabase"; // Replace with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mydatabase'); // Replace with your DB name
    const users = db.collection('users');

    // Delete old superadmin (optional)
    await users.deleteOne({ role: "superadmin" });

    // Hash password
    const password = 'rProcess@123'; // Change this to your desired password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new superadmin user document
    const newSuperadmin = {
      name: "rProcess",
      email: "rprocess@gmail.com",
      password: hashedPassword,
      role: "super_admin"
    };

    // Insert new superadmin
    await users.insertOne(newSuperadmin);

    console.log('Superadmin created successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

createSuperadmin(); 

