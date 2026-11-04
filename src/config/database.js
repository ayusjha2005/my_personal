const mongoose = require('mongoose');

let mongodInstance = null;
let _clientPromiseSettled = false;

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
// Prevent unhandled rejection if nothing awaits clientPromise before it rejects
clientPromise.catch(() => {});

async function connectDB() {
  // Reuse existing connection across serverless invocations
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    console.log('[DB] Reusing existing MongoDB connection (readyState=1)');
    return mongoose.connection;
  }
  if (mongoose.connection && mongoose.connection.readyState === 2) {
    console.log('[DB] Connection in progress (readyState=2), awaiting...');
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log('[DB] Connecting to MongoDB Atlas...');
      const t0 = Date.now();
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,   // fail fast if Atlas is unreachable
        connectTimeoutMS: 8000,
        socketTimeoutMS: 30000,
        // CRITICAL: do not buffer queries while disconnected — fail fast
        bufferCommands: false,
      });
      console.log(`[DB] MongoDB connected in ${Date.now() - t0}ms to: ${mongoose.connection.host}`);
      if (!_clientPromiseSettled) {
        _clientPromiseSettled = true;
        _clientPromiseResolve(mongoose.connection.getClient());
      }
      return mongoose.connection;
    } catch (err) {
      console.error('[DB] Failed to connect to MONGODB_URI:', err.message);
      if (!_clientPromiseSettled) {
        _clientPromiseSettled = true;
        _clientPromiseReject(err);
      }
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('[DB] Falling back to local in-memory MongoDB for development/testing...');
    }
  }

  // Fallback for local development if no MONGODB_URI is provided or connection failed
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log('[DB] Starting in-memory MongoDB instance at:', memoryUri);
    await mongoose.connect(memoryUri, { bufferCommands: false });
    console.log('[DB] In-memory MongoDB connected successfully for local development.');
    if (!_clientPromiseSettled) {
      _clientPromiseSettled = true;
      _clientPromiseResolve(mongoose.connection.getClient());
    }
    return mongoose.connection;
  } catch (err) {
    console.error('[DB] In-memory MongoDB fallback error:', err.message);
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
