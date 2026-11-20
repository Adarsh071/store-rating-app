const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { validateName, validateEmail, validatePassword, validateAddress } = require('../middlewares/validate');

// Dashboard statistics: Total users, Total stores, Total submitted ratings
const getDashboardStats = async (req, res) => {
  try {
    const usersCountResult = await db.query('SELECT COUNT(*)::int AS total FROM users');
    const storesCountResult = await db.query('SELECT COUNT(*)::int AS total FROM stores');
    const ratingsCountResult = await db.query('SELECT COUNT(*)::int AS total FROM ratings');

    res.json({
      totalUsers: usersCountResult.rows[0].total,
      totalStores: storesCountResult.rows[0].total,
      totalRatings: ratingsCountResult.rows[0].total
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error while fetching stats.' });
  }
};

// Add new user (ADMIN, NORMAL_USER, or STORE_OWNER)
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'NORMAL_USER' } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters long.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character.'
      });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address is required and must not exceed 400 characters.' });
    }

    const validRoles = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(`
      INSERT INTO users (name, email, password, address, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, address, role, created_at
    `, [name.trim(), email.toLowerCase().trim(), hashedPassword, address.trim(), role]);

    res.status(201).json({
      message: 'User created successfully!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Internal server error while adding user.' });
  }
};

// Add new store
const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length === 0 || name.trim().length > 60) {
      return res.status(400).json({ message: 'Store Name is required (maximum 60 characters).' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required for store.' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Store address is required (maximum 400 characters).' });
    }

    let validOwnerId = null;
    if (ownerId) {
      const ownerCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
      if (ownerCheck.rows.length > 0) {
        validOwnerId = ownerCheck.rows[0].id;
      }
    }

    const result = await db.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, address, owner_id, created_at
    `, [name.trim(), email.toLowerCase().trim(), address.trim(), validOwnerId]);

    res.status(201).json({
      message: 'Store added successfully!',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({ message: 'Internal server error while adding store.' });
  }
};

// Get stores list with details, rating, sorting and filters
const getStoresList = async (req, res) => {
  try {
    const { search = '', name = '', email = '', address = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      created_at: 's.created_at'
    };

    const orderColumn = allowedSortFields[sortBy] || 's.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let conditions = ['1=1'];
    let params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(s.name ILIKE $${params.length} OR s.email ILIKE $${params.length} OR s.address ILIKE $${params.length})`);
    }
    if (name) {
      params.push(`%${name.trim()}%`);
      conditions.push(`s.name ILIKE $${params.length}`);
    }
    if (email) {
      params.push(`%${email.trim()}%`);
      conditions.push(`s.email ILIKE $${params.length}`);
    }
    if (address) {
      params.push(`%${address.trim()}%`);
      conditions.push(`s.address ILIKE $${params.length}`);
    }

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS rating,
        COUNT(r.id)::int AS total_ratings,
        s.created_at
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY s.id, u.name
      ORDER BY ${orderColumn} ${orderDirection}
    `;

    const result = await db.query(sql, params);
    res.json({ stores: result.rows });
  } catch (error) {
    console.error('Error fetching admin stores list:', error);
    res.status(500).json({ message: 'Internal server error while fetching stores.' });
  }
};

// Get users list with filters (Name, Email, Address, Role) and sorting
// If user is STORE_OWNER, also include their store's rating
const getUsersList = async (req, res) => {
  try {
    const { search = '', name = '', email = '', address = '', role = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at'
    };

    const orderColumn = allowedSortFields[sortBy] || 'u.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let conditions = ['1=1'];
    let params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.address ILIKE $${params.length})`);
    }
    if (name) {
      params.push(`%${name.trim()}%`);
      conditions.push(`u.name ILIKE $${params.length}`);
    }
    if (email) {
      params.push(`%${email.trim()}%`);
      conditions.push(`u.email ILIKE $${params.length}`);
    }
    if (address) {
      params.push(`%${address.trim()}%`);
      conditions.push(`u.address ILIKE $${params.length}`);
    }
    if (role) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        CASE 
          WHEN u.role = 'STORE_OWNER' THEN (
            SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)
            FROM stores st
            JOIN ratings r ON st.id = r.store_id
            WHERE st.owner_id = u.id
          )
          ELSE NULL 
        END AS owner_store_rating,
        (
          SELECT st.name 
          FROM stores st 
          WHERE st.owner_id = u.id 
          LIMIT 1
        ) AS owned_store_name
      FROM users u
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderColumn} ${orderDirection}
    `;

    const result = await db.query(sql, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching admin users list:', error);
    res.status(500).json({ message: 'Internal server error while fetching users.' });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getStoresList,
  getUsersList
};
