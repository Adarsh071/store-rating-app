const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/storeOwnerController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/dashboard', verifyToken, requireRole('STORE_OWNER'), getOwnerDashboard);

module.exports = router;
