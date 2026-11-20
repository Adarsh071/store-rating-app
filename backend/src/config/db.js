const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database schema and tables initialization
const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'NORMAL_USER', 'STORE_OWNER')) DEFAULT 'NORMAL_USER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Stores Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Ratings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
      );
    `);

    // 4. Seed Default Admin if not exists
    const adminCheck = await client.query('SELECT * FROM users WHERE role = $1 LIMIT 1', ['ADMIN']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await client.query(`
        INSERT INTO users (name, email, password, address, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'Super System Administrator', // 26 chars
        'admin@storerating.com',
        hashedPassword,
        'Headquarters Office, Cyber City, Tech Park',
        'ADMIN'
      ]);
      console.log('Default Admin created: admin@storerating.com / Admin@123456');
    }

    client.release();
    console.log('Database tables verified successfully.');
  } catch (err) {
    console.error('Database connection or initialization error:', err.message);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB
};
