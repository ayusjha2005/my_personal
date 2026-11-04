const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, redirectIfAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');

const User = require('../models/User');

// Authentication
router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', authLimiter, authController.postLogin);
router.get('/logout', authController.logout);

// One-time setup: create admin user if none exists (uses server's own DB)
router.get('/setup', async (req, res) => {
  try {
    const count = await User.countDocuments({});
    if (count > 0) {
      return res.send(`
        <p>Admin already exists. <a href="/admin/login">Go to login →</a></p>
      `);
    }
    const username = process.env.ADMIN_USERNAME || 'ayush';
    const email = process.env.ADMIN_EMAIL || 'reach2kr.ayush@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123456';
    const passwordHash = await User.hashPassword(password);
    await User.create({ username, email, passwordHash, role: 'admin' });
    res.send(`
      <p>✅ Initial admin account initialized. <a href="/admin/login">Go to login →</a></p>
    `);
  } catch (err) {
    res.status(500).send('Setup failed: ' + err.message);
  }
});

// Protected Admin Dashboard
router.use(ensureAuthenticated);

router.get('/', adminController.getDashboard);

// Blog / Writings Management
router.get('/blogs', adminController.getBlogs);
router.get('/blogs/new', adminController.getNewBlog);
router.post('/blogs/new', upload.single('coverImage'), adminController.postNewBlog);
router.get('/blogs/edit/:id', adminController.getEditBlog);
router.post('/blogs/edit/:id', upload.single('coverImage'), adminController.putEditBlog);
router.post('/blogs/delete/:id', adminController.deleteBlog);

// Writings aliases
router.get('/writings', adminController.getBlogs);
router.get('/writings/new', adminController.getNewBlog);
router.post('/writings/new', upload.single('coverImage'), adminController.postNewBlog);
router.get('/writings/edit/:id', adminController.getEditBlog);
router.post('/writings/edit/:id', upload.single('coverImage'), adminController.putEditBlog);
router.post('/writings/delete/:id', adminController.deleteBlog);

// Comments Moderation
router.get('/comments', adminController.getComments);
router.post('/comments/delete/:id', adminController.deleteComment);
router.post('/comments/toggle/:id', adminController.postToggleCommentStatus);

// Settings Management
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.postSettings);

// Project Management
router.get('/projects', adminController.getProjects);
router.get('/projects/new', adminController.getNewProject);
router.post('/projects/new', upload.single('image'), adminController.postNewProject);
router.get('/projects/edit/:id', adminController.getEditProject);
router.post('/projects/edit/:id', upload.single('image'), adminController.putEditProject);
router.post('/projects/delete/:id', adminController.deleteProject);

// Contact Management
router.get('/contacts', adminController.getContacts);
router.post('/contacts/toggle/:id', adminController.postToggleContactStatus);
router.post('/contacts/delete/:id', adminController.deleteContact);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
