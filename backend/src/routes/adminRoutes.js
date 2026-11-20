const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  addStore,
  getStoresList,
  getUsersList
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// All routes here require ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.post('/users', addUser);
router.post('/stores', addStore);
router.get('/stores', getStoresList);
router.get('/users', getUsersList);

module.exports = router;
