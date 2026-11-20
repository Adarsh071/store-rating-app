const db = require('../config/db');

// Store Owner Dashboard: View store stats & list of users who rated their store
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'rating', sortOrder = 'desc' } = req.query;

    // Find the store owned by this user
    const storeResult = await db.query(
      'SELECT id, name, email, address FROM stores WHERE owner_id = $1 LIMIT 1',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No store is currently associated with your account.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratingsList: []
      });
    }

    const store = storeResult.rows[0];

    // Compute average rating and count
    const statsResult = await db.query(`
      SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
        COUNT(*)::int AS total_ratings
      FROM ratings
      WHERE store_id = $1
    `, [store.id]);

    const stats = statsResult.rows[0];

    // Allowed sort columns for the ratings table
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      submittedAt: 'r.created_at'
    };

    const orderColumn = allowedSortFields[sortBy] || 'r.created_at';
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Fetch users who rated this store
    const ratingsQuery = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at AS submitted_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY ${orderColumn} ${orderDirection}
    `;

    const ratingsList = await db.query(ratingsQuery, [store.id]);

    res.json({
      hasStore: true,
      store,
      averageRating: stats.average_rating,
      totalRatings: stats.total_ratings,
      ratingsList: ratingsList.rows
    });
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    res.status(500).json({ message: 'Internal server error while fetching owner dashboard.' });
  }
};

module.exports = {
  getOwnerDashboard
};
