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

async function fixDatabase() {
  try {
    console.log("Starting emergency database fix...")

    // Check if the jobs table exists
    const [tables] = await pool.query(`
      SHOW TABLES LIKE 'jobs'
    `)

    if (tables.length === 0) {
      console.error("Jobs table doesn't exist! Please run the setup-database.js script first.")
      return
    }

    // Get current columns in jobs table
    const [jobsColumns] = await pool.query(`
      SHOW COLUMNS FROM jobs
    `)

    const jobsColumnNames = jobsColumns.map((col) => col.Field)

    // Add missing columns to jobs table
    const missingJobsColumns = []

    if (!jobsColumnNames.includes("icon")) {
      missingJobsColumns.push("ADD COLUMN icon VARCHAR(10) DEFAULT '💼'")
    }

    if (!jobsColumnNames.includes("color_scheme")) {
      missingJobsColumns.push("ADD COLUMN color_scheme VARCHAR(50) DEFAULT 'blue'")
    }

    if (missingJobsColumns.length > 0) {
      const alterJobsQuery = `ALTER TABLE jobs ${missingJobsColumns.join(", ")}`
      console.log(`Executing: ${alterJobsQuery}`)
      await pool.query(alterJobsQuery)
      console.log("Added missing columns to jobs table!")
    } else {
      console.log("No missing columns in jobs table.")
    }

    // Check if applications table exists
    const [appTables] = await pool.query(`
      SHOW TABLES LIKE 'applications'
    `)

    if (appTables.length > 0) {
      // Get current columns in applications table
      const [appsColumns] = await pool.query(`
        SHOW COLUMNS FROM applications
      `)

      const appsColumnNames = appsColumns.map((col) => col.Field)

      // Add missing columns to applications table
      if (!appsColumnNames.includes("stage")) {
        console.log("Adding 'stage' column to applications table...")
        await pool.query(`
          ALTER TABLE applications 
          ADD COLUMN stage VARCHAR(50) DEFAULT 'New'
        `)
        console.log("'stage' column added successfully!")
      } else {
        console.log("'stage' column already exists in applications table.")
      }
    }

    console.log("Database fix completed successfully!")
  } catch (error) {
    console.error("Error fixing database:", error)
    console.error("Full error details:", error)
  } finally {
    await pool.end()
  }
}

fixDatabase()

