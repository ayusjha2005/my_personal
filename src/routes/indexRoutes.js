const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const { formatDate } = require('../utils/helpers');

// Home page
router.get('/', async (req, res, next) => {
  const t0 = Date.now();
  console.log('[Route] GET / — start');
  try {
    const [featuredBlogs, projects] = await Promise.all([
      Blog.find({ status: 'published' }).sort({ featured: -1, publishedAt: -1 }).limit(6).maxTimeMS(5000).lean(),
      Project.find({}).sort({ order: 1, createdAt: -1 }).maxTimeMS(5000).lean(),
    ]);
    console.log(`[Route] GET / — DB queries done in ${Date.now() - t0}ms`);

    res.render('pages/home', {
      pageTitle: 'Ayush Jha · tech blog',
      metaDescription: 'Personal technology blog and projects by Ayush Jha. Exploring backend engineering, systems, databases, and algorithms.',
      featuredBlogs,
      projects,
      formatDate,
    });
  } catch (err) {
    console.error(`[Route] GET / — error after ${Date.now() - t0}ms:`, err.message);
    next(err);
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('pages/about', {
    pageTitle: 'About Me · Ayush Jha',
    metaDescription:
      'Ayush Jha — Computer Science and Engineering student at VIT. Software engineer, backend systems builder, and technology learner.',
  });
});

// Technical Skills page
router.get('/skills', (req, res) => {
  res.render('pages/skills', {
    pageTitle: 'Technical Skills · Ayush Jha',
    metaDescription: 'Technical skills, programming languages, databases, tools, and areas of exploration of Ayush Jha.',
  });
});

// Writing Corner
router.get('/corner', async (req, res, next) => {
  try {
    const allBlogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 }).maxTimeMS(5000).lean();
    res.render('pages/corner', {
      pageTitle: 'Writing Corner · Ayush Jha',
      metaDescription: 'A small desk for drafts, half-thoughts, and reading notes by Ayush Jha.',
      allBlogs,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
});

const mongoose = require('mongoose');

// Health Check Endpoint (Production Monitoring)
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// XML Sitemap
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt').maxTimeMS(5000).lean();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = ['', '/about', '/skills', '/projects', '/writings', '/corner', '/contact'];
    staticPages.forEach((path) => {
      xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    // Dynamic blogs
    blogs.forEach((b) => {
      xml += `  <url>\n    <loc>${baseUrl}/writings/${b.slug}</loc>\n    <lastmod>${b.updatedAt ? b.updatedAt.toISOString() : new Date().toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

module.exports = router;
