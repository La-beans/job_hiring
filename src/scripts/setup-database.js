const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
})

async function setupDatabase() {
  try {
    // Create applicants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create staff table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert predetermined staff accounts
    const staffAccounts = [
      { name: "Admin User", email: "admin@example.com", password: "adminpass" },
      { name: "HR Manager", email: "hr@example.com", password: "hrpass" },
      { name: "Recruiter", email: "recruiter@example.com", password: "recruiterpass" },
    ]

    for (const account of staffAccounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10)
      await pool.query("INSERT IGNORE INTO staff (name, email, password) VALUES (?, ?, ?)", [
        account.name,
        account.email,
        hashedPassword,
      ])
    }

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await pool.end()
  }
}

setupDatabase()

