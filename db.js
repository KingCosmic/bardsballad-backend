// const mysql = require('mysql2/promise');

// const db = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'mydatabase'
// });

const connectDB = async () => {
  // try {
  //   await db.connect();
  //   console.log('Database connected successfully');
  // } catch (err) {
  //   console.error('Database connection error:', err);
  // }
};

module.exports = { db, connectDB };