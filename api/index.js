/**
 * Vercel Serverless Entry Point
 * Exports the Express app as a serverless function handler.
 * Local development still uses server.js (which calls app.listen).
 */

require('dotenv').config();
const { connectDB } = require('../src/config/database');
const createApp = require('../src/app');

let appInstance = null;

async function getApp() {
  const t0 = Date.now();

  // connectDB() is a no-op on warm containers (readyState === 1)
  if (!appInstance) {
    console.log('[Serverless] Cold start — connecting to DB and creating app...');
    await connectDB();
    console.log(`[Serverless] DB ready in ${Date.now() - t0}ms`);
    appInstance = createApp();
    console.log(`[Serverless] App created in ${Date.now() - t0}ms total`);
  } else {
    // Warm container: still verify the connection is alive
    await connectDB();
  }

  return appInstance;
}

// Vercel exports a default async function
module.exports = async (req, res) => {
  const t0 = Date.now();
  console.log(`[Serverless] --> ${req.method} ${req.url}`);
  try {
    const app = await getApp();
    console.log(`[Serverless] getApp() resolved in ${Date.now() - t0}ms`);
    app(req, res);
  } catch (err) {
    console.error('[Serverless] Startup error:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
