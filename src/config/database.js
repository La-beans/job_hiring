// Import the mysql2 library for MySQL database interaction
const mysql = require('mysql2');
// Import the dotenv library to load environment variables from a .env file
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

// Create a connection pool to the MySQL database using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true, // Wait for connections if none are available
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0 // Maximum number of queued connection requests (0 means no limit)
});

// Export the connection pool as a promise-based interface
module.exports = pool.promise();