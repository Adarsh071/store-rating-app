const express = require('express');
const router = express.Router();
const { signup, login, changePassword, getMe } = require('../controllers/authController');
const { validateSignup, validatePasswordChange } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.put('/change-password', verifyToken, validatePasswordChange, changePassword);
router.get('/me', verifyToken, getMe);

module.exports = router;
