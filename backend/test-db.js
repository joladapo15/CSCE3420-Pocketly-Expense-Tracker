
const pool = require('./db');

async function testConnection() {
  try {
    const result = await pool.query(
      'SELECT current_database(), current_user, version()'
    );

    console.log('Database connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('PostgreSQL:', result.rows[0].version.split(' ')[1]);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
