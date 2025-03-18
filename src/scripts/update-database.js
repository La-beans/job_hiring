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
    const [stageColumns] = await pool.query(`
      SHOW COLUMNS FROM applications LIKE 'stage'
    `)

    // If stage column doesn't exist, add it
    if (stageColumns.length === 0) {
      console.log("Adding 'stage' column to applications table...")
      await pool.query(`
        ALTER TABLE applications 
        ADD COLUMN stage VARCHAR(50) DEFAULT 'New'
      `)
      console.log("'stage' column added successfully!")
    } else {
      console.log("'stage' column already exists in applications table.")
    }

    // Check if icon column exists in jobs table
    const [iconColumns] = await pool.query(`
      SHOW COLUMNS FROM jobs LIKE 'icon'
    `)

    // If icon column doesn't exist, add it
    if (iconColumns.length === 0) {
      console.log("Adding 'icon' column to jobs table...")
      await pool.query(`
        ALTER TABLE jobs 
        ADD COLUMN icon VARCHAR(10) DEFAULT '💼'
      `)
      console.log("'icon' column added successfully!")
    } else {
      console.log("'icon' column already exists in jobs table.")
    }

    // Check if color_scheme column exists in jobs table
    const [colorSchemeColumns] = await pool.query(`
      SHOW COLUMNS FROM jobs LIKE 'color_scheme'
    `)

    // If color_scheme column doesn't exist, add it
    if (colorSchemeColumns.length === 0) {
      console.log("Adding 'color_scheme' column to jobs table...")
      await pool.query(`
        ALTER TABLE jobs 
        ADD COLUMN color_scheme VARCHAR(50) DEFAULT 'blue'
      `)
      console.log("'color_scheme' column added successfully!")
    } else {
      console.log("'color_scheme' column already exists in jobs table.")
    }

    // Check if cv_filename column exists in applications table
    const [cvFilenameColumns] = await pool.query(`
      SHOW COLUMNS FROM applications LIKE 'cv_filename'
    `)

    // If cv_filename column doesn't exist, add it
    if (cvFilenameColumns.length === 0) {
      console.log("Adding document-related columns to applications table...")
      await pool.query(`
        ALTER TABLE applications 
        ADD COLUMN cv_filename VARCHAR(255),
        ADD COLUMN cv_original_name VARCHAR(255),
        ADD COLUMN cv_mime_type VARCHAR(100)
      `)
      console.log("Document-related columns added successfully!")
    } else {
      console.log("Document-related columns already exist in applications table.")
    }

    // Add some sample document data for testing
    console.log("Adding sample document data...")
    const [applications] = await pool.query(`
      SELECT id FROM applications LIMIT 10
    `)

    for (const app of applications) {
      await pool.query(
        `
        UPDATE applications 
        SET 
          cv_filename = CONCAT('resume_', id, '.pdf'),
          cv_original_name = CONCAT('Resume_', id, '.pdf'),
          cv_mime_type = 'application/pdf'
        WHERE id = ? AND cv_filename IS NULL
      `,
        [app.id],
      )
    }
    console.log("Sample document data added successfully!")

    console.log("Database update completed successfully!")
  } catch (error) {
    console.error("Error updating database:", error)
  } finally {
    await pool.end()
  }
}

updateDatabase()

