const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "job_portal",
  waitForConnections: true,
  connectionLimit: 10,
})

async function updateDatabase() {
  try {
    console.log("Starting database update...")

    // Check if stage column exists in applications table
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM applications LIKE 'stage'
    `)

    // If stage column doesn't exist, add it
    if (columns.length === 0) {
      console.log("Adding 'stage' column to applications table...")
      await pool.query(`
        ALTER TABLE applications 
        ADD COLUMN stage VARCHAR(50) DEFAULT 'New'
      `)
      console.log("'stage' column added successfully!")
    } else {
      console.log("'stage' column already exists in applications table.")
    }

    console.log("Database update completed successfully!")
  } catch (error) {
    console.error("Error updating database:", error)
  } finally {
    await pool.end()
  }
}

updateDatabase()

