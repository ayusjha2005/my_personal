const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const projectController = require('../controllers/projectController');
const contactController = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

// Posts & Writings API
router.get('/posts', blogController.apiGetPosts);
router.get('/posts/:slug', blogController.apiGetPost);
router.post('/posts/:slug/view', blogController.apiTrackView);
router.post('/posts/:slug/like', blogController.apiLikePost);
router.post('/writings/:slug/like', blogController.apiLikePost);

// Comments API
router.post('/comments/:id/like', blogController.apiLikeComment);

// Projects API
router.get('/projects', projectController.apiGetProjects);

// Contact & Subscribe API
router.post('/contact', contactLimiter, contactController.postContact);
router.post('/subscribe', contactController.postSubscribe);

// Dynamic Notes for Writing Corner
router.get('/notes', (req, res) => {
  res.json([
    { date: 'oct 2026', text: 'Benchmarking memory overhead in custom C++ STL allocators.' },
    { date: 'sep 2026', text: 'Idea: an architectural pattern for offline-first clinical workflow sync.' },
    { date: 'aug 2026', text: 'Testing composite indexes vs partial indexes on high-throughput MongoDB collections.' },
    { date: 'jul 2026', text: 'Documenting the difference between horizontal pod autoscaling on queue depth vs CPU.' },
  ]);
});

// Socials API
router.get('/socials', (req, res) => {
  res.json({
    github: {
      label: 'GitHub',
      handle: '@ayusjha2005',
      url: 'https://github.com/ayusjha2005',
      c: '#ffffff',
      badge: 'gh',
    },
    linkedin: {
      label: 'LinkedIn',
      handle: 'in/kumar-ayush',
      url: 'https://www.linkedin.com/in/kumar-ayush-322294385/',
      c: '#0a66c2',
      badge: 'in',
    },
    twitter: {
      label: 'Twitter / X',
      handle: '@ayushjha2005',
      url: 'https://x.com/ayushjha2005',
      c: '#1d9bf0',
      badge: 'x',
    },
    email: {
      label: 'Email',
      handle: process.env.CONTACT_EMAIL || 'reach2kr.ayush@gmail.com',
      url: `mailto:${process.env.CONTACT_EMAIL || 'reach2kr.ayush@gmail.com'}`,
      c: '#e5353b',
      badge: '@',
    },
  });
});

// Config API
router.get('/config', (req, res) => {
  res.json({
    profile: {
      name: 'Ayush Jha',
      displayName: 'Ayush Jha',
      handle: 'ayush',
      tagline: 'exploring technology · building things · sharing what I learn',
      email: process.env.CONTACT_EMAIL || 'ayush@ayushjha.dev',
      bio: "I'm Ayush — a computer science student, developer, and technology enthusiast who enjoys understanding how things work behind the screen. From writing algorithms and designing databases to building full-stack applications, I enjoy exploring different areas of computer science and turning ideas into working projects.",
    },
    site: {
      title: 'Ayush Jha · tech blog',
      description: 'Notes on backend engineering, databases, algorithms, and technology by Ayush Jha.',
    },
  });
});

module.exports = router;
