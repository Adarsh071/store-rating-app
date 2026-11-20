const db = require('../config/db');

// Submit or Modify rating for a store
const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    // Verify store exists
    const storeCheck = await db.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Upsert rating (insert if new, update if already exists)
    const sql = `
      INSERT INTO ratings (user_id, store_id, rating, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
      RETURNING id, user_id, store_id, rating, updated_at;
    `;

    const result = await db.query(sql, [userId, storeId, numericRating]);

    res.status(200).json({
      message: 'Rating submitted successfully!',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ message: 'Internal server error while submitting rating.' });
  }
};

module.exports = {
  submitOrUpdateRating
};
