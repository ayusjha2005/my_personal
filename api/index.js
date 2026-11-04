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
  // Ensure connection is active (instant return if already connected)
  await connectDB();
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

// Vercel exports a default async function
module.exports = async (req, res) => {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err) {
    console.error('[Serverless] Startup error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
