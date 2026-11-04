const mongoose = require('mongoose');

let mongodInstance = null;

async function connectDB() {
  // Reuse existing connection across serverless invocations
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection && mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log('Connecting to MongoDB Atlas / configured URI...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB connected successfully to:', mongoose.connection.host);
      return mongoose.connection;
    } catch (err) {
      console.error('Failed to connect to configured MONGODB_URI:', err.message);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('Falling back to local in-memory MongoDB for development/testing...');
    }
  }

  // Fallback for local development if no MONGODB_URI is provided or connection failed
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log('Starting in-memory MongoDB instance at:', memoryUri);
    await mongoose.connect(memoryUri);
    console.log('In-memory MongoDB connected successfully for local development.');
    return mongoose.connection;
  } catch (err) {
    console.error('In-memory MongoDB fallback error:', err.message);
    throw err;
  }
}

async function closeDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
