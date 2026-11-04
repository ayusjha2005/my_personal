const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Blog listing page
router.get('/', blogController.getBlogs);

// Individual blog page
router.get('/:slug', blogController.getBlogBySlug);

// Post comment on article
router.post('/:slug/comments', blogController.postComment);

module.exports = router;
