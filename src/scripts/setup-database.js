const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
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

async function setupDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "job_portal"}`)

    // Use the database
    await pool.query(`USE ${process.env.DB_NAME || "job_portal"}`)

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

    // Create jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(100) NOT NULL,
        experience VARCHAR(100) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        color_scheme VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES staff(id)
      )
    `)

    // Create applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        applicant_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        alternate_phone VARCHAR(20),
        street VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        previously_worked BOOLEAN DEFAULT FALSE,
        stage VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (applicant_id) REFERENCES applicants(id)
      )
    `)

    // Insert predetermined staff accounts
    const staffAccounts = [
      { name: "Admin User", email: "WRiNonChris@gmail.com", password: "Areallystrongpasswrd123!@#" },
      { name: "HR Manager", email: "R.ocloo@lancaster.edu.gh", password: "LancasterHR" },
      { name: "Recruiter", email: "S.Amandatawiah@lancaster.edu.gh", password: "LancasterHR" },
    ]

    for (const account of staffAccounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10)
      await pool.query("INSERT IGNORE INTO staff (name, email, password) VALUES (?, ?, ?)", [
        account.name,
        account.email,
        hashedPassword,
      ])
    }

    // Insert sample jobs if none exist
    const [jobCount] = await pool.query("SELECT COUNT(*) as count FROM jobs")
    if (jobCount[0].count === 0) {
      // Get the first staff ID
      const [staff] = await pool.query("SELECT id FROM staff LIMIT 1")
      const staffId = staff[0].id

      // Sample jobs
      const sampleJobs = [
        {
          title: "Sr. UX Designer",
          description:
            "We are seeking a talented Sr. UX Designer to join our dynamic team. This is an exciting opportunity for someone who wants to make an impact and grow their career.",
          location: "Bengaluru",
          experience: "3 years exp.",
          icon: "🎨",
          color_scheme: "blue",
          start_date: "2023-03-01",
          end_date: "2023-04-01",
        },
        {
          title: "Growth Manager",
          description:
            "We are looking for a Growth Manager to help scale our business. This person will be responsible for identifying and executing growth opportunities.",
          location: "Remote",
          experience: "2+ years exp.",
          icon: "🚀",
          color_scheme: "red",
          start_date: "2023-03-05",
          end_date: "2023-04-05",
        },
        {
          title: "Financial Analyst",
          description:
            "Join our finance team as a Financial Analyst. You will be responsible for financial planning, analysis, and reporting.",
          location: "Mumbai",
          experience: "5+ years exp.",
          icon: "💰",
          color_scheme: "yellow",
          start_date: "2023-03-10",
          end_date: "2023-04-10",
        },
      ]

      for (const job of sampleJobs) {
        await pool.query(
          `INSERT INTO jobs (title, description, location, experience, icon, color_scheme, start_date, end_date, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            job.title,
            job.description,
            job.location,
            job.experience,
            job.icon,
            job.color_scheme,
            job.start_date,
            job.end_date,
            staffId,
          ],
        )
      }
    }

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await pool.end()
  }
}

setupDatabase()

