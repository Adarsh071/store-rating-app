const express = require('express');
const router = express.Router();
const { submitOrUpdateRating } = require('../controllers/ratingController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Normal users can submit or modify ratings
router.post('/', verifyToken, requireRole('NORMAL_USER'), submitOrUpdateRating);

module.exports = router;
