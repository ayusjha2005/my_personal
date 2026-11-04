const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

router.get('/', contactController.getContact);
router.post('/', contactLimiter, contactController.postContact);
router.post('/subscribe', contactController.postSubscribe);

module.exports = router;
