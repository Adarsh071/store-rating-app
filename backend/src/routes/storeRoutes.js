const express = require('express');
const router = express.Router();
const { getStores } = require('../controllers/storeController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get all stores with user-specific rating
router.get('/', verifyToken, getStores);

module.exports = router;
