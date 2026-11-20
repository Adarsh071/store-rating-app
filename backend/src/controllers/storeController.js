const db = require('../config/db');

// Get all stores with overall average rating and current user's submitted rating
// Supports search by name or address, and sorting
const getStores = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      email: 's.email',
      overallRating: 'overall_rating',
      created_at: 's.created_at'
    };

    const orderColumn = allowedSortFields[sortBy] || 's.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const searchQuery = `%${search.trim()}%`;

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS overall_rating,
        COUNT(r.id)::int AS total_ratings,
        (
          SELECT ur.rating 
          FROM ratings ur 
          WHERE ur.store_id = s.id AND ur.user_id = $1
        ) AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.name ILIKE $2 OR s.address ILIKE $2
      GROUP BY s.id
      ORDER BY ${orderColumn} ${orderDirection}
    `;

    const result = await db.query(sql, [currentUserId, searchQuery]);

    res.json({
      stores: result.rows
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error while fetching stores.' });
  }
};

module.exports = {
  getStores
};
