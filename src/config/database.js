const mongoose = require('mongoose');

let mongodInstance = null;

/**
 * A Promise that resolves to the native MongoClient once connectDB() completes.
 * Assigned once — reused across all serverless invocations and by MongoStore.
 */
let _clientPromiseResolve;
let _clientPromiseReject;
const clientPromise = new Promise((resolve, reject) => {
  _clientPromiseResolve = resolve;
  _clientPromiseReject = reject;
});

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
      // Resolve the shared clientPromise so MongoStore can acquire the native client
      _clientPromiseResolve(mongoose.connection.getClient());
      return mongoose.connection;
    } catch (err) {
      console.error('Failed to connect to configured MONGODB_URI:', err.message);
      _clientPromiseReject(err);
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
    // Resolve clientPromise for in-memory dev connection too
    _clientPromiseResolve(mongoose.connection.getClient());
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

module.exports = { connectDB, closeDB, clientPromise };
