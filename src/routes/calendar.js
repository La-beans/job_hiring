const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const pool = require("../config/database")

// Staff calendar view
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Fetch jobs from database
    const [jobs] = await pool.query(`
      SELECT id, title, icon, start_date, end_date, color_scheme
      FROM jobs
      ORDER BY start_date
    `)

    // Process jobs for display
    const processedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      icon: job.icon,
      startDate: formatDate(job.start_date),
      endDate: formatDate(job.end_date),
      colorScheme: job.color_scheme,
    }))

    const currentMonth = getCurrentMonthName()

    res.render("calendar/index", {
      title: "Job Calendar",
      jobs: processedJobs,
      currentMonth,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading calendar",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Applicant calendar view
router.get("/applicant", isAuthenticated, async (req, res) => {
  try {
    // Fetch jobs from database
    const [jobs] = await pool.query(`
      SELECT id, title, icon, start_date, end_date, color_scheme
      FROM jobs
      ORDER BY start_date
    `)

    // Process jobs for display
    const processedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      icon: job.icon,
      startDate: formatDate(job.start_date),
      endDate: formatDate(job.end_date),
      colorScheme: job.color_scheme,
    }))

    const currentMonth = getCurrentMonthName()

    res.render("calendar/applicant", {
      title: "Job Calendar",
      jobs: processedJobs,
      currentMonth,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading calendar",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Helper function to format date
function formatDate(date) {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

// Helper function to get current month name
function getCurrentMonthName() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

module.exports = router

