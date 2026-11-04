const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const viewGlobals = require('./middleware/viewGlobals');
const indexRoutes = require('./routes/indexRoutes');
const blogRoutes = require('./routes/blogRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contactRoutes = require('./routes/contactRoutes');
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes');

function createApp() {
  const app = express();

  // Trust proxy for secure cookies on Render / reverse proxies
  app.set('trust proxy', 1);

  // Security headers with relaxed CSP for inline canvas and animation scripts
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Gzip / Deflate compression
  app.use(compression());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.SESSION_SECRET || 'ayush-tech-blog-secret-key-2026'));

  // Static assets
  const publicDir = path.join(__dirname, '../public');
  app.use(express.static(publicDir, { maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 }));

  // View engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // Session configuration
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'ayush-tech-blog-session-secret-98234710',
    resave: false,
    saveUninitialized: false,
    name: 'ayush_session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  };

  // Attach MongoStore if mongoose is connected
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    sessionConfig.store = MongoStore.create({
      clientPromise: mongoose.connection.asPromise().then((conn) => conn.getClient()),
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
    });
  }

  app.use(session(sessionConfig));

  // Global view variables & flash messages
  app.use(viewGlobals);

  // Route Mounting
  app.use('/', indexRoutes);
  app.use('/writings', blogRoutes);
  app.use('/writing', blogRoutes);
  app.use('/blogs', blogRoutes);
  app.use('/blog', blogRoutes); // Support legacy /blogs and /blog/:slug
  app.use('/projects', projectRoutes);
  app.use('/contact', contactRoutes);
  app.use('/api', apiRoutes);
  app.use('/admin', adminRoutes);

  // 404 Handler
  app.use((req, res, next) => {
    res.status(404).render('pages/404', {
      pageTitle: 'Page Not Found · 404',
      message: 'The page you requested could not be found.',
    });
  });

  // Central Error Handler
  app.use((err, req, res, next) => {
    console.error('[Application Error]:', err);
    const status = err.statusCode || 500;
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(status).json({
        success: false,
        error: err.message || 'Internal Server Error',
      });
    }

    res.status(status).render('pages/404', {
      pageTitle: 'Error · Something went wrong',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    });
  });

  return app;
}

module.exports = createApp;
